// src/app/api/album/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic'; // Wajib, agar data selalu fresh

export async function POST(req) {
  try {
    const { sessionId, pin } = await req.json();

    // 1. Validasi Input
    if (!sessionId || !pin) {
      return NextResponse.json({ error: "Session ID dan PIN harus diisi" }, { status: 400 });
    }

    console.log(`🔍 User mencari sesi: ${sessionId} dengan PIN: ${pin}`);

    // 2. Cari Gambar (The Matching Logic)
    // Kita mencari gambar yang punya TAG = session_X ... DAN ... CONTEXT access_pin = Y
    const result = await cloudinary.search
      .expression(`resource_type:image AND tags:session_${sessionId} AND context.access_pin=${pin}`)
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    // 3. Cek apakah ada hasil
    if (result.resources.length === 0) {
      console.log("❌ Foto tidak ketemu / PIN Salah");
      return NextResponse.json({ 
        error: "Foto tidak ditemukan atau PIN salah.",
        photos: [] 
      }, { status: 404 }); // 404 Not Found
    }

    // 4. Berhasil
    return NextResponse.json({ 
      photos: result.resources,
      total: result.total_count 
    });

  } catch (error) {
    console.error("🔥 Error Fetching Album:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}