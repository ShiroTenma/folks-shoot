// src/app/components/StepCamera.jsx
import React from 'react';
import Webcam from 'react-webcam';

export default function StepCamera({ 
  webcamRef,       
  layout,          
  photosCount,     
  onCapture,       
  frameOverlay     
}) {

  // KONFIGURASI KAMERA
  // Kita minta resolusi tinggi, tapi biarkan CSS yang ngatur tampilannya
  const videoConstraints = {
    facingMode: "user",
    width: { ideal: 1920 }, // Minta resolusi tinggi
    height: { ideal: 1080 }
  };

  return (
    // Wrapper luar: Hitam penuh, tidak bisa scroll
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden z-50">
        
        {/* CONTAINER UTAMA (KOTAK 3:4) */}
        {/* w-full max-w-lg: Lebar responsif 
            aspect-[3/4]: Memaksa rasio portrait
            relative: Agar elemen di dalamnya (video/frame) bisa ditumpuk
        */}
        <div className="relative w-full max-w-[500px] aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border-4 border-zinc-800 shadow-2xl">
            
            {/* PERBAIKAN UTAMA:
               1. absolute inset-0: Video dipaksa nempel ke pojok-pojok kotak container
               2. w-full h-full: Video dipaksa memenuhi kotak
               3. object-cover: Video dicrop (potong) otomatis kiri-kanan agar tidak gepeng
            */}
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Efek Cermin
                mirrored={false} 
            />

            {/* LABEL FOTO KE-BERAPA (Mode Strip) */}
            <div className="absolute top-4 left-0 w-full text-center pointer-events-none z-20">
                <span className="bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-sm">
                    {layout === 'single' ? 'Single Shot' : `Photo ${photosCount + 1} / 3`}
                </span>
            </div>

            {/* FRAME OVERLAY (PNG) */}
            {frameOverlay && (
                <img 
                    src={frameOverlay} 
                    className="absolute inset-0 w-full h-full object-fill opacity-60 pointer-events-none z-30" 
                    alt="Frame Overlay"
                />
            )}

            {/* GRID LINES (Garis bantu foto) */}
            <div className="absolute inset-0 z-10 opacity-30 pointer-events-none">
                <div className="w-full h-1/3 border-b border-white/50 absolute top-0"></div>
                <div className="w-full h-1/3 border-b border-white/50 absolute top-1/3"></div>
                <div className="h-full w-1/3 border-r border-white/50 absolute left-0"></div>
                <div className="h-full w-1/3 border-r border-white/50 absolute left-1/3"></div>
            </div>
        </div>

        {/* TOMBOL JEPRET */}
        <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-3 z-40">
            <button 
                onClick={onCapture} 
                className="group relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(255,215,0,0.6)]"
            >
                <div className="w-16 h-16 bg-white rounded-full group-hover:bg-zinc-200 transition-colors"></div>
            </button>
            <p className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-medium animate-pulse">
                Tap Shutter
            </p>
        </div>
    </div>
  );
}