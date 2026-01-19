// src/app/utils/canvasGenerator.js

export const processFinalImage = async ({ 
    layout, photos, frame, stickers, brightness, saturation 
}) => {
    const width = layout === 'single' ? 1200 : 600;
    const height = 1800;
    
    // Fungsi pembantu untuk menggambar layer dasar (Foto User)
    // Ini dipakai 2 kali: untuk Raw dan untuk Final
    const drawBaseLayer = async (ctx) => {
        // 1. Background Putih
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // 2. Filter Warna
        ctx.filter = `brightness(${brightness}) saturate(${saturation})`;

        const loadImg = (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

        if (layout === 'single') {
            const img = await loadImg(photos[0]);
            const scale = Math.max(width / img.width, height / img.height);
            const x = (width / 2) - (img.width / 2) * scale;
            const y = (height / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } else {
            const photoH = height / 3; 
            for (let i = 0; i < photos.length; i++) {
                const img = await loadImg(photos[i]);
                ctx.drawImage(img, 0, i * photoH, width, photoH);
            }
        }
        ctx.filter = 'none'; // Reset filter
    };

    // --- PROSES 1: GAMBAR RAW (Hanya Foto) ---
    const canvasRaw = document.createElement('canvas');
    canvasRaw.width = width;
    canvasRaw.height = height;
    const ctxRaw = canvasRaw.getContext('2d');
    
    await drawBaseLayer(ctxRaw); // Gambar foto saja
    const rawBase64 = canvasRaw.toDataURL('image/jpeg', 0.95);


    // --- PROSES 2: GAMBAR FINAL (Frame + Sticker) ---
    const canvasFinal = document.createElement('canvas');
    canvasFinal.width = width;
    canvasFinal.height = height;
    const ctxFinal = canvasFinal.getContext('2d');

    // Salin gambar Raw ke Canvas Final sebagai dasar
    ctxFinal.drawImage(canvasRaw, 0, 0);

    const loadImg = (src) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null); // Ignore error
        img.src = src;
    });

    // Layer Frame
    if (frame && frame.src) {
        const frameImg = await loadImg(frame.src);
        if (frameImg) ctxFinal.drawImage(frameImg, 0, 0, width, height);
    }

    // Layer Sticker (Support Rotate & Scale)
    for (let s of stickers) {
        const stickerImg = await loadImg(s.src);
        if (stickerImg) {
            const px = (s.x / 100) * width;
            const py = (s.y / 100) * height;
            
            // Default size 25% dari lebar canvas
            const baseSize = width * 0.25; 
            // Terapkan scaling dari user
            const currentSize = baseSize * (s.scale || 1); 

            ctxFinal.save(); // Simpan state canvas sebelum rotasi
            ctxFinal.translate(px, py); // Pindahkan titik pusat ke tengah sticker
            ctxFinal.rotate((s.rotation || 0) * Math.PI / 180); // Putar (Degree to Radian)
            
            // Gambar sticker (offset -1/2 size agar berputar di poros tengah)
            ctxFinal.drawImage(stickerImg, -currentSize/2, -currentSize/2, currentSize, currentSize);
            
            ctxFinal.restore(); // Kembalikan state canvas
        }
    }

    const finalBase64 = canvasFinal.toDataURL('image/jpeg', 0.95);

    return { rawBase64, finalBase64 };
};