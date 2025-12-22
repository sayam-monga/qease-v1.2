"use client"
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

interface ComponentData {
  id: string;
  type: string;
  x: number;
  y: number;
  props: Record<string, any>;
}

export default function WaitingRoom() {
  const { projectId } = useParams();
  const [status, setStatus] = useState<'loading' | 'waiting' | 'active'>('loading');
  const [position, setPosition] = useState<number | null>(null);
  const [project, setProject] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (!projectId) return;

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

  useEffect(() => {
    if (!projectId || !userId) return;

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

        newSocket.on('check_queue', () => {
             newSocket.emit('join_room', { projectId, userId });
        });
    }

    return () => {
        if (socket) socket.disconnect();
    };
  }, [projectId, userId]);


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

  if (project.config?.layout && Array.isArray(project.config.layout) && project.config.layout.length > 0) {
      return (
          <div
              className="min-h-screen relative overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: project.config.bgColor }}
          >
              <div
                  className="relative shadow-2xl bg-white"
                  style={{
                      width: 800,
                      height: 450,
                      backgroundColor: project.config.bgColor
                  }}
              >
                  {project.config.layout.map((comp: ComponentData) => (
                      <div
                          key={comp.id}
                          style={{
                              position: 'absolute',
                              left: comp.x,
                              top: comp.y,
                          }}
                      >
                          <RenderComponent comp={comp} position={position} />
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div
        className="min-h-screen flex flex-col items-center justify-center text-center p-8"
        style={{ backgroundColor: project.config?.bgColor || '#ffffff', color: project.config?.textColor || '#000000' }}
    >
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">{project.config?.title || "You are in line"}</h1>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-black/5 mb-8">
          <div className="text-6xl font-black mb-2">{position}</div>
          <div className="text-sm opacity-75 uppercase tracking-wider font-semibold">People ahead of you</div>
        </div>
        <p className="text-lg opacity-90 mb-8">{project.config?.message || "Thanks for your patience."}</p>
        <div className="animate-pulse flex justify-center"><div className="h-2 w-24 bg-current rounded-full opacity-20"></div></div>
        <div className="mt-8 text-xs opacity-50">Powered by Qease</div>
      </div>
    </div>
  );
}

function RenderComponent({ comp, position }: { comp: ComponentData, position: number | null }) {
    const style: React.CSSProperties = {
        width: comp.props.width,
        height: comp.props.height,
        backgroundColor: comp.props.backgroundColor,
        color: comp.props.color,
        fontSize: comp.props.fontSize,
        fontWeight: comp.props.fontWeight,
        textAlign: comp.props.textAlign as any,
        borderRadius: comp.props.borderRadius,
        boxShadow: comp.props.boxShadow,
        padding: comp.props.padding,
    };

    switch(comp.type) {
        case 'text':
            return <div style={style}>{comp.props.content}</div>;
        case 'queue_position':
            return (
                <div style={style}>
                    <div style={{ fontSize: (comp.props.fontSize || 48) * 0.4 }} className="opacity-70 uppercase tracking-wide mb-1">{comp.props.label}</div>
                    <div style={{ fontWeight: 'bold' }}>{position !== null ? position : '-'}</div>
                </div>
            );
        case 'wait_time':
            const waitTime = position ? Math.ceil(position * 2) : 0;
            return <div style={style}>{comp.props.prefix} {waitTime} mins</div>;
        case 'box':
        case 'card':
        case 'spacer':
            return <div style={style}></div>;
        case 'divider':
            return <div style={style}></div>;
        case 'image':
            return <img src={comp.props.src} style={{...style, objectFit: 'cover'}} alt="" />;
        case 'button':
            return <button style={style}>{comp.props.content}</button>;
        default:
            return null;
    }
}
