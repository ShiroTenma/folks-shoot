// src/app/utils/canvasGenerator.js

export const processFinalImage = async ({ 
    layout, photos, frame, stickers, brightness, saturation 
}) => {
    // 1. Tentukan Ukuran Canvas
    // Single: 1200x1800 (Rasio 2:3)
    // Strip: 600x1800 (Rasio 1:3)
    const width = layout === 'single' ? 1200 : 600;
    const height = 1800;
    const slots = layout === 'single' ? 1 : (frame?.id === 's8' ? 2 : 3);
    const padX = layout === 'single' ? 0 : (frame?.id === 's8' ? 60 : 0); // px
    const padTop = layout === 'single' ? 0 : (frame?.id === 's8' ? 70 : 0); // px
    const padBottom = layout === 'single' ? 0 : (frame?.id === 's8' ? 190 : 0); // px

    // --- FUNGSI UTAMA MENGGAMBAR FOTO (BASE LAYER) ---
    const drawBaseLayer = async (ctx) => {
        // A. Background Putih
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // B. Set Filter Warna
        ctx.filter = `brightness(${brightness}) saturate(${saturation})`;

        // Helper Load Image
        const loadImg = (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

        // --- LOGIKA SINGLE SHOT ---
        if (layout === 'single') {
            const img = await loadImg(photos[0]);
            
            // Hitung Scaling biar 'Cover' (Tidak Gepeng)
            const scale = Math.max(width / img.width, height / img.height);
            const x = (width / 2) - (img.width / 2) * scale;
            const y = (height / 2) - (img.height / 2) * scale;
            
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } 
        // --- LOGIKA STRIP SHOT (REVISI BIAR GAK STRETCH) ---
        else {
            const slotHeight = (height - padTop - padBottom) / slots; 
            const slotWidth = width - padX * 2;       

            for (let i = 0; i < photos.length; i++) {
                const img = await loadImg(photos[i]);
                
                // Koordinat Y awal untuk foto ke-i
                const startY = padTop + i * slotHeight;

                // 1. Hitung Rasio Scaling (Pilih yang paling besar agar menutupi area)
                const scale = Math.max(slotWidth / img.width, slotHeight / img.height);
                
                // 2. Hitung Ukuran Baru setelah discaling
                const dWidth = img.width * scale;
                const dHeight = img.height * scale;

                // 3. Hitung Posisi Tengah (Center Crop)
                // (LebarSlot - LebarGambarBaru) / 2
                const dx = padX + (slotWidth - dWidth) / 2;
                // (TinggiSlot - TinggiGambarBaru) / 2
                const dy = (slotHeight - dHeight) / 2;

                // 4. Gambar dengan Clipping (Agar tidak bocor ke kotak lain)
                ctx.save(); // Simpan state canvas
                
                // Bikin area potong (hanya boleh gambar di kotak ini)
                ctx.beginPath();
                ctx.rect(padX, startY, slotWidth, slotHeight);
                ctx.clip();

                // Gambar Foto (perhatikan offset Y ditambah startY)
                ctx.drawImage(img, dx, startY + dy, dWidth, dHeight);
                
                ctx.restore(); // Kembalikan state canvas (hilangkan clip)
            }
        }
        
        ctx.filter = 'none'; // Reset filter agar Frame & Sticker warnanya normal
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
