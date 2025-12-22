"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/src/utils/api';

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
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [ingressRate, setIngressRate] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/api/projects');
      setProjects(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      }
      console.error(err);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/projects', { name, ingressRate: Number(ingressRate) });
      setName('');
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-xl">Qease Dashboard</div>
        <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="text-sm text-gray-500 hover:text-black">
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Waiting Rooms</h1>
        </div>

        {/* Create Project Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Create New Project</h2>
          <form onSubmit={createProject} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black outline-none transition"
                placeholder="e.g., Flash Sale 2024"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (users/min)</label>
              <input
                type="number"
                value={ingressRate}
                onChange={(e) => setIngressRate(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded outline-none"
                min="1"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition font-medium"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition flex flex-col justify-between h-48">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
                <div className="text-xs text-gray-400 font-mono mb-4 truncate">ID: {p.id}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {p.ingressRate} users / min
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Link
                  href={`/manage/${p.id}`}
                  className="flex-1 text-center bg-gray-100 text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Manage
                </Link>
                <Link
                  href={`/builder/${p.id}`}
                  className="flex-1 text-center bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Design
                </Link>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
                No projects found. Create one to get started.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
