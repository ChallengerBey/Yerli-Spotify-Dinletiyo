import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID gerekli' }, { status: 400 });
    }

    // Basit YouTube embed URL'si döndür
    const audioUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0`;
    
    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Stream hatası:', error);
    return NextResponse.json({ error: 'Ses akışı alınamadı' }, { status: 500 });
  }
}