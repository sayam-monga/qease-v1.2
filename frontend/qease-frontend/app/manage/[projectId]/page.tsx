"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/src/utils/api';
import { ArrowLeft, ExternalLink, Settings, Layout, Users } from 'lucide-react';

export default function ManageProject() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
        api.get(`/api/projects/${projectId}`)
           .then(({ data }) => setProject(data))
           .catch(console.error);
    }
  }, [projectId]);

  if (!project) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-xl">{project.name} <span className="text-gray-400 font-normal">/ Management</span></h1>
      </header>

      <main className="max-w-5xl mx-auto p-8">

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href={`/builder/${projectId}`} className="bg-white p-6 rounded-xl border hover:border-black transition group cursor-pointer">
                <Layout className="mb-4 text-gray-500 group-hover:text-black" />
                <h3 className="font-bold text-lg">Design Waiting Room</h3>
                <p className="text-gray-500 text-sm">Customize the look and feel using the drag-and-drop builder.</p>
            </Link>

            <Link href={`/waiting-room/${projectId}`} target="_blank" className="bg-white p-6 rounded-xl border hover:border-black transition group cursor-pointer">
                <ExternalLink className="mb-4 text-gray-500 group-hover:text-black" />
                <h3 className="font-bold text-lg">View Live Page</h3>
                <p className="text-gray-500 text-sm">Open the actual waiting room link as a visitor would see it.</p>
            </Link>

            <Link href={`/preview/${projectId}`} className="bg-white p-6 rounded-xl border hover:border-black transition group cursor-pointer">
                <Users className="mb-4 text-gray-500 group-hover:text-black" />
                <h3 className="font-bold text-lg">Preview Mode</h3>
                <p className="text-gray-500 text-sm">Simulate the waiting experience without joining the real queue.</p>
            </Link>
        </div>

        {/* Integration Snippet */}
        <div className="bg-white rounded-xl border p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Integration</h2>
            <p className="text-gray-600 mb-4">Add this script to your website's <code>&lt;head&gt;</code> to protect it with Qease.</p>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
                <pre>{`<script src="http://localhost:3000/integration.js" data-project-id="${projectId}"></script>`}</pre>
            </div>
        </div>

        {/* Stats Placeholder */}
        <div className="bg-white rounded-xl border p-8">
            <h2 className="text-xl font-bold mb-4">Real-time Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <div className="text-sm text-gray-500 uppercase font-semibold">Active Users</div>
                    <div className="text-3xl font-bold">12</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 uppercase font-semibold">Waiting</div>
                    <div className="text-3xl font-bold text-orange-500">45</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 uppercase font-semibold">Avg Wait</div>
                    <div className="text-3xl font-bold">4m 20s</div>
                </div>
                <div>
                    <div className="text-sm text-gray-500 uppercase font-semibold">Throughput</div>
                    <div className="text-3xl font-bold text-green-600">{project.ingressRate}/min</div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
