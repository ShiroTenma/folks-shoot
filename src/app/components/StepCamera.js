// src/app/components/StepCamera.jsx
import React from 'react';
import Webcam from 'react-webcam';

export default function StepCamera({ 
  webcamRef,       // Ref untuk ambil screenshot
  layout,          // 'single' atau 'strip'
  photosCount,     // Jumlah foto yang sudah diambil
  onCapture,       // Fungsi saat tombol shutter ditekan
  frameOverlay     // URL gambar frame (PNG) untuk preview
}) {

  // Settingan Resolusi Kamera (Paksa Full HD)
  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "user"
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-4">
        
        {/* CONTAINER KAMERA */}
        {/* Aspect Ratio 3:4 (Portrait Standard Photobooth) */}
        <div className="relative w-full max-w-2xl aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border-4 border-zinc-800 shadow-2xl">
            
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                // Class 'object-cover' agar video full memenuhi kotak tanpa gepeng
                // Class 'mirror-x' (dari globals.css) untuk efek cermin
                className="w-full h-full object-cover mirror-x"
                mirrored={true} 
            />

            {/* INFO PHOTO COUNT (Hanya muncul di mode strip) */}
            <div className="absolute top-6 left-0 w-full text-center pointer-events-none z-20">
                <span className="bg-black/60 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-lg">
                    {layout === 'single' ? 'Single Shot' : `Photo ${photosCount + 1} / 3`}
                </span>
            </div>

            {/* OVERLAY FRAME (PREVIEW) */}
            {/* Ini membantu user memposisikan diri agar tidak tertutup frame */}
            {frameOverlay && (
                <img 
                    src={frameOverlay} 
                    className="absolute inset-0 w-full h-full object-fill opacity-60 pointer-events-none z-10" 
                    alt="Frame Overlay"
                />
            )}

            {/* Grid Lines (Opsional: Biar kelihatan pro) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
                <div className="w-full h-1/3 border-b border-white"></div>
                <div className="w-full h-1/3 border-b border-white top-1/3 absolute"></div>
                <div className="h-full w-1/3 border-r border-white absolute top-0 left-0"></div>
                <div className="h-full w-1/3 border-r border-white absolute top-0 right-1/3"></div>
            </div>
        </div>

        {/* TOMBOL SHUTTER */}
        <div className="mt-8 flex flex-col items-center gap-4">
            <button 
                onClick={onCapture} 
                className="group relative w-24 h-24 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-95 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
            >
                {/* Bagian dalam tombol */}
                <div className="w-20 h-20 bg-white rounded-full group-hover:bg-zinc-100 transition-colors"></div>
            </button>
            
            <p className="text-zinc-500 text-xs text-center uppercase tracking-[0.2em] animate-pulse">
                Tap to Capture
            </p>
        </div>
    </div>
  );
}