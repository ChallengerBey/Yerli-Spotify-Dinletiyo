import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Internal scrape API'sini kullan
    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240101.00.00'
            }
          },
          query: 'türkiye popüler müzik 2024 -shorts',
          params: 'EgIQAQ%3D%3D'
        })
      }
    );

    if (!response.ok) {
      throw new Error('YouTube internal API failed');
    }

    const data = await response.json();
    
    // Parse response
    const videos = [];
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
    
    for (const item of contents.slice(0, 10)) {
      if (item.videoRenderer) {
        const video = item.videoRenderer;
        const duration = video.lengthText?.simpleText || '0:00';
        
        // Duration filtresi: 1-5 dakika arası
        const durationParts = duration.split(':');
        let totalSeconds = 0;
        
        if (durationParts.length === 2) {
          totalSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
        } else if (durationParts.length === 3) {
          totalSeconds = parseInt(durationParts[0]) * 3600 + parseInt(durationParts[1]) * 60 + parseInt(durationParts[2]);
        }
        
        // 1-5 dakika arası
        if (totalSeconds >= 60 && totalSeconds <= 300) {
          videos.push({
            id: video.videoId,
            title: video.title?.runs?.[0]?.text || 'Unknown Title',
            description: video.title?.runs?.[0]?.text || '',
            thumbnail: video.thumbnail?.thumbnails?.[0]?.url || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            channelTitle: video.ownerText?.runs?.[0]?.text || 'Unknown Channel',
            position: videos.length + 1
          });
        }
      }
    }

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('YouTube scrape hatası:', error);
    return NextResponse.json(
      { videos: [], error: 'Top10 alınamadı' },
      { status: 502 }
    );
  }
}
