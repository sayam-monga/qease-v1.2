"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/utils/api";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const { data } = await api.post(endpoint, { email, password });

      if (isLogin) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setIsLogin(true);
        alert("Account created! Please log in.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="absolute top-8 left-8 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
          Qease
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-500/20 rounded-full blur-[50px] pointer-events-none"></div>

        <h1 className="text-2xl font-bold mb-2 text-center text-white">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
            {isLogin ? "Enter your credentials to access your dashboard." : "Start building your waiting rooms today."}
        </p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-400 uppercase tracking-wide">Email</label>
            <input
              className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-400 uppercase tracking-wide">Password</label>
            <input
              className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-white text-black p-2.5 rounded-lg font-bold hover:bg-gray-200 transition mt-2">
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p
          className="text-center mt-6 text-sm text-gray-500 hover:text-white cursor-pointer transition"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
