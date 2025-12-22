const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');
const queueService = require('./services/queueService');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for MVP
    methods: ["GET", "POST"]
  }
});
const prisma = new PrismaClient();

app.use(cors());
app.use(helmet());
app.use(express.json());

// --- API Endpoints ---

// Create a Project (Waiting Room)
app.post('/api/projects', async (req, res) => {
  try {
    const { name, ingressRate, maxActiveUsers, config } = req.body;
    // For MVP, creating a dummy user if not auth'd, or just assume one user
    // We'll Create a default user if none exists for simplicity
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: 'hashed_password_placeholder'
        }
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        ingressRate: ingressRate || 10,
        maxActiveUsers: maxActiveUsers || 100,
        userId: user.id,
        config: {
          create: {
            title: config?.title || "You are in line",
            message: config?.message || "Thanks for waiting.",
            bgColor: config?.bgColor || "#ffffff",
            textColor: config?.textColor || "#000000"
          }
        }
      },
      include: { config: true }
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get Project Config
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { config: true }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get all projects (for dashboard)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
        include: { config: true }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});


// Join Queue (HTTP fallback / Initial Entry)
app.post('/api/queue/join', async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.body.userId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if already allowed
    const allowed = await queueService.isAllowed(projectId, userId);
    if (allowed) {
      return res.json({ status: 'active', userId });
    }

    // Enqueue
    await queueService.enqueue(projectId, userId);
    const position = await queueService.getPosition(projectId, userId);

    res.json({ status: 'waiting', userId, position });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

// Check Status (for polling integration scripts)
app.get('/api/queue/status', async (req, res) => {
    try {
        const { projectId, userId } = req.query;
        if (!projectId || !userId) return res.status(400).json({error: 'Missing projectId or userId'});

        const allowed = await queueService.isAllowed(projectId, userId);
        if (allowed) return res.json({ status: 'active' });

        const position = await queueService.getPosition(projectId, userId);
        if (position === null) return res.json({ status: 'not_found' });

        res.json({ status: 'waiting', position });
    } catch (error) {
        res.status(500).json({ error: 'Error checking status'});
    }
});

// --- Socket.IO Realtime ---

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('join_room', async ({ projectId, userId }) => {
    socket.join(projectId);
    console.log(`User ${userId} joined room ${projectId}`);

    // Send immediate update
    const allowed = await queueService.isAllowed(projectId, userId);
    if (allowed) {
      socket.emit('queue_update', { status: 'active' });
    } else {
      const position = await queueService.getPosition(projectId, userId);
      socket.emit('queue_update', { status: 'waiting', position });
    }
  });

  socket.on('disconnect', () => {
    // console.log('Client disconnected');
  });
});

// --- Background Worker Simulation (Inline for MVP) ---
// In production, this should be a separate process/service
setInterval(async () => {
    try {
        // Ideally iterate over active projects. For MVP we'll just process all projects found in DB
        // Or simpler: We just process known projects if we had a cache.
        // Let's fetch all projects (inefficient for large scale, ok for MVP)
        const projects = await prisma.project.findMany();

        for (const project of projects) {
            // Simple logic: Dequeue 10% of ingressRate every minute?
            // Or simplified: Dequeue 1 user every 5 seconds per project?
            // Let's use ingressRate (users per minute) / 12 (every 5s)
            const batchSize = Math.max(1, Math.ceil(project.ingressRate / 12));

            const activatedUsers = await queueService.dequeue(project.id, batchSize);

            if (activatedUsers.length > 0) {
                console.log(`Dequeued ${activatedUsers.length} users for project ${project.name}`);

                // Notify specific users via Socket is hard without mapping userId -> socketId
                // Instead, we broadcast to the room "update_positions" to force everyone to re-check/receive new pos?
                // Or better: Iterate active users and emit?
                // For MVP: We will emit a generic 'queue_moved' event to the room,
                // and clients will request their new position via the existing socket connection logic?
                // Actually, we can just broadcast the new head of the line info?

                // Simplest for MVP: Broadcast to room "check_queue".
                io.to(project.id).emit('check_queue');
            }
        }
    } catch (err) {
        console.error("Worker error:", err);
    }
}, 5000);


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
