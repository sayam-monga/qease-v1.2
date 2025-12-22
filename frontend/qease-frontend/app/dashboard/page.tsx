"use client"
import React, { useState, useEffect } from 'react';

// Simplified type definition based on backend
interface Project {
  id: string;
  name: string;
  ingressRate: number;
  maxActiveUsers: number;
  config: {
    title: string;
    message: string;
  }
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [ingressRate, setIngressRate] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ingressRate: Number(ingressRate) }),
      });
      if (res.ok) {
        setName('');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Virtual Waiting Room Dashboard</h1>

        {/* Create Project Card */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Waiting Room</h2>
          <form onSubmit={createProject} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Black Friday Sale"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (users/min)</label>
              <input
                type="number"
                value={ingressRate}
                onChange={(e) => setIngressRate(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
                min="1"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-4">ID: {p.id}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-medium">{p.ingressRate} users/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Config:</span>
                  <span className="font-medium truncate">{p.config?.title}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <a
                  href={`/waiting-room/${p.id}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Waiting Room &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
