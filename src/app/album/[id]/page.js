// src/app/album/[id]/page.js
"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Lock, Image as ImageIcon } from 'lucide-react';

export default function PrivateAlbum() {
  const { id } = useParams(); // id ini adalah sessionId
  const [pin, setPin] = useState("");
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Gunakan relative path agar otomatis ikut domain (localhost atau ngrok)
      const res = await fetch('/api/album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, pin: pin }),
      });

      const data = await res.json();

      if (res.ok) {
        setPhotos(data.photos);
      } else {
        setError(data.error || "PIN salah atau sesi tidak ditemukan");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN 1: FORM PIN ---
  if (!photos) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm text-center">
          <div className="bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Album Privat</h1>
          <p className="text-zinc-400 mb-6 text-sm">Masukkan PIN sesi: {id}</p>
          
          <form onSubmit={handleUnlock}>
            <input 
              type="tel" maxLength={4} placeholder="1234" value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold focus:border-blue-500 focus:outline-none mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button 
              type="submit" disabled={loading || pin.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? "Mengecek..." : "Buka Album"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- TAMPILAN 2: GALERI ---
  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <ImageIcon /> Foto Anda
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {photos.map((photo) => (
          <div key={photo.asset_id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            <img src={photo.secure_url} alt="Foto" className="w-full h-auto" />
            <div className="p-3">
              <a href={photo.secure_url} download target="_blank" rel="noopener noreferrer"
                className="block w-full bg-white text-black text-center py-3 rounded-lg font-bold hover:bg-gray-200">
                Download HD
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}