import { NextResponse } from 'next/server';

// Audius API host'u için discovery endpoint'i
const AUDIUS_DISCOVERY_URL = 'https://api.audius.co';

// Örnek veri - API çalışmazsa kullanılacak
const sampleData = {
  tracks: [
    {
      id: '1',
      title: 'Türkçe Pop Hit 1',
      description: '2024 yılının en çok dinlenen pop şarkılarından',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      artist: 'Sanatçı 1',
      audioUrl: 'https://example.com/audio1.mp3',
      duration: 180,
      genre: 'pop',
      position: 1
    },
    // Diğer örnek şarkılar...
  ]
};

// Audius API host'unu bul
async function getAudiusHost() {
  try {
    const response = await fetch(AUDIUS_DISCOVERY_URL);
    const data = await response.json();
    // Rastgele bir host seç
    const hosts = data.data || [];
    return hosts[Math.floor(Math.random() * hosts.length)];
  } catch (error) {
    console.error('Audius host bulunamadı:', error);
    return null;
  }
}

export async function GET() {
  try {
    const host = await getAudiusHost();
    
    if (!host) {
      console.warn('Audius host bulunamadı. Örnek veri kullanılıyor.');
      return NextResponse.json(sampleData);
    }
    
    // Popüler şarkıları çek
    const response = await fetch(
      `${host}/v1/tracks/trending?app_name=DINLETIYO&time=week`,
      {
        next: { revalidate: 3600 } // 1 saat önbellekleme
      }
    );

    if (!response.ok) {
      throw new Error(`Audius API hatası: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json(sampleData);
    }
    
    // Sadece gerekli bilgileri filtrele ve stream_url kontrolü yap
    const tracks = data.data
      .filter((track: any) => track.stream_url) // Sadece stream_url'si olanları al
      .map((track: any, index: number) => ({
        id: track.id,
        title: track.title,
        description: track.description || '',
        thumbnail: track.artwork?.['150x150'] || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        artist: track.user?.name || 'Bilinmeyen Sanatçı',
        audioUrl: track.stream_url ? `${host}${track.stream_url}?app_name=DINLETIYO` : '',
        duration: Math.floor(track.duration || 180),
        genre: track.genre || 'pop',
        position: index + 1,
      }));

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('Audius API Hatası:', error);
    return NextResponse.json(sampleData);
  }
}
