"use client";
import React, { useRef, useState, useCallback } from 'react';
import StepHome from './components/StepHome';
import StepSelection from './components/StepSelection';
import StepCamera from './components/StepCamera';
import StepEdit from './components/StepEdit';
import StepResult from './components/StepResult';
import { processFinalImage } from './utils/canvasGenerator';

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
    '/stickers/s1.png', '/stickers/s2.png', '/stickers/s3.png', '/stickers/logo.png',
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
    const imageSrc = webcamRef.current.getScreenshot({width: 1920, height: 1080});
    if (!imageSrc) return;
    const newPhotos = [...photos, imageSrc];
    setPhotos(newPhotos);
    const maxPhotos = layout === 'single' ? 1 : 3;
    if (newPhotos.length >= maxPhotos) setTimeout(() => setStep('edit'), 500); 
  }, [webcamRef, photos, layout]);

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
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageFinal: finalBase64, imageRaw: rawBase64, sessionId, pin }),
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

  return (
    <main className="font-sans text-black selection:bg-black selection:text-white bg-white min-h-screen">
        {step === 'home' && <StepHome onStart={handleStartSelection} />}
        {step === 'select' && <StepSelection layout={layout} setLayout={setLayout} selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame} assets={ASSETS} onBack={goHome} onNext={handleConfirmSelection} />}
        {step === 'camera' && <StepCamera webcamRef={webcamRef} layout={layout} photosCount={photos.length} onCapture={handleCapture} frameOverlay={selectedFrame?.src} />}
        {step === 'edit' && <StepEdit layout={layout} photos={photos} frame={selectedFrame} stickersList={ASSETS.stickers} placedStickers={placedStickers} onAddSticker={handleAddSticker} onRemoveSticker={handleRemoveSticker} onUpdateSticker={handleUpdateSticker} onClearStickers={handleClearStickers} onFinish={handleFinish} brightness={brightness} setBrightness={setBrightness} saturation={saturation} setSaturation={setSaturation} />}
        {(step === 'uploading' || step === 'result') && <StepResult isUploading={step === 'uploading'} finalImage={finalImage} resultUrl={resultUrl} pin={pin} onHome={goHome} />}
    </main>
  );
}