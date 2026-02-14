// src/app/api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Perhatikan: Kita menerima 2 jenis gambar dari Frontend
    // imageFinal: Gambar yang sudah ada Frame + Sticker + Edit
    // imageRaw: Gambar mentah polos
    const { imageFinal, imageRaw, imageRawParts, sessionId, pin } = body;

    // Validasi dasar (imageRaw opsional, tapi imageFinal wajib)
    if (!imageFinal || !sessionId || !pin) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Helper Function untuk Upload ke Cloudinary
    // Kita buat function biar kodenya rapi
    const uploadToCloudinary = async (base64Data, typeTag, extraContext = "") => {
        if (!base64Data) return null;

        const context = extraContext
          ? `access_pin=${pin}|${extraContext}`
          : `access_pin=${pin}`;

        return await cloudinary.uploader.upload(base64Data, {
            folder: 'photobooth_gallery', // Semua masuk folder yang sama biar rapi
            // TAG PENTING: 
            // 1. session_ID -> Biar bisa dicari per sesi
            // 2. type_final / type_raw -> Biar admin tau mana yang hasil edit, mana yang asli
            tags: [`session_${sessionId}`, typeTag], 
            context,
        });
    };

    console.log(`🚀 Uploading Session: ${sessionId}`);

    // Jalankan Upload Secara Paralel (Biar lebih cepat daripada satu per satu)
    const rawParts = Array.isArray(imageRawParts) ? imageRawParts.filter(Boolean) : [];

    const [uploadResultFinal, uploadResultRaw] = await Promise.all([
        uploadToCloudinary(imageFinal, 'type_final'),
        imageRaw ? uploadToCloudinary(imageRaw, 'type_raw') : Promise.resolve(null)
    ]);

    const uploadResultRawParts = await Promise.all(
      rawParts.map((rawPart, index) =>
        uploadToCloudinary(rawPart, 'type_raw_part', `shot_index=${index + 1}`)
      )
    );

    console.log(`✅ Upload Sukses: Final ${uploadResultFinal?.public_id}`);

    return NextResponse.json({ 
      success: true,
      url: uploadResultFinal.secure_url,
      // Kita kembalikan info kalau raw juga berhasil disimpan
      raw_url: uploadResultRaw ? uploadResultRaw.secure_url : null,
      raw_parts_count: uploadResultRawParts.length,
      raw_parts_urls: uploadResultRawParts.map((item) => item.secure_url),
    });

  } catch (error) {
    console.error("🔥 Upload Error:", error);
    return NextResponse.json({ error: error.message || "Gagal Upload" }, { status: 500 });
  }
}
