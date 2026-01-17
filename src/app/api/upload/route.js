// src/app/api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { image, sessionId, pin } = body;

    if (!image || !sessionId || !pin) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Bersihkan Data Base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const inputBuffer = Buffer.from(base64Data, 'base64');

    // --- UPLOAD 1: FOTO ORIGINAL (TANPA EDIT) ---
    // Kita upload buffer mentah langsung
    const uploadOriginal = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'photobooth_original', // Folder khusus original
                tags: [`session_${sessionId}`, 'type_original'],
                context: `access_pin=${pin}`,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(inputBuffer);
    });

    // --- PROSES EDITING (FRAME & COLOR) ---
    // Ambil file frame dari folder public
    const framePath = path.join(process.cwd(), 'public', 'frame.png');
    
    // Cek apakah file frame ada? Kalau tidak ada, skip frame
    let compositeInput = [];
    try {
        await fs.access(framePath); // Cek file
        compositeInput.push({ input: framePath, gravity: 'center' }); // Tambah frame
    } catch (e) {
        console.log("⚠️ Frame.png tidak ditemukan di folder public, skip frame.");
    }

    const processedBuffer = await sharp(inputBuffer)
      .resize(1200, 1800, { fit: 'cover' }) // Paksa ukuran sama dengan frame
      .modulate({ brightness: 1.1, saturation: 1.2 }) // Preset Pencerah
      .composite(compositeInput) // <--- INI BAGIAN TEMPEL FRAME
      .jpeg({ quality: 90 })
      .toBuffer();

    const fileStrWithFrame = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    // --- UPLOAD 2: FOTO FINAL (DENGAN FRAME) ---
    const uploadFinal = await cloudinary.uploader.upload(fileStrWithFrame, {
      folder: 'photobooth_gallery',
      tags: [`session_${sessionId}`, 'type_final'],
      context: `access_pin=${pin}`,
    });

    console.log(`✅ Sukses: Original & Framed tersimpan untuk Sesi ${sessionId}`);
    
    return NextResponse.json({ 
      success: true,
      original_url: uploadOriginal.secure_url,
      final_url: uploadFinal.secure_url
    });

  } catch (error) {
    console.error("🔥 Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}