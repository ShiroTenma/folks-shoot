// src/app/components/StepResult.jsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { RefreshCcw } from 'lucide-react';

export default function StepResult({ 
    isUploading, // Boolean: True jika sedang upload
    finalImage,  // Base64 gambar final
    resultUrl,   // URL untuk QR Code
    pin,         // PIN akses
    onHome       // Fungsi reset ke halaman awal
}) {

  // --- TAMPILAN 1: LOADING / UPLOADING ---
  if (isUploading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center animate-pulse">
            <div className="w-20 h-20 border-8 border-zinc-100 border-t-black rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-black uppercase tracking-widest mb-1">Processing</h2>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.2em]">Enhancing & Printing...</p>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: HASIL AKHIR ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
            
            {/* KOLOM KIRI: PREVIEW GAMBAR */}
            <div className="flex justify-center md:justify-end">
                <div className="bg-white p-3 shadow-2xl border border-zinc-200 rotate-1 transform hover:rotate-0 transition duration-500">
                     {finalImage ? (
                        <img 
                            src={finalImage} 
                            alt="Result" 
                            className="max-h-[70vh] w-auto object-contain rounded-sm" 
                        />
                     ) : (
                        <div className="w-64 h-96 bg-zinc-100 flex items-center justify-center text-zinc-300">No Image</div>
                     )}
                </div>
            </div>

            {/* KOLOM KANAN: INFO & QR */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <h1 className="text-5xl font-black mb-2 tracking-tighter">FOLKSHOOT</h1>
                <p className="text-zinc-400 mb-10 uppercase tracking-[0.3em] text-xs border-b border-zinc-200 pb-4 w-full md:w-auto">
                    Memory Secured
                </p>

                {/* QR CODE BOX */}
                <div className="bg-white p-4 border-2 border-black inline-block mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {resultUrl ? (
                        <QRCodeCanvas value={resultUrl} size={160} level={"H"} />
                    ) : (
                        <div className="w-[160px] h-[160px] bg-zinc-200 animate-pulse"></div>
                    )}
                </div>

                {/* PIN INFO */}
                <div className="mb-10 text-center md:text-left">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1 tracking-widest">Access Code</p>
                    <div className="text-6xl font-mono font-bold tracking-widest text-black">
                        {pin || "----"}
                    </div>
                </div>

                {/* TOMBOL NEW SESSION */}
                <button 
                    onClick={onHome} 
                    className="w-full md:w-auto px-12 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-zinc-800 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 rounded-full"
                >
                    <RefreshCcw size={18} /> New Session
                </button>
            </div>
        </div>
    </div>
  );
}