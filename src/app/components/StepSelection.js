// src/app/components/StepSelection.jsx
import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';

export default function StepSelection({ 
    layout, setLayout, 
    selectedFrame, setSelectedFrame, 
    assets, // List frame dari page.js
    onBack, 
    onNext 
}) {
  
  // Tentukan list frame mana yang ditampilkan berdasarkan layout
  const currentFrameList = layout === 'single' ? assets.frames.single : assets.frames.strip;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-black animate-in slide-in-from-right duration-500">
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-zinc-400">Select Layout</h2>
        
        {/* --- PILIH LAYOUT --- */}
        <div className="flex gap-6 mb-12">
            {['single', 'strip'].map((l) => (
                <button 
                    key={l} 
                    onClick={() => { setLayout(l); setSelectedFrame(null); }} 
                    className={`
                        px-8 py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 
                        ${layout === l ? 'border-black bg-zinc-100 shadow-lg' : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'}
                    `}
                >
                    {/* Ikon Visual Layout Sederhana */}
                    <div className="flex gap-1">
                        {l === 'single' ? (
                            <div className={`w-8 h-12 rounded ${layout === l ? 'bg-black' : 'bg-zinc-300'}`}></div>
                        ) : (
                            <>
                                <div className={`w-3 h-12 rounded ${layout === l ? 'bg-black' : 'bg-zinc-300'}`}></div>
                                <div className={`w-3 h-12 rounded ${layout === l ? 'bg-black' : 'bg-zinc-300'}`}></div>
                                <div className={`w-3 h-12 rounded ${layout === l ? 'bg-black' : 'bg-zinc-300'}`}></div>
                            </>
                        )}
                    </div>
                    <span className="font-bold uppercase tracking-wider text-sm">{l} Shot</span>
                </button>
            ))}
        </div>

        {/* --- PILIH FRAME --- */}
        <div className="w-full max-w-2xl mb-12">
            <p className="text-center text-xs uppercase tracking-widest mb-4 text-zinc-500">Select Overlay</p>
            <div className="flex justify-center gap-4 flex-wrap">
                {currentFrameList.map((f) => (
                    <button 
                        key={f.id} 
                        onClick={() => setSelectedFrame(f)} 
                        className={`
                            relative w-24 h-32 border-2 rounded-lg overflow-hidden transition-all group
                            ${selectedFrame?.id === f.id ? 'border-black ring-2 ring-zinc-300 scale-105' : 'border-zinc-200 hover:border-zinc-400'}
                        `}
                    >
                        {/* Preview Gambar Frame */}
                        <img 
                            src={f.src} 
                            alt={f.name} 
                            className="w-full h-full object-contain bg-zinc-50 p-1" 
                        />
                        {/* Label Nama Frame */}
                        <div className={`
                            absolute bottom-0 w-full text-[9px] py-1 text-center uppercase font-bold
                            ${selectedFrame?.id === f.id ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}
                        `}>
                            {f.name}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* --- NAVIGATION --- */}
        <div className="flex gap-4">
            <button 
                onClick={onBack} 
                className="px-6 py-3 text-zinc-400 hover:text-black flex items-center gap-2 font-bold text-sm uppercase tracking-widest"
            >
                <ChevronLeft size={16} /> Back
            </button>
            <button 
                onClick={onNext} 
                className="px-10 py-3 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition shadow-xl flex items-center gap-2"
            >
                START <ArrowRight size={16} />
            </button>
        </div>
    </div>
  );
}