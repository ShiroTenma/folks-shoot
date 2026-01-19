"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Trash2, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Fungsi Login & Load Data
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setSessions(data.sessions);
      } else {
        alert("Password Salah!");
      }
    } catch (err) {
      alert("Error connection");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Hapus Sesi
  const handleDelete = async (sessionId) => {
    if (!confirm(`YAKIN HAPUS SESI ${sessionId}? Permanen!`)) return;

    try {
        const res = await fetch('/api/admin', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, sessionId }),
        });
        if(res.ok) {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } else {
            alert("Gagal hapus");
        }
    } catch(e) { alert("Error koneksi"); }
  };

  // --- TAMPILAN LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm">
          <h1 className="text-white text-2xl font-bold mb-6 text-center">FOLKSHOOT ADMIN</h1>
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full bg-black border border-zinc-700 text-white py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:border-white transition"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition"
          >
            {loading ? "Checking..." : "Login Dashboard"}
          </button>
        </form>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
            <div>
                <h1 className="text-3xl font-bold">Session Manager</h1>
                <p className="text-zinc-500 text-sm mt-1">Total Sessions: {sessions.length}</p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-zinc-800 px-4 py-2 rounded-lg text-sm hover:bg-zinc-700">Refresh Data</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sessions.map((session) => (
                <div key={session.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition group">
                    
                    {/* Preview Image (Prioritas Final, kalau gak ada pake Raw) */}
                    <div className="relative aspect-[2/3] bg-zinc-950">
                        <img 
                            src={session.finalUrl || session.rawUrl} 
                            alt={session.id} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-mono border border-zinc-700">
                            PIN: {session.pin}
                        </div>
                    </div>

                    {/* Info Body */}
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{session.id}</h3>
                        <p className="text-zinc-500 text-xs mb-4">
                            {new Date(session.date).toLocaleString()}
                        </p>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {session.finalUrl && (
                                <a href={session.finalUrl} target="_blank" download className="bg-zinc-800 hover:bg-white hover:text-black py-2 rounded text-xs font-bold text-center flex items-center justify-center gap-1 transition">
                                    <Download size={12}/> Final
                                </a>
                            )}
                            {session.rawUrl && (
                                <a href={session.rawUrl} target="_blank" download className="bg-zinc-800 hover:bg-zinc-700 py-2 rounded text-xs text-center flex items-center justify-center gap-1 transition text-zinc-300">
                                    <ImageIcon size={12}/> Raw
                                </a>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                            <a href={`/album/${session.id}`} target="_blank" className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                                <ExternalLink size={12}/> Client View
                            </a>
                            <button 
                                onClick={() => handleDelete(session.id)}
                                className="text-red-500 text-xs flex items-center gap-1 hover:text-red-400"
                            >
                                <Trash2 size={12}/> Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {sessions.length === 0 && (
            <div className="text-center py-20 text-zinc-600">
                Belum ada foto yang diupload.
            </div>
        )}
      </div>
    </div>
  );
}