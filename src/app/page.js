"use client";
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { QRCodeCanvas } from 'qrcode.react';
import { Camera, RefreshCcw, Lock } from 'lucide-react';

// Helper: Membuat ID Sesi Acak (4 Karakter Huruf/Angka)
const generateSessionId = () => Math.random().toString(36).substring(2, 6).toUpperCase();

// Helper: Membuat PIN Acak (4 Angka)
const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

export default function Photobooth() {
  const webcamRef = useRef(null);
  
  // State dasar
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");

  // State untuk Private Session
  const [sessionId, setSessionId] = useState("");
  const [pin, setPin] = useState("");

  // Resolusi Kamera
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // 1. SAAT TOMBOL MULAI DITEKAN
  const startSession = () => {
    // Generate kredensial baru untuk sesi ini
    setSessionId(generateSessionId());
    setPin(generatePin());
    
    // Mulai hitung mundur
    setCountdown(3);
  };

  // 2. LOGIKA COUNTDOWN
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      captureAndUpload();
      setCountdown(null);
    }
  }, [countdown]);

  // 3. PROSES FOTO & UPLOAD
  const captureAndUpload = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setLoading(true);
    
    try {
      // Kirim Gambar + SessionID + PIN ke Backend
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageSrc,
          sessionId: sessionId, // ID Sesi (misal: A1B2)
          pin: pin              // PIN (misal: 1234)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // SUKSES: Buat Link ke Halaman Album Privat
        // Gunakan window.location.origin agar otomatis mendeteksi IP/Localhost
        const baseUrl = window.location.origin;
        setResultUrl(`${baseUrl}/album/${sessionId}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResultUrl("");
    setSessionId("");
    setPin("");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          ITK SNAP
        </h1>
        <p className="text-zinc-400 mt-2">Private Secure Photobooth</p>
      </div>

      {/* Frame Utama */}
      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-zinc-800 w-full max-w-2xl aspect-[4/3]">
        
        {/* TAMPILAN KAMERA */}
        {!resultUrl && (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={1280}
            height={720}
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            mirrored={true}
          />
        )}

        {/* TAMPILAN HASIL (QR CODE + PIN) */}
        {resultUrl && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-black p-6 animate-in fade-in zoom-in duration-300">
            
            <h2 className="text-2xl font-bold mb-2">Scan QR Code</h2>
            
            {/* Kotak QR */}
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-lg mb-4">
              <QRCodeCanvas value={resultUrl} size={180} />
            </div>

            {/* Kotak PIN (PENTING) */}
            <div className="bg-zinc-100 border-2 border-dashed border-blue-400 p-4 rounded-xl w-full max-w-xs text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                <Lock size={16} />
                <span className="text-sm font-bold uppercase">Kode Akses (PIN)</span>
              </div>
              <p className="text-5xl font-black tracking-widest text-blue-600 font-mono">
                {pin}
              </p>
            </div>

            <p className="mt-4 text-xs text-zinc-500 text-center max-w-xs">
              Buka link dari QR Code, lalu masukkan PIN di atas untuk mengunduh fotomu.
            </p>
          </div>
        )}

        {/* OVERLAY: LOADING */}
        {loading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-xl animate-pulse">Mengamankan Foto...</p>
            <p className="text-sm text-zinc-400">Enkripsi PIN & Upload ke Cloud</p>
          </div>
        )}

        {/* OVERLAY: COUNTDOWN */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40 backdrop-blur-sm">
            <span className="text-[10rem] font-black text-white drop-shadow-lg animate-ping">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* TOMBOL KONTROL */}
      <div className="mt-8 flex gap-4">
        {!resultUrl ? (
          <button
            onClick={startSession} // Panggil startSession (bukan startCountdown langsung)
            disabled={loading || countdown !== null}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-xl shadow-[0px_0px_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-3">
              <Camera className="group-hover:rotate-12 transition-transform" />
              AMBIL FOTO
            </span>
          </button>
        ) : (
          <button
            onClick={reset}
            className="px-8 py-4 bg-zinc-800 text-white font-bold rounded-full text-xl hover:bg-zinc-700 hover:scale-105 transition-all flex items-center gap-3"
          >
            <RefreshCcw />
            FOTO BARU
          </button>
        )}
      </div>
    </main>
  );
}