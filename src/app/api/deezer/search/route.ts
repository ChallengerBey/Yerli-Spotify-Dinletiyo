import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist');
  const title = searchParams.get('title');

  if (!artist || !title) {
    return NextResponse.json(
      { error: 'Artist and title are required' },
      { status: 400 }
    );
  }

  try {
    // Deezer API'ye istek at
    const query = `${artist} ${title}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniye timeout
    
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}`,
      { 
        cache: 'no-store',
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`⚠️ Deezer API yanıt vermedi (${response.status}): ${query}`);
      return NextResponse.json({ coverUrl: null });
    }

    const data = await response.json();

    // İlk sonucu al
    if (data.data && data.data.length > 0) {
      const track = data.data[0];
      // Deezer'dan en yüksek kaliteli kapağı al (500x500)
      const coverUrl = track.album?.cover_xl || track.album?.cover_big || track.album?.cover_medium;
      
      if (coverUrl) {
        console.log(`✅ Deezer cover bulundu: ${query} -> ${coverUrl}`);
      } else {
        console.log(`⚠️ Deezer'da şarkı bulundu ama cover yok: ${query}`);
      }
      
      return NextResponse.json({ coverUrl });
    }

    console.log(`⚠️ Deezer'da sonuç bulunamadı: ${query}`);
    return NextResponse.json({ coverUrl: null });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Deezer API timeout:', artist, title);
    } else {
      console.error('Deezer API error:', error);
    }
    return NextResponse.json({ coverUrl: null });
  }
}
