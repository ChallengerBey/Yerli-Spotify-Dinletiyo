import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'türkçe müzik';

  try {
    // YouTube'un kendi internal API'sini kullan (sınırsız)
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
          query: query + ' music -shorts',
          params: 'EgIQAQ%3D%3D' // Video filter
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
    
    for (const item of contents.slice(0, 20)) {
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
        
        // 1-5 dakika arası (60-300 saniye)
        if (totalSeconds >= 60 && totalSeconds <= 300) {
          videos.push({
            id: video.videoId,
            title: video.title?.runs?.[0]?.text || 'Unknown Title',
            thumbnail: video.thumbnail?.thumbnails?.[0]?.url || '',
            duration: duration,
            channelTitle: video.ownerText?.runs?.[0]?.text || 'Unknown Channel'
          });
        }
      }
    }

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube scrape error:', error);
    
    // Fallback data
    const fallbackVideos = [
      { id: 'BNAEBRXlUlk', title: 'Ceza - Rapstar', thumbnail: 'https://i.ytimg.com/vi/BNAEBRXlUlk/maxresdefault.jpg', duration: '4:12', channelTitle: 'Ceza' },
      { id: 'BypWUfBsNlE', title: 'Ceza - Holocaust', thumbnail: 'https://i.ytimg.com/vi/BypWUfBsNlE/maxresdefault.jpg', duration: '5:45', channelTitle: 'Ceza' },
      { id: 'rxlKhwHkRP0', title: 'Sagopa Kajmer - Bir Pesimistin Gözyaşları', thumbnail: 'https://i.ytimg.com/vi/rxlKhwHkRP0/maxresdefault.jpg', duration: '6:23', channelTitle: 'Sagopa Kajmer' },
      { id: 'qDptS1C7rkE', title: 'Norm Ender - Karma', thumbnail: 'https://i.ytimg.com/vi/qDptS1C7rkE/maxresdefault.jpg', duration: '3:55', channelTitle: 'Norm Ender' },
      { id: 'gyCADiiKmPs', title: 'Şanışer - Susamam', thumbnail: 'https://i.ytimg.com/vi/gyCADiiKmPs/maxresdefault.jpg', duration: '14:55', channelTitle: 'Şanışer' },
      { id: 'HhZaHf8RP6g', title: 'Ezhel - Geceler', thumbnail: 'https://i.ytimg.com/vi/HhZaHf8RP6g/maxresdefault.jpg', duration: '3:42', channelTitle: 'Ezhel' }
    ];
    
    return NextResponse.json({ videos: fallbackVideos });
  }
}