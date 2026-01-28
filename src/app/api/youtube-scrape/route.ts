import { NextRequest, NextResponse } from 'next/server';

// Reklam şarkılarını tespit etmek için gelişmiş filtre sistemi
const ADVERTISEMENT_KEYWORDS = [
  // Reklam kelimeleri
  'reklam', 'advertisement', 'ad', 'sponsor', 'tanıtım', 'promosyon',
  'kampanya', 'indirim', 'sale', 'offer', 'deal', 'discount',
  
  // Marka isimleri (yaygın reklamcılar)
  'coca cola', 'pepsi', 'mcdonald', 'burger king', 'kfc', 'dominos',
  'turkcell', 'vodafone', 'türk telekom', 'bim', 'a101', 'şok',
  'migros', 'carrefour', 'media markt', 'teknosa', 'vatan bilgisayar',
  'arçelik', 'vestel', 'beko', 'samsung', 'apple', 'huawei',
  'oppo', 'xiaomi', 'lg', 'sony', 'philips', 'bosch',
  
  // Reklam formatları
  'commercial', 'jingle', 'spot', 'trailer', 'teaser', 'promo',
  'official trailer', 'official teaser', 'official promo',
  
  // Şüpheli kanallar
  'reklamtv', 'advertise', 'marketing', 'brand', 'corporate',
  
  // Yaygın reklam cümleleri
  'şimdi al', 'hemen sipariş', 'sadece bugün', 'sınırlı süre',
  'buy now', 'order now', 'limited time', 'special offer',
  'özel fiyat', 'kaçırma', 'fırsat', 'opportunity'
];

const SUSPICIOUS_CHANNELS = [
  'reklamtv', 'advertise', 'marketing', 'brand', 'corporate',
  'commercial', 'sponsor', 'promo', 'campaign', 'official brand'
];

const MUSIC_INDICATORS = [
  'official music video', 'official video', 'music video', 'mv',
  'official audio', 'audio', 'lyrics', 'lyric video', 'şarkı sözleri',
  'klip', 'müzik', 'music', 'song', 'şarkı', 'single', 'album',
  'feat', 'ft', 'featuring', 'remix', 'acoustic', 'live',
  'cover', 'version', 'unplugged', 'studio', 'session'
];

function isAdvertisement(title: string, channelTitle: string, description?: string): boolean {
  const titleLower = title.toLowerCase();
  const channelLower = channelTitle.toLowerCase();
  const descLower = (description || '').toLowerCase();
  
  // 1. Reklam kelimelerini kontrol et
  for (const keyword of ADVERTISEMENT_KEYWORDS) {
    if (titleLower.includes(keyword) || channelLower.includes(keyword) || descLower.includes(keyword)) {
      console.log(`🚫 Reklam tespit edildi (kelime: ${keyword}):`, title);
      return true;
    }
  }
  
  // 2. Şüpheli kanal isimlerini kontrol et
  for (const suspicious of SUSPICIOUS_CHANNELS) {
    if (channelLower.includes(suspicious)) {
      console.log(`🚫 Şüpheli kanal tespit edildi:`, channelTitle);
      return true;
    }
  }
  
  // 3. Müzik göstergesi yoksa şüpheli
  const hasMusicIndicator = MUSIC_INDICATORS.some(indicator => 
    titleLower.includes(indicator) || channelLower.includes(indicator)
  );
  
  // 4. Çok kısa videolar (30 saniyeden az) genelde reklam
  // Bu kontrol duration parsing'den sonra yapılacak
  
  return false;
}

function isValidMusicVideo(title: string, channelTitle: string, duration: string): boolean {
  const titleLower = title.toLowerCase();
  const channelLower = channelTitle.toLowerCase();
  
  // Duration kontrolü
  const durationParts = duration.split(':');
  let totalSeconds = 0;
  
  if (durationParts.length === 2) {
    totalSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
  } else if (durationParts.length === 3) {
    totalSeconds = parseInt(durationParts[0]) * 3600 + parseInt(durationParts[1]) * 60 + parseInt(durationParts[2]);
  }
  
  // Çok kısa videolar (30 saniyeden az) genelde reklam
  if (totalSeconds < 30) {
    console.log(`🚫 Çok kısa video (${duration}):`, title);
    return false;
  }
  
  // Çok uzun videolar (10 dakikadan fazla) genelde podcast/konuşma
  if (totalSeconds > 600) {
    console.log(`🚫 Çok uzun video (${duration}):`, title);
    return false;
  }
  
  // Müzik göstergesi var mı?
  const hasMusicIndicator = MUSIC_INDICATORS.some(indicator => 
    titleLower.includes(indicator) || channelLower.includes(indicator)
  );
  
  if (!hasMusicIndicator) {
    // Müzik göstergesi yoksa ama sanatçı ismi varsa kabul et
    const hasArtistName = /[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+ - [a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+/.test(title);
    if (!hasArtistName) {
      console.log(`🚫 Müzik göstergesi yok:`, title);
      return false;
    }
  }
  
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'türkçe müzik';

  try {
    console.log(`🔍 YouTube arama: "${query}"`);
    
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
          query: query + ' music -advertisement -reklam -commercial',
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
    
    console.log(`📺 ${contents.length} video bulundu, filtreleniyor...`);
    
    for (const item of contents.slice(0, 30)) { // Daha fazla video al, sonra filtrele
      if (item.videoRenderer) {
        const video = item.videoRenderer;
        const title = video.title?.runs?.[0]?.text || 'Unknown Title';
        const channelTitle = video.ownerText?.runs?.[0]?.text || 'Unknown Channel';
        const duration = video.lengthText?.simpleText || '0:00';
        const description = video.descriptionSnippet?.runs?.[0]?.text || '';
        
        // 1. Reklam kontrolü
        if (isAdvertisement(title, channelTitle, description)) {
          continue; // Bu videoyu atla
        }
        
        // 2. Geçerli müzik videosu kontrolü
        if (!isValidMusicVideo(title, channelTitle, duration)) {
          continue; // Bu videoyu atla
        }
        
        console.log(`✅ Geçerli müzik: ${title} - ${channelTitle} (${duration})`);
        
        videos.push({
          id: video.videoId,
          title: title,
          thumbnail: video.thumbnail?.thumbnails?.[0]?.url || '',
          duration: duration,
          channelTitle: channelTitle
        });
        
        // Yeterli video toplandı mı?
        if (videos.length >= 15) {
          break;
        }
      }
    }

    console.log(`🎵 ${videos.length} geçerli müzik videosu filtrelendi`);
    
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube scrape error:', error);
    
    // Fallback data - Bilinen kaliteli şarkılar
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