"use client"
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

export default function WaitingRoom() {
  const { projectId } = useParams();
  const [status, setStatus] = useState<'loading' | 'waiting' | 'active'>('loading');
  const [position, setPosition] = useState<number | null>(null);
  const [project, setProject] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string>('');

  // 1. Fetch Config
  useEffect(() => {
    if (!projectId) return;

    // Check if we already have a userId in localStorage
    let storedUserId = localStorage.getItem('qease_user_id');
    if (!storedUserId) {
        storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('qease_user_id', storedUserId);
    }
    setUserId(storedUserId);

    fetch(`http://localhost:3001/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => setProject(data))
      .catch(err => console.error("Failed to load project", err));
  }, [projectId]);

  // 2. Connect to Queue & Socket
  useEffect(() => {
    if (!projectId || !userId) return;

    // Join via API first to ensure we are in the system
    fetch('http://localhost:3001/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'active') {
            setStatus('active');
        } else {
            setStatus('waiting');
            setPosition(data.position);
            connectSocket();
        }
    });

    function connectSocket() {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log("Socket connected");
            newSocket.emit('join_room', { projectId, userId });
        });

        newSocket.on('queue_update', (data) => {
            console.log("Queue Update:", data);
            if (data.status === 'active') {
                setStatus('active');
                newSocket.disconnect();
            } else {
                setPosition(data.position);
            }
        });

        // Listen for generic broadcast to check again
        newSocket.on('check_queue', () => {
             // Re-fetch status manually or emit an event to ask for position
             // For MVP simplicity, we re-emit join_room or hit the status API
             newSocket.emit('join_room', { projectId, userId });
        });
    }

    return () => {
        if (socket) socket.disconnect();
    };
  }, [projectId, userId]); // Re-run if IDs change (shouldn't happen often)


  if (!project || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === 'active') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center p-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">You're In!</h1>
        <p className="text-lg text-gray-700 mb-8">It is now your turn to access the site.</p>
        <button className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition">
          Enter Website
        </button>
      </div>
    );
  }

  // Waiting State
  return (
    <div
        className="min-h-screen flex flex-col items-center justify-center text-center p-8"
        style={{ backgroundColor: project.config?.bgColor || '#ffffff', color: project.config?.textColor || '#000000' }}
    >
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <h1 className="text-3xl font-bold mb-6">{project.config?.title || "You are in line"}</h1>

        {/* Progress / Position */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-black/5 mb-8">
          <div className="text-6xl font-black mb-2">{position}</div>
          <div className="text-sm opacity-75 uppercase tracking-wider font-semibold">People ahead of you</div>
        </div>

        <p className="text-lg opacity-90 mb-8">
            {project.config?.message || "Thanks for your patience."}
        </p>

        <div className="animate-pulse flex justify-center">
            <div className="h-2 w-24 bg-current rounded-full opacity-20"></div>
        </div>

        <div className="mt-8 text-xs opacity-50">
            Powered by Qease
        </div>
      </div>
    </div>
  );
}
