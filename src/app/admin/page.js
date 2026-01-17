"use client";
import React, { useState } from 'react';
import { Shield, Key, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSessions(data.sessions);
        setIsLoggedIn(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Gagal connect ke server");
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm text-center">
          <Shield className="mx-auto text-red-500 mb-4" size={40} />
          <h1 className="text-xl font-bold mb-4">Admin Access</h1>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 rounded-lg mb-4 text-center"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold">
              {loading ? "Checking..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- TAMPILAN DASHBOARD ---
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="text-red-500" /> Dashboard Admin
            </h1>
            <button onClick={() => window.location.reload()} className="bg-zinc-800 px-4 py-2 rounded">
                Refresh Data
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.length === 0 ? (
                <p className="text-zinc-500">Belum ada sesi foto.</p>
            ) : (
                sessions.map((session) => (
                    <div key={session.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition">
                        
                        {/* Header Kartu: Session ID */}
                        <div className="bg-zinc-800 p-3 flex justify-between items-center">
                            <span className="font-mono font-bold text-yellow-400">{session.id}</span>
                            <span className="text-xs text-zinc-400">
                                {new Date(session.date).toLocaleTimeString()}
                            </span>
                        </div>

                        {/* Body Kartu: PIN & Foto */}
                        <div className="p-4 flex gap-4">
                            {/* Thumbnail Foto Pertama */}
                            <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                                <img src={session.thumbnail} className="w-full h-full object-cover" />
                            </div>
                            
                            {/* Info PIN */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Key size={14} className="text-zinc-500" />
                                    <span className="text-zinc-400 text-xs">Access PIN:</span>
                                </div>
                                <div className="text-2xl font-bold tracking-widest text-white">
                                    {session.pin}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    Total {session.totalPhotos} Foto
                                </div>
                            </div>
                        </div>

                        {/* Footer: Tombol Aksi */}
                        <div className="bg-zinc-950 p-3 border-t border-zinc-800">
                            <a 
                                href={`/album/${session.id}`} 
                                target="_blank"
                                className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                            >
                                <ExternalLink size={14} /> Buka Album Client
                            </a>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </main>
  );
}