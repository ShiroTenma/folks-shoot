"use client";
import React, { useRef, useState, useCallback } from 'react';
import StepHome from './components/StepHome';
import StepSelection from './components/StepSelection';
import StepCamera from './components/StepCamera';
import StepEdit from './components/StepEdit';
import StepResult from './components/StepResult';
import { processFinalImage } from './utils/canvasGenerator';
import { getFrameLayoutConfig } from './utils/frameLayoutConfig';

const ASSETS = {
  frames: {
    single: [
      { id: 'f1', name: 'Cream Minimal', src: '/frames/single1.png' }, 
      { id: 'f2', name: 'Midnight Bold', src: '/frames/single2.png' },
    ],
    strip: [
      { id: 's1', name: 'Classic Strip', src: '/frames/strip1.png' }, 
      { id: 's2', name: 'Mono Noir', src: '/frames/strip2.png' }, 
      { id: 's3', name: 'Soft Grey', src: '/frames/strip3.png' }, 
      { id: 's4', name: 'Electric Blue', src: '/frames/strip4.png' }, 
      { id: 's5', name: 'Sunrise Amber', src: '/frames/strip5.png' }, 
      { id: 's6', name: 'Leafy Green', src: '/frames/strip6.png' }, 
      { id: 's7', name: 'Crimson Pop', src: '/frames/strip7.png' }, 
      { id: 's8', name: 'Aqua Glow', src: '/frames/strip8.png' }, 
      { id: 's9', name: 'Violet Haze', src: '/frames/strip9.png' }, 
    ]
  },
  stickers: [
    '/stickers/Alert_.png',
    '/stickers/Angy.png',
    '/stickers/Crown.png',
    '/stickers/Daun.png',
    '/stickers/Emot%20jujur%20engga%20tau.png',
    '/stickers/Hi!.png',
    '/stickers/Kacamata_.png',
    '/stickers/Kemonomimi.png',
    '/stickers/Lope.png',
    '/stickers/Lope%5E2.png',
    '/stickers/Nekomimi.png',
    '/stickers/OH.png',
    '/stickers/Pita.png',
    '/stickers/Wow!!.png',
    '/stickers/%E3%81%8B%E3%82%8F%E3%81%84%E3%81%84_.png',
    '/stickers/StarBurst.png',
    '/stickers/SparkleMint.png',
    '/stickers/SpeechBubble.png',
  ]
};

const generateSessionId = () => Math.random().toString(36).substring(2, 6).toUpperCase();
const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

export default function FolkshootPage() {
  const webcamRef = useRef(null);
  const [step, setStep] = useState('home'); 
  const [layout, setLayout] = useState('single'); 
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [brightness, setBrightness] = useState(1.05);
  const [saturation, setSaturation] = useState(1.1);
  const [finalImage, setFinalImage] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [pin, setPin] = useState("");

  const goHome = () => {
    setStep('home'); setPhotos([]); setPlacedStickers([]);
    setFinalImage(null); setResultUrl(""); setSelectedFrame(null);
  };

  const handleStartSelection = () => setStep('select');

  const handleConfirmSelection = () => {
    if (!selectedFrame) {
        const list = layout === 'single' ? ASSETS.frames.single : ASSETS.frames.strip;
        setSelectedFrame(list[0]);
    }
    setSessionId(generateSessionId()); setPin(generatePin()); setPhotos([]);
    setStep('camera');
  };

  const handleCapture = useCallback(() => {
    const maxPhotos = getFrameLayoutConfig(layout, selectedFrame?.id).maxPhotos;
    // Jangan paksa ukuran screenshot agar rasio kamera asli tetap terjaga.
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    const newPhotos = [...photos, imageSrc];
    setPhotos(newPhotos);
    if (newPhotos.length >= maxPhotos) setTimeout(() => setStep('edit'), 500); 
  }, [webcamRef, photos, layout, selectedFrame]);

  const handleAddSticker = (src) => setPlacedStickers([...placedStickers, { id: Date.now(), src, x: 50, y: 50, scale: 1, rotation: 0 }]);
  const handleUpdateSticker = (id, newAttr) => setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...newAttr } : s));
  const handleRemoveSticker = (id) => setPlacedStickers(prev => prev.filter(s => s.id !== id));
  const handleClearStickers = () => setPlacedStickers([]);

  const handleFinish = async () => {
    setStep('uploading');
    try {
        const { finalBase64, rawBase64 } = await processFinalImage({
            layout, photos, frame: selectedFrame, stickers: placedStickers, brightness, saturation
        });
        setFinalImage(finalBase64); 
        const imageRawParts = layout === 'strip' ? photos : [];
        const imageRawToUpload = layout === 'single' ? rawBase64 : null;
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageFinal: finalBase64, imageRaw: imageRawToUpload, imageRawParts, sessionId, pin }),
        });
        if (res.ok) {
            const baseUrl = window.location.origin;
            setResultUrl(`${baseUrl}/album/${sessionId}`);
            setStep('result');
        } else {
            alert("Upload gagal."); setStep('edit');
        }
    } catch (e) { alert("Error koneksi."); setStep('edit'); }
  };

  const frameLayoutConfig = getFrameLayoutConfig(layout, selectedFrame?.id);

  return (
    <main className="font-sans text-black selection:bg-black selection:text-white bg-white min-h-screen">
        {step === 'home' && <StepHome onStart={handleStartSelection} />}
        {step === 'select' && <StepSelection layout={layout} setLayout={setLayout} selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame} assets={ASSETS} onBack={goHome} onNext={handleConfirmSelection} />}
        {step === 'camera' && <StepCamera webcamRef={webcamRef} layout={layout} photosCount={photos.length} maxPhotos={frameLayoutConfig.maxPhotos} onCapture={handleCapture} previewOverlay={layout === 'single' ? '/frames/preview-single.png' : null} />}
        {step === 'edit' && <StepEdit layout={layout} photos={photos} frame={selectedFrame} stickersList={ASSETS.stickers} placedStickers={placedStickers} onAddSticker={handleAddSticker} onRemoveSticker={handleRemoveSticker} onUpdateSticker={handleUpdateSticker} onClearStickers={handleClearStickers} onFinish={handleFinish} onRestart={goHome} brightness={brightness} setBrightness={setBrightness} saturation={saturation} setSaturation={setSaturation} />}
        {(step === 'uploading' || step === 'result') && <StepResult isUploading={step === 'uploading'} finalImage={finalImage} resultUrl={resultUrl} pin={pin} layout={layout} onHome={goHome} />}
    </main>
  );
}
