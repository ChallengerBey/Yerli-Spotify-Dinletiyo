import { NextResponse } from 'next/server';

// Örnek veri - API çalışmazsa kullanılacak
const sampleData = {
  videos: [
    {
      id: 'dQw4w9WgXc1',
      title: 'Türkçe Pop Hit 1',
      description: '2024 yılının en çok dinlenen pop şarkılarından',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Resmi Müzik',
      position: 1
    },
    {
      id: 'dQw4w9WgXc2',
      title: 'Türkçe Rock Klasik',
      description: 'Efsanevi Türkçe rock şarkısı',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Rock FM',
      position: 2
    },
    {
      id: 'dQw4w9WgXc3',
      title: 'Arabesk Fırtınası',
      description: 'Gönülleri fetheden arabesk şarkı',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Arabesk TV',
      position: 3
    },
    {
      id: 'dQw4w9WgXc4',
      title: 'Türkçe Rap Hit',
      description: 'Yeni nesil Türkçe rap şarkısı',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Rap Life',
      position: 4
    },
    {
      id: 'dQw4w9WgXc5',
      title: '90lar Klasik',
      description: '90ların unutulmaz şarkısı',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: '90lar FM',
      position: 5
    },
    {
      id: 'dQw4w9WgXc6',
      title: 'Slow Akustik',
      description: 'Hafif müzik sevenler için',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Akustik Dünya',
      position: 6
    },
    {
      id: 'dQw4w9WgXc7',
      title: 'Türk Halk Müziği',
      description: 'Yöresel tınılarla dolu bir şaheser',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'TRT Müzik',
      position: 7
    },
    {
      id: 'dQw4w9WgXc8',
      title: 'Yaz Hitleri 2024',
      description: 'Bu yazın en çok çalınan şarkısı',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Yaz FM',
      position: 8
    },
    {
      id: 'dQw4w9WgXc9',
      title: 'Türkçe Alternatif',
      description: 'Alternatif müzik sevenler için',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Açık Radyo',
      position: 9
    },
    {
      id: 'dQw4w9WgX10',
      title: 'En Sevilen Türkçe Şarkılar',
      description: 'Tüm zamanların en sevilenleri',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Hit FM',
      position: 10
    }
  ]
};

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

    if (videos.length === 0) {
      return NextResponse.json(sampleData);
    }

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('YouTube scrape hatası:', error);
    return NextResponse.json(sampleData);
  }
}
