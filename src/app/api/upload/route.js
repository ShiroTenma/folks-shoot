import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';

// 1. Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // Ambil data dari frontend (Sekarang terima ID & PIN juga)
    const body = await req.json();
    const { image, sessionId, pin } = body; // <--- PERUBAHAN 1: Destructure data
    
    // Validasi kelengkapan data
    if (!image || !sessionId || !pin) {
      throw new Error("Data tidak lengkap (Butuh Image, SessionID, dan PIN)");
    }

    // --- TAHAP A: IMAGE PROCESSING (LOKAL) ---
    const inputBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    const processedBuffer = await sharp(inputBuffer)
      .resize(1200, 1800)
      .modulate({ 
        brightness: 1.1, 
        saturation: 1.1  
      })
      // Jika sudah ada frame.png, hapus komentar di bawah:
      /*
      .composite([{ 
        input: path.join(process.cwd(), 'public/frame.png'), 
        gravity: 'center' 
      }])
      */
      .jpeg({ quality: 90 })
      .toBuffer();

    // --- TAHAP B: UPLOAD KE CLOUDINARY DENGAN PIN ---
    const fileStr = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: 'photobooth_private_itk', // <--- Ganti folder biar rapi
      resource_type: 'image',
      
      // PERUBAHAN 2: Gunakan TAGS untuk mengelompokkan foto dalam satu sesi
      tags: [`session_${sessionId}`], 
      
      // PERUBAHAN 3: Gunakan CONTEXT untuk menyimpan PIN secara tersembunyi
      context: `access_pin=${pin}`,   
      
      eager: [{ width: 500, crop: "scale" }] 
    });

    // --- TAHAP C: SELESAI ---
    console.log(`Upload Sukses ke Sesi ${sessionId}`);
    
    return NextResponse.json({ 
      url: uploadResponse.secure_url,
      original_filename: uploadResponse.original_filename
    });

  } catch (error) {
    console.error("🔥 Upload Gagal:", error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses gambar' }, 
      { status: 500 }
    );
  }
}