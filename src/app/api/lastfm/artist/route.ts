import { NextRequest, NextResponse } from 'next/server';

const API_KEY = "1a0b32c31250e3d32390b16286fab488";
const API_ROOT = "https://ws.audioscrobbler.com/2.0/";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist');

  if (!artist) {
    return NextResponse.json(
      { error: 'Artist name is required' },
      { status: 400 }
    );
  }

  try {
    // Last.fm API'den sanatçı bilgisi al
    const response = await fetch(
      `${API_ROOT}?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return NextResponse.json({ imageUrl: null });
    }

    const data = await response.json();

    // Sanatçı fotoğrafını al
    if (data.artist && data.artist.image) {
      const imageUrl = 
        data.artist.image.find((img: any) => img.size === 'extralarge')?.['#text'] ||
        data.artist.image.find((img: any) => img.size === 'large')?.['#text'] ||
        data.artist.image.find((img: any) => img.size === 'medium')?.['#text'];
      
      if (imageUrl) {
        console.log(`✅ Last.fm artist image: ${artist} -> ${imageUrl}`);
        return NextResponse.json({ imageUrl });
      }
    }

    console.log(`⚠️ Last.fm'de sanatçı fotoğrafı bulunamadı: ${artist}`);
    return NextResponse.json({ imageUrl: null });
  } catch (error) {
    console.error('Last.fm API error:', error);
    return NextResponse.json({ imageUrl: null });
  }
}
