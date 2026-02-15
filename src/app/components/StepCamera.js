// src/app/components/StepCamera.jsx
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function StepCamera({
  webcamRef,
  layout,
  photosCount,
  maxPhotos,
  onCapture,
  previewOverlay,
}) {
  const isStrip = layout === 'strip';
  const [facingMode, setFacingMode] = useState('user');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [flashPulse, setFlashPulse] = useState(false);

  const previewContainerClass = isStrip
    ? 'relative w-[94vw] max-w-[720px] aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden border-4 border-zinc-800 shadow-2xl'
    : 'relative w-full max-w-[500px] aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border-4 border-zinc-800 shadow-2xl';

  const COUNTDOWN_SECONDS = 3;
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);

  const getVideoTrack = () => webcamRef.current?.stream?.getVideoTracks?.()[0] || null;

  const syncTorchCapability = () => {
    const track = getVideoTrack();
    const capabilities = track && typeof track.getCapabilities === 'function'
      ? track.getCapabilities()
      : null;
    const supported = Boolean(capabilities && capabilities.torch);
    setTorchSupported(supported);
    if (!supported) setTorchOn(false);
  };

  const applyTorch = async (enabled) => {
    const track = getVideoTrack();
    if (!track || typeof track.applyConstraints !== 'function') return false;
    const capabilities = typeof track.getCapabilities === 'function'
      ? track.getCapabilities()
      : null;
    if (!capabilities?.torch) return false;

    try {
      await track.applyConstraints({ advanced: [{ torch: enabled }] });
      setTorchOn(enabled);
      return true;
    } catch {
      return false;
    }
  };

  const startCountdown = () => {
    if (countdown !== null) return;
    setCountdown(COUNTDOWN_SECONDS);
  };

  const toggleCamera = async () => {
    if (torchOn) await applyTorch(false);
    setTorchSupported(false);
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const toggleTorch = async () => {
    if (facingMode !== 'environment' || !torchSupported) return;
    await applyTorch(!torchOn);
  };

  useEffect(() => {
    if (countdown === null) return;

    let cancelled = false;
    if (countdown === 0) {
      const captureWithFlash = async () => {
        let usedRealTorch = false;

        if (facingMode === 'environment' && torchSupported) {
          usedRealTorch = await applyTorch(true);
          if (usedRealTorch) {
            await wait(120);
            await applyTorch(false);
          }
        }

        if (!usedRealTorch) {
          setFlashPulse(true);
          await wait(120);
          if (!cancelled) setFlashPulse(false);
        }

        if (cancelled) return;
        setCountdown(null);
        onCapture();
      };

      captureWithFlash();
      return () => {
        cancelled = true;
      };
    }

    timerRef.current = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown, facingMode, onCapture, torchSupported]);

  const videoConstraints = {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden z-50">
      <div className={previewContainerClass}>
        <Webcam
          key={facingMode}
          audio={false}
          ref={webcamRef}
          onUserMedia={syncTorchCapability}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.95}
          forceScreenshotSourceSize={true}
          videoConstraints={videoConstraints}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          mirrored={false}
        />

        <div className="absolute top-4 left-0 w-full text-center pointer-events-none z-20">
          <span className="bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-sm">
            {layout === 'single' ? 'Single Shot' : `Photo ${Math.min(photosCount + 1, maxPhotos)} / ${maxPhotos}`}
          </span>
        </div>

        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <button
            onClick={toggleCamera}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-black/60 text-white border border-white/20 hover:bg-black/80"
          >
            {facingMode === 'user' ? 'Front' : 'Back'}
          </button>
          <button
            onClick={toggleTorch}
            disabled={facingMode !== 'environment' || !torchSupported}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-black/60 text-white border border-white/20 hover:bg-black/80 disabled:opacity-40"
          >
            {torchOn ? 'Flash On' : 'Flash Off'}
          </button>
        </div>

        {previewOverlay && (
          <img
            src={previewOverlay}
            className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none z-30"
            alt="Preview Overlay"
          />
        )}

        <div className="absolute inset-0 z-10 opacity-30 pointer-events-none">
          {isStrip ? (
            Array.from({ length: Math.max(0, maxPhotos - 1) }).map((_, idx) => (
              <div
                key={idx}
                className="w-full border-b border-white/50 absolute left-0"
                style={{ top: `${((idx + 1) / maxPhotos) * 100}%` }}
              ></div>
            ))
          ) : (
            <>
              <div className="w-full h-1/3 border-b border-white/50 absolute top-0"></div>
              <div className="w-full h-1/3 border-b border-white/50 absolute top-1/3"></div>
              <div className="h-full w-1/3 border-r border-white/50 absolute left-0"></div>
              <div className="h-full w-1/3 border-r border-white/50 absolute left-1/3"></div>
            </>
          )}
        </div>

        {flashPulse && <div className="absolute inset-0 bg-white/85 pointer-events-none z-40"></div>}

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
            <span className="text-white text-7xl font-black drop-shadow-lg">
              {countdown === 0 ? 'SNAP' : countdown}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-3 z-40">
        <button
          onClick={startCountdown}
          disabled={countdown !== null}
          className="group relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] disabled:opacity-50"
        >
          <div className="w-16 h-16 bg-white rounded-full group-hover:bg-zinc-200 transition-colors"></div>
        </button>
        <p className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-medium animate-pulse">
          {countdown !== null ? 'Get Ready...' : 'Tap Shutter'}
        </p>
      </div>
    </div>
  );
}

