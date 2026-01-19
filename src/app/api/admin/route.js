import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await cloudinary.search
      .expression('folder:photobooth_gallery')
      .with_field('context')
      .with_field('tags')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    const sessionsMap = {};

    result.resources.forEach((photo) => {
      const sessionTag = photo.tags.find(tag => tag.startsWith('session_'));
      const isFinal = photo.tags.includes('type_final');
      const isRaw = photo.tags.includes('type_raw');

      if (sessionTag) {
        const sessionId = sessionTag.replace('session_', '');
        let pin = "No PIN";
        if (photo.context) {
             if (photo.context.custom?.access_pin) pin = photo.context.custom.access_pin;
             else if (photo.context.access_pin) pin = photo.context.access_pin;
        }

        if (!sessionsMap[sessionId]) {
            sessionsMap[sessionId] = {
                id: sessionId, pin: pin, date: photo.created_at,
                finalUrl: null, rawUrl: null, count: 0
            };
        }
        sessionsMap[sessionId].count += 1;
        if (isFinal) sessionsMap[sessionId].finalUrl = photo.secure_url;
        if (isRaw) sessionsMap[sessionId].rawUrl = photo.secure_url;
        if (sessionsMap[sessionId].pin === "No PIN" && pin !== "No PIN") sessionsMap[sessionId].pin = pin;
      }
    });

    return NextResponse.json({ sessions: Object.values(sessionsMap) });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
        const { password, sessionId } = await req.json();
        if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!sessionId) return NextResponse.json({ error: "Session ID missing" }, { status: 400 });
        
        const result = await cloudinary.api.delete_resources_by_tag(`session_${sessionId}`);
        return NextResponse.json({ success: true, deleted: result });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}