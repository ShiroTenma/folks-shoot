"use client";
import React, { useRef, useState, useCallback } from 'react';

// --- IMPORT COMPONENTS ---
import StepHome from './components/StepHome';
import StepSelection from './components/StepSelection';
import StepCamera from './components/StepCamera';
import StepEdit from './components/StepEdit';
import StepResult from './components/StepResult';

// --- IMPORT UTILS ---
import { processFinalImage } from './utils/canvasGenerator';

// --- KONFIGURASI ASET ---
const ASSETS = {
  frames: {
    single: [
      { id: 'f1', name: 'Simple White', src: '/frames/frame1.png' }, 
      { id: 'f2', name: 'Cool Black', src: '/frames/frame2.png' },
    ],
    strip: [
      { id: 's1', name: 'Classic Strip', src: '/frames/strip1.png' }, 
    ]
  },
  stickers: [
    '/stickers/s1.png',
    '/stickers/s2.png',
    '/stickers/s3.png',
    '/stickers/logo.png',
  ]
};

// --- HELPER FUNCTIONS ---
const generateSessionId = () => Math.random().toString(36).substring(2, 6).toUpperCase();
const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

export default function FolkshootPage() {
  const webcamRef = useRef(null);
  
  // --- STATE ---
  const [step, setStep] = useState('home'); 
  const [layout, setLayout] = useState('single'); 
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [photos, setPhotos] = useState([]);
  
  // Edit State
  const [placedStickers, setPlacedStickers] = useState([]);
  const [brightness, setBrightness] = useState(1.05);
  const [saturation, setSaturation] = useState(1.1);

  // Result State
  const [finalImage, setFinalImage] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [pin, setPin] = useState("");

  // --- ACTIONS ---

  const goHome = () => {
    setStep('home');
    setPhotos([]);
    setPlacedStickers([]);
    setFinalImage(null);
    setResultUrl("");
    setBrightness(1.05);
    setSaturation(1.1);
    setSelectedFrame(null);
  };

  const handleStartSelection = () => setStep('select');

  const handleConfirmSelection = () => {
    if (!selectedFrame) {
        const list = layout === 'single' ? ASSETS.frames.single : ASSETS.frames.strip;
        setSelectedFrame(list[0]);
    }
    setSessionId(generateSessionId());
    setPin(generatePin());
    setPhotos([]);
    setStep('camera');
  };

  const handleCapture = useCallback(() => {
    // Ambil resolusi tinggi (1080p)
    const imageSrc = webcamRef.current.getScreenshot({width: 1920, height: 1080});
    if (!imageSrc) return;

    const newPhotos = [...photos, imageSrc];
    setPhotos(newPhotos);

    const maxPhotos = layout === 'single' ? 1 : 3;
    if (newPhotos.length >= maxPhotos) {
        setTimeout(() => setStep('edit'), 500); 
    }
  }, [webcamRef, photos, layout]);

  // Sticker Logic
  const handleAddSticker = (src) => {
    setPlacedStickers([...placedStickers, { id: Date.now(), src, x: 50, y: 50, scale: 1, rotation: 0 }]);
  };

  const handleUpdateSticker = (id, newAttributes) => {
    setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...newAttributes } : s));
  };

  const handleRemoveSticker = (id) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleClearStickers = () => setPlacedStickers([]);

  // --- UPLOAD LOGIC ---
  const handleFinish = async () => {
    setStep('uploading');
    
    try {
        // 1. Generate 2 Gambar (Final & Raw) menggunakan Canvas
        const { finalBase64, rawBase64 } = await processFinalImage({
            layout, 
            photos, 
            frame: selectedFrame, 
            stickers: placedStickers, 
            brightness, 
            saturation
        });
        
        setFinalImage(finalBase64); 

        // 2. Upload ke Backend API
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                imageFinal: finalBase64, 
                imageRaw: rawBase64,
                sessionId, 
                pin 
            }),
        });

        if (res.ok) {
            const baseUrl = window.location.origin;
            setResultUrl(`${baseUrl}/album/${sessionId}`);
            setStep('result');
        } else {
            const data = await res.json();
            alert(`Upload gagal: ${data.error}`);
            setStep('edit');
        }
    } catch (e) {
      console.error(e);
      alert("Error koneksi internet.");
      setStep('edit');
    }
  };

  // --- RENDER ---
  return (
    <main className="font-sans text-black selection:bg-black selection:text-white bg-white min-h-screen">
        {step === 'home' && <StepHome onStart={handleStartSelection} />}
        
        {step === 'select' && (
            <StepSelection 
                layout={layout} setLayout={setLayout} 
                selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame} 
                assets={ASSETS} onBack={goHome} onNext={handleConfirmSelection} 
            />
        )}
        
        {step === 'camera' && (
            <StepCamera 
                webcamRef={webcamRef} layout={layout} 
                photosCount={photos.length} onCapture={handleCapture} 
                frameOverlay={selectedFrame?.src} 
            />
        )}
        
        {step === 'edit' && (
            <StepEdit 
                layout={layout} photos={photos} frame={selectedFrame} stickersList={ASSETS.stickers}
                placedStickers={placedStickers} onAddSticker={handleAddSticker} 
                onRemoveSticker={handleRemoveSticker} onUpdateSticker={handleUpdateSticker} 
                onClearStickers={handleClearStickers} onFinish={handleFinish}
                brightness={brightness} setBrightness={setBrightness} 
                saturation={saturation} setSaturation={setSaturation}
            />
        )}
        
        {(step === 'uploading' || step === 'result') && (
            <StepResult 
                isUploading={step === 'uploading'} finalImage={finalImage} 
                resultUrl={resultUrl} pin={pin} onHome={goHome} 
            />
        )}
    </main>
  );
}