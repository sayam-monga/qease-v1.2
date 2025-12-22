"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import api from "@/src/utils/api";

export default function WaitingRoom() {
  const { id } = useParams();
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState("CONNECTING");
  const [position, setPosition] = useState(0);

  // Create ephemeral user ID for this session
  const [userId] = useState(
    () => "guest_" + Math.random().toString(36).substr(2, 9)
  );

  // 1. Fetch Design
  useEffect(() => {
    api.get(`/api/rooms/${id}`).then((res) => setConfig(res.data));
  }, [id]);

  // 2. Connect Socket
  useEffect(() => {
    if (!config) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      query: { roomId: id, userId },
    });

    socket.on("status", (data) => {
      if (data.status === "READY") {
        // Usually we wait for admitted event, but if we reconnect and are active:
        setStatus("READY");
      } else if (data.status === "QUEUED") {
        setStatus("QUEUED");
        setPosition(data.position);
      } else if (data.status === "UPDATE") {
        // Simple update logic (if position wasn't sent, just decrement logic in real app)
        // For MVP we rely on re-fetching or simple estimation if not provided
      }
    });

    socket.on("admitted", (data) => {
      if (data.userId === userId) {
        // In real app: Redirect to client URL + token
        window.location.href = `/demo-target?token=${data.token}`;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [config, id, userId]);

  if (!config) return <div>Loading Room...</div>;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: config.uiConfig?.bgColor || "#fff" }}
    >
      <div className="max-w-md w-full text-center">
        {config.uiConfig?.logoUrl && (
          <img src={config.uiConfig.logoUrl} className="h-16 mx-auto mb-6" />
        )}

        <h1 className="text-3xl font-bold mb-2">
          {config.uiConfig?.title || "Welcome"}
        </h1>

        {status === "QUEUED" && (
          <div className="bg-white/80 p-8 rounded-xl shadow-lg mt-8 backdrop-blur-sm">
            <div className="text-6xl font-black text-blue-600 mb-2">
              {position}
            </div>
            <p className="uppercase tracking-widest text-sm font-bold opacity-60">
              People Ahead
            </p>
            <div className="w-full bg-gray-200 h-2 mt-6 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full animate-pulse w-2/3"></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Do not refresh page</p>
          </div>
        )}

        {status === "CONNECTING" && <p>Connecting to Queue...</p>}
      </div>
    </div>
  );
}
