"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { QRCodeCanvas } from 'qrcode.react';
import { Camera, RefreshCcw, Lock, Check, Send, Download } from 'lucide-react';

// --- HELPER FUNCTIONS ---
const generateSessionId = () => Math.random().toString(36).substring(2, 6).toUpperCase();
const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

export default function Photobooth() {
  const webcamRef = useRef(null);
  
  // State
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [pin, setPin] = useState("");

  // Resolusi Kamera
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // 1. MULAI (Start)
  const startSession = () => {
    setSessionId(generateSessionId());
    setPin(generatePin());
    setCountdown(3);
  };

  // 2. LOGIKA COUNTDOWN
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      capture();
      setCountdown(null);
    }
  }, [countdown]);

  // 3. CEKREK
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  // 4. RETAKE
  const retake = () => {
    setImgSrc(null);
  };

  // 5. UPLOAD
  const handleUpload = async () => {
    if (!imgSrc) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgSrc, sessionId: sessionId, pin: pin }),
      });

      const data = await res.json();

      if (res.ok) {
        const baseUrl = window.location.origin;
        setResultUrl(`${baseUrl}/album/${sessionId}`);
      } else {
        alert(`Error: ${data.error}`);
        setLoading(false);
      }
    } catch (err) {
      alert("Gagal koneksi ke server.");
      setLoading(false);
    }
  };

  // 6. RESET
  const reset = () => {
    setResultUrl("");
    setImgSrc(null);
    setSessionId("");
    setPin("");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-6 px-4">
      
      {/* --- HEADER: LOGO & BRANDING --- */}
      <header className="w-full max-w-3xl flex flex-col items-center justify-center mb-6 z-10">
        {/* Placeholder Logo (Lingkaran Silver) */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-3">
            <span className="font-bold text-black text-xs">LOGO</span>
        </div>
        
        <h1 className="text-3xl uppercase tracking-[0.2em] font-light text-white">
          Photobooth <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">LUXURY</span>
        </h1>
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent mt-2"></div>
      </header>

      {/* --- FRAME UTAMA (Design Silver Border) --- */}
      <div className="relative w-full max-w-4xl aspect-[16/9] md:aspect-[4/3] bg-zinc-900 rounded-lg overflow-hidden border-[6px] border-zinc-400 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
        
        {/* -- 1. LIVE CAMERA -- */}
        {!imgSrc && !resultUrl && (
          <div className="relative w-full h-full">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={1280}
              height={720}
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover mirror-x" // Pastikan ada class css mirror-x biar kayak cermin
              mirrored={true}
            />
            
            {/* Countdown Overlay (Transparan, Tidak Nge-blok) */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[12rem] font-bold text-white/90 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-ping">
                  {countdown}
                </span>
              </div>
            )}

            {/* Grid Line (Opsional: Biar estetik kayak kamera pro) */}
            <div className="absolute inset-0 border border-white/10 pointer-events-none grid grid-cols-3 grid-rows-3">
               <div className="border-r border-white/10 h-full"></div>
               <div className="border-r border-white/10 h-full"></div>
            </div>
          </div>
        )}

        {/* -- 2. PREVIEW (Review Foto) -- */}
        {imgSrc && !resultUrl && (
          <div className="relative w-full h-full">
            <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
            
            {/* Overlay Gradient Bawah */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-6 gap-6">
              <button 
                onClick={retake}
                disabled={loading}
                className="px-6 py-2 bg-zinc-800 border border-zinc-600 text-white rounded-full hover:bg-zinc-700 transition uppercase tracking-widest text-sm flex items-center gap-2"
              >
                <RefreshCcw size={16} /> Retake
              </button>

              <button 
                onClick={handleUpload}
                disabled={loading}
                className="px-8 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold rounded-full hover:scale-105 transition shadow-[0_0_15px_rgba(234,179,8,0.5)] uppercase tracking-widest text-sm flex items-center gap-2"
              >
                {loading ? "Processing..." : <>Keep This <Check size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* -- 3. RESULT (QR & PIN) -- */}
        {resultUrl && (
          <div className="absolute inset-0 bg-zinc-900 flex flex-col md:flex-row items-center justify-center p-8 gap-8 animate-in fade-in duration-500">
            
            {/* Kolom Kiri: QR */}
            <div className="bg-white p-4 rounded-xl shadow-2xl transform hover:scale-105 transition duration-300">
              <QRCodeCanvas value={resultUrl} size={200} />
              <p className="text-black text-center mt-2 font-bold text-xs uppercase tracking-widest">Scan Me</p>
            </div>

            {/* Kolom Kanan: Info PIN */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl text-yellow-500 font-light uppercase tracking-widest mb-1">Success!</h2>
              <p className="text-zinc-400 text-sm mb-6">Foto kamu berhasil disimpan.</p>

              <div className="bg-black/50 border border-yellow-600/30 p-4 rounded-lg inline-block min-w-[200px] text-center mb-6">
                <span className="block text-zinc-500 text-xs uppercase mb-1">Access PIN</span>
                <span className="text-4xl font-mono text-white tracking-[0.2em] font-bold">{pin}</span>
              </div>
              
              <div>
                <button
                    onClick={reset}
                    className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition uppercase tracking-wider text-xs flex items-center gap-2 mx-auto md:mx-0"
                >
                    <Camera size={16} /> Foto Baru
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-500 font-bold tracking-widest text-sm animate-pulse">UPLOADING...</p>
          </div>
        )}
      </div>

      {/* --- FOOTER CONTROLS --- */}
      {!imgSrc && !resultUrl && (
        <div className="mt-8">
            <button
                onClick={startSession}
                disabled={countdown !== null}
                className={`
                    relative group w-20 h-20 rounded-full border-4 border-zinc-500 
                    flex items-center justify-center
                    transition-all duration-300
                    ${countdown !== null ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-400 hover:scale-110 cursor-pointer'}
                `}
            >
                {/* Bagian dalam tombol (Shutter) */}
                <div className={`
                    w-16 h-16 rounded-full bg-white transition-all duration-200
                    ${countdown !== null ? 'scale-90 bg-red-500' : 'group-hover:bg-yellow-400 group-active:scale-90'}
                `}></div>
            </button>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mt-4 text-center">
                {countdown !== null ? "Get Ready..." : "Tap to Capture"}
            </p>
        </div>
      )}

    </main>
  );
}