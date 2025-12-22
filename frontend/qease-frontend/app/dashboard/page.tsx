"use client";
import { useEffect, useState } from "react";
import api from "@/src/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/api/rooms");
      setRooms(data);
    } catch (e) {
      console.error(e);
    }
  };

  const createRoom = async () => {
    if (!name || !slug) return;
    try {
      await api.post("/api/rooms", { name, slug });
      setName("");
      setSlug("");
      fetchRooms();
    } catch (e) {
      alert("Error creating room");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Waiting Rooms</h1>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className="text-red-500"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-bold mb-4">Create New Room</h3>
          <input
            placeholder="Event Name (e.g. Flash Sale)"
            className="w-full border p-2 rounded mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="URL Slug (e.g. flash-sale)"
            className="w-full border p-2 rounded mb-4"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <button
            onClick={createRoom}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Create
          </button>
        </div>

        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white p-6 rounded-lg shadow border flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-xl">{room.name}</h3>
              <p className="text-gray-500 text-sm">/{room.slug}</p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                  room.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {room.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <Link
                href={`/builder/${room.id}`}
                className="bg-gray-100 px-4 py-2 rounded text-sm font-medium"
              >
                Configure
              </Link>
              <Link
                href={`/room/${room.id}`}
                target="_blank"
                className="bg-gray-100 px-4 py-2 rounded text-sm font-medium"
              >
                View Room
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
