import React from 'react';

export default function StepHome({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in duration-700 bg-white">
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">FOLKSHOOT</h1>
      <p className="text-zinc-500 uppercase tracking-[0.4em] text-sm mb-12 border-b border-zinc-300 pb-4">Capture Your Soul</p>
      <button onClick={onStart} className="group px-12 py-5 bg-black text-white text-xl font-bold rounded-full hover:scale-105 transition-all shadow-2xl">
        Start Session
      </button>
    </div>
  );
}