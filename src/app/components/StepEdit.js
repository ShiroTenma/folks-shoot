// src/app/components/StepEdit.jsx
import React, { useState } from 'react';
import { MousePointer2, Trash2, Check, RotateCw, Scaling } from 'lucide-react';

export default function StepEdit({ 
    layout, photos, frame, stickersList, 
    placedStickers, onAddSticker, onRemoveSticker, onUpdateSticker, onClearStickers, 
    onFinish, brightness, setBrightness, saturation, setSaturation 
}) {
    const [activeStickerId, setActiveStickerId] = useState(null); // Sticker yang sedang diklik

    // Helper untuk update properti sticker tertentu
    const updateActiveSticker = (key, value) => {
        if (!activeStickerId) return;
        const s = placedStickers.find(item => item.id === activeStickerId);
        if (s) {
            // Kita kirim full object update ke parent
            onUpdateSticker(activeStickerId, { ...s, [key]: parseFloat(value) });
        }
    };

    // Cari sticker yang sedang aktif untuk mengambil nilai slidernya
    const activeSticker = placedStickers.find(s => s.id === activeStickerId);

    // --- LOGIC DRAG ---
    const handleDragStart = (e, id) => { 
        e.stopPropagation(); 
        setActiveStickerId(id); // Set active saat mulai drag
    };
    
    const handleDragMove = (e) => {
        if (!activeStickerId) return;
        
        const container = document.getElementById('preview-container');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newX = ((clientX - rect.left) / rect.width) * 100;
        let newY = ((clientY - rect.top) / rect.height) * 100;

        // Update posisi (X, Y)
        // Kita gunakan helper onUpdateSticker yang fleksibel
        const s = placedStickers.find(item => item.id === activeStickerId);
        onUpdateSticker(activeStickerId, { ...s, x: newX, y: newY });
    };

    // Hapus active saat klik area kosong
    const handleBackgroundClick = () => setActiveStickerId(null);

    return (
        <div 
            className="min-h-screen bg-zinc-100 flex flex-col items-center py-4 overflow-y-auto"
            onMouseMove={handleDragMove} onTouchMove={handleDragMove} 
            onClick={handleBackgroundClick} // Reset selection
        >
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4">Customize</h2>

            {/* --- PANEL KONTROL --- */}
            {activeSticker ? (
                // MODE 1: KONTROL STICKER (Muncul kalau sticker dipilih)
                <div className="bg-black text-white p-4 rounded-xl shadow-xl flex flex-col gap-3 mb-4 w-[90%] max-w-md animate-in slide-in-from-bottom duration-300 z-50">
                    <div className="flex justify-between items-center border-b border-zinc-700 pb-2 mb-1">
                        <span className="text-xs font-bold uppercase text-yellow-500">Sticker Edit</span>
                        <button onClick={() => { onRemoveSticker(activeStickerId); setActiveStickerId(null); }} className="text-red-400 text-xs flex items-center gap-1"><Trash2 size={12}/> Remove</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Scaling size={16} />
                        <input type="range" min="0.5" max="3" step="0.1" 
                            value={activeSticker.scale || 1} 
                            onChange={(e) => updateActiveSticker('scale', e.target.value)}
                            className="w-full accent-yellow-500 h-2 bg-zinc-700 rounded-lg appearance-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <RotateCw size={16} />
                        <input type="range" min="-180" max="180" step="5" 
                            value={activeSticker.rotation || 0} 
                            onChange={(e) => updateActiveSticker('rotation', e.target.value)}
                            className="w-full accent-yellow-500 h-2 bg-zinc-700 rounded-lg appearance-none"
                        />
                    </div>
                </div>
            ) : (
                // MODE 2: KONTROL WARNA FOTO (Default)
                <div className="bg-white p-3 rounded-xl shadow-sm flex flex-wrap justify-center gap-4 mb-4 w-[90%] max-w-md">
                     <div className="flex flex-col items-center">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Brightness</label>
                        <input type="range" min="0.8" max="1.3" step="0.05" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-24 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"/>
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Saturation</label>
                        <input type="range" min="0.8" max="1.5" step="0.1" value={saturation} onChange={(e) => setSaturation(parseFloat(e.target.value))} className="w-24 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"/>
                    </div>
                </div>
            )}

            {/* PREVIEW CONTAINER */}
            <div 
                id="preview-container"
                className="relative bg-white shadow-2xl overflow-hidden cursor-crosshair touch-none mx-auto"
                style={{ 
                    width: '85vw', maxWidth: layout === 'single' ? '360px' : '280px',
                    aspectRatio: layout === 'single' ? '2/3' : '1/3',
                }}
            >
                {/* Layer Foto */}
                <div className="absolute inset-0 flex flex-col" style={{ filter: `brightness(${brightness}) saturate(${saturation})` }}>
                    {layout === 'single' ? <img src={photos[0]} className="w-full h-full object-cover" /> : photos.map((p, i) => <img key={i} src={p} className="w-full h-1/3 object-cover" />)}
                </div>

                {/* Layer Frame */}
                {frame && <img src={frame.src} className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10" />}

                {/* Layer Sticker */}
                {placedStickers.map((s) => (
                    <div
                        key={s.id}
                        onMouseDown={(e) => handleDragStart(e, s.id)}
                        onTouchStart={(e) => handleDragStart(e, s.id)}
                        onClick={(e) => { e.stopPropagation(); setActiveStickerId(s.id); }} // Klik untuk select
                        className={`absolute z-20 cursor-move group ${activeStickerId === s.id ? 'ring-2 ring-yellow-500 ring-offset-2' : ''}`} // Visual border kalau dipilih
                        style={{ 
                            left: `${s.x}%`, top: `${s.y}%`, 
                            transform: `translate(-50%, -50%) rotate(${s.rotation || 0}deg) scale(${s.scale || 1})`, // Terapkan rotasi & scale CSS
                            width: '25%' 
                        }}
                    >
                        <img src={s.src} className="w-full h-auto drop-shadow-lg pointer-events-none" />
                    </div>
                ))}
            </div>

            <p className="text-zinc-400 text-xs mt-4 mb-2"><MousePointer2 size={12} className="inline"/> Tap sticker to edit size/rotate</p>

            {/* STICKER DRAWER */}
            <div className="bg-white p-2 w-full max-w-md overflow-x-auto whitespace-nowrap mb-6 border-y border-zinc-200">
                <div className="flex gap-3 px-2">
                    {stickersList.map((src, i) => (
                        <button key={i} onClick={(e) => { e.stopPropagation(); onAddSticker(src); }} className="w-14 h-14 bg-zinc-50 rounded-lg hover:bg-zinc-100 p-1 border border-zinc-200 flex-shrink-0">
                            <img src={src} className="w-full h-full object-contain" alt="sticker" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 pb-10">
                <button onClick={onFinish} className="px-8 py-3 bg-black text-white rounded-full font-bold shadow-xl hover:scale-105 transition flex items-center gap-2">
                    FINISH <Check size={18} />
                </button>
            </div>
        </div>
    );
}