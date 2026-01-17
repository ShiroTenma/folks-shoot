// src/app/api/admin/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic'; // Agar data selalu fresh (tidak dicache)

export async function POST(req) {
  try {
    const { password } = await req.json();

    // 1. Cek Password Admin (Pastikan kamu sudah set ADMIN_PASSWORD di .env.local)
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Password Admin Salah!" }, { status: 401 });
    }

    // 2. Ambil semua foto terbaru (Limit 500 foto terakhir)
    // PENTING: .with_field('context') wajib ada agar data PIN terbawa
    const result = await cloudinary.search
      .expression('resource_type:image AND folder:photobooth_gallery') 
      .with_field('context')
      .with_field('tags')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    // 3. Grouping Data (Mengelompokkan Foto berdasarkan Session ID)
    const sessionsMap = {};

    result.resources.forEach((photo) => {
      // Cari tag yang formatnya "session_XYZ"
      const sessionTag = photo.tags.find(tag => tag.startsWith('session_'));
      
      if (sessionTag) {
        const sessionId = sessionTag.replace('session_', '');
        
        // --- LOGIKA AMBIL PIN (PERBAIKAN) ---
        // Cloudinary kadang menaruh context di `photo.context.custom` (struktur baru)
        // atau langsung di `photo.context` (struktur lama/simple)
        let pin = "No PIN";
        if (photo.context) {
            if (photo.context.custom && photo.context.custom.access_pin) {
                pin = photo.context.custom.access_pin;
            } else if (photo.context.access_pin) {
                pin = photo.context.access_pin;
            }
        }
        
        // Jika sesi ini belum ada di list map, buat baru
        if (!sessionsMap[sessionId]) {
            sessionsMap[sessionId] = {
                id: sessionId,
                pin: pin,
                date: photo.created_at,
                thumbnail: photo.secure_url, // Foto pertama sebagai cover
                totalPhotos: 1
            };
        } else {
            // Jika sesi sudah ada, kita update jumlah fotonya
            sessionsMap[sessionId].totalPhotos += 1;

            // Perbaikan Tambahan:
            // Jika foto pertama tadi tidak punya PIN (No PIN), tapi foto kedua ini punya PIN,
            // maka kita update PIN sesi tersebut agar tidak kosong.
            if (sessionsMap[sessionId].pin === "No PIN" && pin !== "No PIN") {
                sessionsMap[sessionId].pin = pin;
            }
        }
      }
    });

    // Ubah object map menjadi array agar bisa ditampilkan di Frontend
    const sessionsList = Object.values(sessionsMap);

    return NextResponse.json({ sessions: sessionsList });

  } catch (error) {
    console.error("Admin Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}