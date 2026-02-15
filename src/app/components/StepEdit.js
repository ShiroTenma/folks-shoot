// src/app/components/StepEdit.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, X, MousePointer2, Layers, Trash2, RefreshCcw } from 'lucide-react';
import { getFrameLayoutConfig } from '../utils/frameLayoutConfig';

// Tampilkan lebih banyak stiker sekaligus (dari 5 -> 10)
const ITEMS_PER_PAGE = 10;

export default function StepEdit({ 
    layout, photos, frame,
    stickersList, 
    placedStickers, onAddSticker, onRemoveSticker, onUpdateSticker, onClearStickers,
    onFinish, onRestart, brightness, setBrightness, saturation, setSaturation 
}) {
    const [activeStickerId, setActiveStickerId] = useState(null);
    const [page, setPage] = useState(0);
    const containerRef = useRef(null);
    const frameLayoutConfig = getFrameLayoutConfig(layout, frame?.id);
    const { maxPhotos, preview } = frameLayoutConfig;
    const padTopPct = preview.padTopPct;
    const padBottomPct = preview.padBottomPct;
    const padX = preview.padXPct;
    const gapPct = preview.gapPct;
    const moveXPct = preview.moveXPct;
    const moveYPct = preview.moveYPct;
    const slotHeightPct = layout === 'single' 
        ? 100 
        : ((100 - padTopPct - padBottomPct - gapPct * (maxPhotos - 1)) / maxPhotos);

    // --- CAROUSEL LOGIC ---
    const totalPages = Math.ceil(stickersList.length / ITEMS_PER_PAGE);
    const currentStickers = stickersList.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const nextPage = () => setPage(p => (p + 1) % totalPages);
    const prevPage = () => setPage(p => (p - 1 + totalPages) % totalPages);

    // --- DRAG LOGIC (Tetap ada buat geser-geser) ---
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const startDrag = (e, id) => {
        if(e.type === 'touchstart') e.preventDefault(); // Stop scroll di HP
        setActiveStickerId(id); // Set aktif biar highlight
        isDragging.current = true;

        const sticker = placedStickers.find(s => s.id === id);
        if (!sticker || !containerRef.current) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        dragOffset.current = {
            startX: clientX, startY: clientY,
            initialX: sticker.x, initialY: sticker.y
        };
    };

    // --- GLOBAL WINDOW LISTENER ---
    useEffect(() => {
        const handleWindowMove = (e) => {
            if (!isDragging.current || !activeStickerId || !containerRef.current) return;
            if(e.cancelable) e.preventDefault(); 

            const rect = containerRef.current.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            // Hitung posisi baru
            const deltaX = clientX - dragOffset.current.startX;
            const deltaY = clientY - dragOffset.current.startY;
            const deltaXPercent = (deltaX / rect.width) * 100;
            const deltaYPercent = (deltaY / rect.height) * 100;

            const newX = dragOffset.current.initialX + deltaXPercent;
            const newY = dragOffset.current.initialY + deltaYPercent;

            const currentSticker = placedStickers.find(s => s.id === activeStickerId);
            if(currentSticker) {
                onUpdateSticker(activeStickerId, { ...currentSticker, x: newX, y: newY });
            }
        };

        const handleWindowUp = () => {
            isDragging.current = false;
        };

        window.addEventListener('mousemove', handleWindowMove, { passive: false });
        window.addEventListener('touchmove', handleWindowMove, { passive: false });
        window.addEventListener('mouseup', handleWindowUp);
        window.addEventListener('touchend', handleWindowUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMove);
            window.removeEventListener('touchmove', handleWindowMove);
            window.removeEventListener('mouseup', handleWindowUp);
            window.removeEventListener('touchend', handleWindowUp);
        };
    }, [activeStickerId, placedStickers]);

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center py-4 select-none overflow-hidden">
            
            {/* HEADER SEDERHANA */}
            <div className="w-full max-w-md px-6 mb-2 flex justify-between items-end">
                <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-800">Customize</h2>
                {placedStickers.length > 0 && (
                     <button 
                        onClick={onClearStickers}
                        className="text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-red-200 transition"
                     >
                        <RefreshCcw size={10} /> RESET ALL
                     </button>
                )}
            </div>

            {/* --- AREA PREVIEW (CANVAS) --- */}
            <div 
                ref={containerRef}
                onClick={() => setActiveStickerId(null)} // Klik luar buat deselect
                className="relative bg-white shadow-2xl overflow-hidden mx-auto mb-4 ring-1 ring-zinc-200 z-10"
                style={{ 
                    width: '85vw', maxWidth: layout === 'single' ? '360px' : '280px',
                    aspectRatio: layout === 'single' ? '2/3' : '1/3',
                }}
            >
                {/* FOTO & FRAME */}
                <div 
                    className="absolute inset-0 flex flex-col pointer-events-none" 
                    style={{ 
                        filter: `brightness(${brightness}) saturate(${saturation})`,
                        paddingTop: `${padTopPct}%`,
                        paddingBottom: `${padBottomPct}%`,
                        paddingLeft: `${padX}%`,
                        paddingRight: `${padX}%`,
                        gap: `${gapPct}%`,
                        boxSizing: 'border-box',
                    }}
                >
                    {layout === 'single' ? (
                      <img src={photos[0]} className="w-full h-full object-cover" />
                    ) : (
                      photos.map((p, i) => (
                        <div
                          key={i}
                          className="w-full overflow-hidden"
                          style={{ height: `${slotHeightPct}%` }}
                        >
                          <img 
                            src={p} 
                            className="w-full h-full object-cover"
                            style={{ objectPosition: `${50 + moveXPct}% ${50 + moveYPct}%` }}
                          />
                        </div>
                      ))
                    )}
                </div>
                {frame && <img src={frame.src} className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10" />}

                {/* STICKERS DI CANVAS */}
                {placedStickers.map((s) => {
                    const isActive = activeStickerId === s.id;
                    return (
                        <div
                            key={s.id}
                            onMouseDown={(e) => startDrag(e, s.id)}
                            onTouchStart={(e) => startDrag(e, s.id)}
                            className={`absolute z-20 cursor-move`}
                            style={{ 
                                left: `${s.x}%`, top: `${s.y}%`, 
                                transform: `translate(-50%, -50%) scale(${s.scale || 1})`, 
                                width: '25%', touchAction: 'none'
                            }}
                        >
                            <img 
                                src={s.src} 
                                className={`w-full pointer-events-none select-none drop-shadow-lg transition-all ${isActive ? 'brightness-110 drop-shadow-[0_0_5px_rgba(255,255,0,0.8)]' : ''}`} 
                            />
                            {/* Kita hilangkan tombol X di canvas biar gak ribet, pindah ke bawah */}
                        </div>
                    );
                })}
            </div>

            {/* --- BOTTOM CONTROLS (Scrollable Drawer) --- */}
            <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] border-t border-zinc-100 z-30 flex flex-col max-h-[45vh]">
                
                {/* 1. LAYER MANAGER (SOLUSI ANTI NYANGKUT) */}
                {placedStickers.length > 0 && (
                    <div className="px-4 pt-4 pb-2 border-b border-zinc-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers size={12} className="text-zinc-400"/>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Active Layers ({placedStickers.length})</span>
                        </div>
                        {/* Horizontal Scroll List */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {placedStickers.map((s, index) => (
                                <div 
                                    key={s.id} 
                                    onClick={() => setActiveStickerId(s.id)}
                                    className={`relative flex-shrink-0 w-12 h-12 rounded-lg border-2 p-1 cursor-pointer transition-all ${activeStickerId === s.id ? 'border-yellow-400 bg-yellow-50' : 'border-zinc-200 bg-zinc-50'}`}
                                >
                                    <img src={s.src} className="w-full h-full object-contain" />
                                    
                                    {/* TOMBOL DELETE (X) DI SINI LEBIH AMAN */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemoveSticker(s.id); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-4 overflow-y-auto">
                    {/* 2. COLOR SLIDERS */}
                    <div className="flex justify-center gap-6 mb-4">
                        <div className="flex flex-col items-center">
                            <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1">Bright</label>
                            <input type="range" min="0.8" max="1.3" step="0.05" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-20 h-1.5 bg-zinc-200 rounded-lg appearance-none accent-black"/>
                        </div>
                        <div className="flex flex-col items-center">
                            <label className="text-[9px] uppercase font-bold text-zinc-400 mb-1">Sat</label>
                            <input type="range" min="0.8" max="1.5" step="0.1" value={saturation} onChange={(e) => setSaturation(parseFloat(e.target.value))} className="w-20 h-1.5 bg-zinc-200 rounded-lg appearance-none accent-black"/>
                        </div>
                    </div>

                    {/* 3. STICKER CAROUSEL */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <button onClick={(e) => { e.stopPropagation(); prevPage(); }} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full"><ChevronLeft size={20} /></button>
                        <div className="flex gap-2 overflow-hidden px-1">
                            {currentStickers.map((src, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); onAddSticker(src); }} className="h-16 w-16 bg-zinc-50 border border-zinc-200 rounded-xl p-1 hover:border-black transition flex-shrink-0">
                                    <img src={src} className="w-full h-full object-contain pointer-events-none" />
                                </button>
                            ))}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); nextPage(); }} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full"><ChevronRight size={20} /></button>
                    </div>

                    {/* 4. FINISH BUTTON */}
                    <button onClick={onFinish} className="w-full py-3 bg-black text-white rounded-full font-bold shadow-lg hover:scale-[1.01] transition flex items-center justify-center gap-2 mb-3">
                        FINISH <Check size={18} />
                    </button>
                    <button onClick={onRestart} className="w-full py-3 bg-white text-black rounded-full font-bold border border-zinc-200 hover:bg-zinc-100 transition flex items-center justify-center gap-2">
                        Ulang Sesi
                    </button>
                </div>
            </div>
            
            {/* Spacer */}
            <div className="h-72"></div>
        </div>
    );
}
