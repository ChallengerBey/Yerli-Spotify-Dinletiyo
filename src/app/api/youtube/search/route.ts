import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = searchParams.get('maxResults') || '10';
  
  if (!query) {
    return NextResponse.json(
      { error: 'Arama terimi gerekli' },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+müzik&type=video&videoCategoryId=10&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('YouTube API hatası');
    }

    const data = await response.json();
    
    // Sadece gerekli bilgileri filtrele
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube API Hatası:', error);
    return NextResponse.json(
      { error: 'Müzik aranırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
