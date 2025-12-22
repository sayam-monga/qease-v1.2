"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/src/utils/api';
import { ArrowLeft, ExternalLink, Settings, Layout, Users, Code, Clock, BarChart } from 'lucide-react';

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

  if (!project) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-900 px-8 py-6 flex items-center gap-4 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="p-2 hover:bg-neutral-800 rounded-full transition text-neutral-400 hover:text-white">
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h1 className="font-bold text-xl">{project.name}</h1>
            <div className="text-xs text-neutral-500 font-mono mt-0.5">{projectId}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href={`/builder/${projectId}`} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-sky-500/50 transition group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full -mr-4 -mt-4 transition group-hover:bg-sky-500/10"></div>
                <Layout className="mb-4 text-sky-500" size={28} />
                <h3 className="font-bold text-lg mb-1">Design Studio</h3>
                <p className="text-neutral-500 text-sm">Customize appearance with the drag-and-drop builder.</p>
            </Link>

            <Link href={`/waiting-room/${projectId}`} target="_blank" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-emerald-500/50 transition group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition group-hover:bg-emerald-500/10"></div>
                <ExternalLink className="mb-4 text-emerald-500" size={28} />
                <h3 className="font-bold text-lg mb-1">Live Page</h3>
                <p className="text-neutral-500 text-sm">View the actual waiting room as a visitor.</p>
            </Link>

            <Link href={`/preview/${projectId}`} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-purple-500/50 transition group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition group-hover:bg-purple-500/10"></div>
                <Users className="mb-4 text-purple-500" size={28} />
                <h3 className="font-bold text-lg mb-1">Preview Mode</h3>
                <p className="text-neutral-500 text-sm">Simulate the queue experience without joining.</p>
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Analytics */}
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-8">
                    <BarChart className="text-sky-500" size={20} />
                    <h2 className="text-xl font-bold">Real-time Analytics</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div>
                        <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">Active Users</div>
                        <div className="text-4xl font-bold text-white">12</div>
                    </div>
                    <div>
                        <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">Waiting</div>
                        <div className="text-4xl font-bold text-amber-500">45</div>
                    </div>
                    <div>
                        <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">Avg Wait</div>
                        <div className="text-4xl font-bold text-white">4m</div>
                    </div>
                    <div>
                        <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-2">Throughput</div>
                        <div className="text-4xl font-bold text-emerald-500">{project.ingressRate}</div>
                    </div>
                </div>
            </div>

            {/* Integration Snippet */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
                <div className="flex items-center gap-2 mb-4">
                    <Code className="text-sky-500" size={20} />
                    <h2 className="text-xl font-bold">Integration</h2>
                </div>
                <p className="text-neutral-500 text-sm mb-6">Add this script to your website's <code>&lt;head&gt;</code> tag.</p>

                <div className="bg-black border border-neutral-800 p-4 rounded-xl font-mono text-xs text-neutral-400 overflow-x-auto relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded" onClick={() => navigator.clipboard.writeText(`<script src="http://localhost:3000/integration.js" data-project-id="${projectId}"></script>`)}>COPY</button>
                    </div>
                    <pre className="whitespace-pre-wrap break-all">{`<script \n  src="http://localhost:3000/integration.js" \n  data-project-id="${projectId}">\n</script>`}</pre>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
