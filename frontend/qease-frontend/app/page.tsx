import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="border-b py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tight">Qease</div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium hover:underline">
            Login
          </Link>
          <Link href="/login" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          The Virtual Waiting Room for your biggest drops.
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl">
          Prevent crashes and ensure fair access with a customizable, branded waiting room.
          Deploy in minutes, no code required.
        </p>

        <div className="flex gap-4">
          <Link href="/login" className="bg-black text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition shadow-lg">
            Start Free Trial
          </Link>
          <a href="#" className="bg-gray-100 text-gray-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-200 transition">
            View Demo
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 w-full text-left">
          <div className="p-6 border rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-blue-100 rounded-lg mb-4"></div>
            <h3 className="font-bold text-lg mb-2">No-Code Builder</h3>
            <p className="text-gray-600 text-sm">Design your waiting room visually. Drag and drop components to match your brand.</p>
          </div>
          <div className="p-6 border rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-green-100 rounded-lg mb-4"></div>
            <h3 className="font-bold text-lg mb-2">Fair Queuing</h3>
            <p className="text-gray-600 text-sm">First-in, first-out fairness. Prevent bots and scalpers from ruining your launch.</p>
          </div>
          <div className="p-6 border rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-purple-100 rounded-lg mb-4"></div>
            <h3 className="font-bold text-lg mb-2">Real-time Analytics</h3>
            <p className="text-gray-600 text-sm">Monitor traffic flow, wait times, and throughput in real-time.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Qease Inc. All rights reserved.
      </footer>
    </div>
  );
}
