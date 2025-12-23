const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');
const queueService = require('./services/queueService');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

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
app.use('/api/auth', authRoutes);

// Create a Project (Waiting Room)
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const { name, ingressRate, maxActiveUsers, config } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        ingressRate: ingressRate || 10,
        maxActiveUsers: maxActiveUsers || 100,
        userId: req.user.userId,
        config: {
          create: {
            title: config?.title || "You are in line",
            message: config?.message || "Thanks for waiting.",
            bgColor: config?.bgColor || "#000000",
            textColor: config?.textColor || "#ffffff"
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
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
        where: { userId: req.user.userId },
        include: { config: true }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Update Project Config & Layout
app.put('/api/projects/:projectId/config', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { layout, bgColor, textColor, title, message } = req.body;

    // Upsert the config
    const config = await prisma.waitingRoomConfig.upsert({
      where: { projectId },
      create: {
        projectId,
        layout: layout || undefined,
        bgColor,
        textColor,
        title,
        message
      },
      update: {
        layout: layout || undefined,
        bgColor,
        textColor,
        title,
        message
      }
    });

    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update configuration' });
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
