import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-sky-500/30">
      {/* Navbar */}
      <nav className="border-b border-neutral-800 py-4 px-6 flex justify-between items-center backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
          Qease
        </div>
        <div className="space-x-6 flex items-center">
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition">
            Login
          </Link>
          <Link href="/login" className="bg-sky-500 text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-sky-400 transition shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-5xl mx-auto relative overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 relative z-10">
          Traffic control for<br/> the modern web.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed relative z-10">
          The professional virtual waiting room. Prevent crashes, ensure fair access, and scale effortlessly.
        </p>

        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <Link href="/login" className="bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-200 transition">
            Start Free Trial
          </Link>
          <a href="#" className="border border-neutral-700 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-neutral-800 transition">
            View Live Demo
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 w-full text-left relative z-10">
          <div className="p-8 border border-neutral-800 rounded-2xl bg-neutral-900/50 backdrop-blur-md hover:border-neutral-600 transition group">
            <div className="w-12 h-12 bg-sky-500/10 rounded-xl mb-6 flex items-center justify-center border border-sky-500/20 group-hover:border-sky-500/50 transition">
                <div className="w-6 h-6 bg-sky-500 rounded-full"></div>
            </div>
            <h3 className="font-bold text-xl mb-3 text-white">No-Code Builder</h3>
            <p className="text-gray-400 leading-relaxed">Design your waiting room visually. Drag and drop components to match your brand identity perfectly.</p>
          </div>
          <div className="p-8 border border-neutral-800 rounded-2xl bg-neutral-900/50 backdrop-blur-md hover:border-neutral-600 transition group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl mb-6 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 transition">
                <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
            </div>
            <h3 className="font-bold text-xl mb-3 text-white">Fair Queuing</h3>
            <p className="text-gray-400 leading-relaxed">First-in, first-out fairness. Advanced bot protection and token validation to secure your drops.</p>
          </div>
          <div className="p-8 border border-neutral-800 rounded-2xl bg-neutral-900/50 backdrop-blur-md hover:border-neutral-600 transition group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl mb-6 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
            </div>
            <h3 className="font-bold text-xl mb-3 text-white">Real-time Analytics</h3>
            <p className="text-gray-400 leading-relaxed">Monitor traffic flow, wait times, and throughput in real-time with granular insights.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 text-center text-gray-600 text-sm bg-black">
        &copy; {new Date().getFullYear()} Qease Inc. All rights reserved.
      </footer>
    </div>
  );
}
