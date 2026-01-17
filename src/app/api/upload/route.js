// src/app/api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import sharp from 'sharp'; // Pastikan sudah npm install sharp

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { image, sessionId, pin } = body;

    // 1. Validasi: Pastikan data lengkap
    if (!image || !sessionId || !pin) {
      return NextResponse.json({ error: "Data tidak lengkap (Butuh Image, ID, & PIN)" }, { status: 400 });
    }

    // 2. Proses Gambar dengan Sharp (Resize biar ringan & hemat kuota)
    // Hapus prefix base64 jika ada
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const processedBuffer = await sharp(buffer)
      .resize(1200) // Resize lebar ke 1200px (cukup HD untuk HP)
      .jpeg({ quality: 80 }) // Kompresi JPEG 80%
      .toBuffer();

    // Ubah balik ke base64 untuk upload
    const fileStr = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    // 3. Upload ke Cloudinary
    // PENTING: Kita pasang 'tags' dan 'context' agar bisa dicari nanti di route album
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: 'photobooth_gallery', // Nama folder di Cloudinary
      tags: [`session_${sessionId}`], // TAG: Untuk mengelompokkan foto per sesi
      context: `access_pin=${pin}`,    // CONTEXT: Untuk menyimpan PIN sebagai password
    });

    console.log(`✅ Upload Sukses: Sesi ${sessionId}`);
    
    return NextResponse.json({ 
      success: true,
      url: uploadResponse.secure_url 
    });

  } catch (error) {
    console.error("🔥 Upload Error:", error);
    return NextResponse.json({ error: "Gagal Upload: " + error.message }, { status: 500 });
  }
}