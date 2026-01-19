// src/app/api/admin/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic'; // Agar data selalu fresh

// --- 1. GET DATA (POST method karena butuh body password) ---
export async function POST(req) {
  try {
    const { password } = await req.json();

    // Validasi Password
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil data dari Cloudinary
    const result = await cloudinary.search
      .expression('folder:photobooth_gallery') // Ambil semua di folder ini
      .with_field('context') // Ambil metadata (PIN)
      .with_field('tags')    // Ambil tags (Session ID & Type)
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    // Grouping Data berdasarkan Session ID
    const sessionsMap = {};

    result.resources.forEach((photo) => {
      // Cari tag "session_XXXX"
      const sessionTag = photo.tags.find(tag => tag.startsWith('session_'));
      // Cari tipe "type_final" atau "type_raw"
      const isFinal = photo.tags.includes('type_final');
      const isRaw = photo.tags.includes('type_raw');

      if (sessionTag) {
        const sessionId = sessionTag.replace('session_', '');
        
        // Ambil PIN dari context
        let pin = "No PIN";
        if (photo.context) {
             if (photo.context.custom?.access_pin) pin = photo.context.custom.access_pin;
             else if (photo.context.access_pin) pin = photo.context.access_pin;
        }

        // Inisialisasi object sesi jika belum ada
        if (!sessionsMap[sessionId]) {
            sessionsMap[sessionId] = {
                id: sessionId,
                pin: pin,
                date: photo.created_at,
                finalUrl: null, // URL Foto Framed
                rawUrl: null,   // URL Foto Polos
                count: 0
            };
        }

        // Update data sesi
        sessionsMap[sessionId].count += 1;
        
        // Simpan URL sesuai tipe
        if (isFinal) sessionsMap[sessionId].finalUrl = photo.secure_url;
        if (isRaw) sessionsMap[sessionId].rawUrl = photo.secure_url;
        
        // Update PIN jika sebelumnya kosong tapi sekarang ada
        if (sessionsMap[sessionId].pin === "No PIN" && pin !== "No PIN") {
            sessionsMap[sessionId].pin = pin;
        }
      }
    });

    const sessionsList = Object.values(sessionsMap);
    return NextResponse.json({ sessions: sessionsList });

  } catch (error) {
    console.error("Admin Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// --- 2. DELETE DATA ---
export async function DELETE(req) {
    try {
        const { password, sessionId } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID missing" }, { status: 400 });
        }

        // Hapus semua foto dengan tag session_ID tersebut
        const result = await cloudinary.api.delete_resources_by_tag(`session_${sessionId}`);

        return NextResponse.json({ success: true, deleted: result });

    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}