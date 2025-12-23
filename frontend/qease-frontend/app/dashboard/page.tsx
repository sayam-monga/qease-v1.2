"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/src/utils/api';
import { Plus, Settings, ExternalLink, Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="font-bold text-xl flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                Qease
            </div>
            <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="text-sm text-neutral-400 hover:text-white transition">
                Logout
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-neutral-500">Manage your waiting rooms and monitor traffic.</p>
          </div>
        </div>

        {/* Create Project Card */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl mb-12">
          <h2 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
            <Plus size={18} className="text-sky-500" />
            Create New Waiting Room
          </h2>
          <form onSubmit={createProject} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-700 focus:outline-none focus:border-sky-500 transition"
                placeholder="e.g., Black Friday Sale 2024"
                required
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">Rate (users/min)</label>
              <input
                type="number"
                value={ingressRate}
                onChange={(e) => setIngressRate(Number(e.target.value))}
                className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-white placeholder-neutral-700 focus:outline-none focus:border-sky-500 transition"
                min="1"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50 transition"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-600 transition group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-neutral-800 rounded-lg text-sky-500">
                    <Activity size={20} />
                </div>
                <div className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-900/50">Active</div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-sky-400 transition">{p.name}</h3>
                <div className="text-xs text-neutral-600 font-mono truncate">ID: {p.id}</div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-sm text-neutral-400 pb-4 border-b border-neutral-800">
                    <span>Ingress Rate</span>
                    <span className="text-white font-medium">{p.ingressRate} / min</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Link
                    href={`/manage/${p.id}`}
                    className="flex items-center justify-center gap-2 bg-neutral-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-700 transition"
                    >
                    <Settings size={14} /> Manage
                    </Link>
                    <Link
                    href={`/builder/${p.id}`}
                    className="flex items-center justify-center gap-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 py-2.5 rounded-lg text-sm font-medium hover:bg-sky-500/20 transition"
                    >
                    Design
                    </Link>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-3 text-center py-24 text-neutral-600 border border-dashed border-neutral-800 rounded-2xl">
                No waiting rooms found. Create your first one above.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
