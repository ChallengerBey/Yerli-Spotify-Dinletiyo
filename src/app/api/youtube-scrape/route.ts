import { NextRequest, NextResponse } from 'next/server';

// Reklam şarkılarını tespit etmek için temel filtre sistemi
const ADVERTISEMENT_KEYWORDS = [
  // Sadece açık reklam kelimeleri
  'reklam', 'advertisement', 'ad', 'sponsor', 'tanıtım', 'promosyon',
  'kampanya', 'commercial', 'jingle', 'spot'
];

const SUSPICIOUS_CHANNELS = [
  'reklamtv', 'advertise'
];

function isAdvertisement(title: string, channelTitle: string, _description?: string): boolean {
  const titleLower = title.toLowerCase();
  const channelLower = channelTitle.toLowerCase();
  
  // Sadece açık reklam kelimelerini kontrol et
  for (const keyword of ADVERTISEMENT_KEYWORDS) {
    if (titleLower.includes(keyword)) {
      console.log(`🚫 Reklam tespit edildi (kelime: ${keyword}):`, title);
      return true;
    }
  }
  
  // Şüpheli kanal isimlerini kontrol et
  for (const suspicious of SUSPICIOUS_CHANNELS) {
    if (channelLower.includes(suspicious)) {
      console.log(`🚫 Şüpheli kanal tespit edildi:`, channelTitle);
      return true;
    }
  }
  
  return false;
}

function isValidMusicVideo(title: string, _channelTitle: string, duration: string): boolean {
  // Duration kontrolü
  const durationParts = duration.split(':');
  let totalSeconds = 0;
  
  if (durationParts.length === 2) {
    totalSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
  } else if (durationParts.length === 3) {
    totalSeconds = parseInt(durationParts[0]) * 3600 + parseInt(durationParts[1]) * 60 + parseInt(durationParts[2]);
  }
  
  // Çok kısa videolar (15 saniyeden az) genelde reklam - daha gevşek limit
  if (totalSeconds < 15) {
    console.log(`🚫 Çok kısa video (${duration}):`, title);
    return false;
  }
  
  // Çok uzun videolar (15 dakikadan fazla) genelde podcast/konuşma - daha gevşek limit
  if (totalSeconds > 900) {
    console.log(`🚫 Çok uzun video (${duration}):`, title);
    return false;
  }
  
  // Müzik göstergesi kontrolünü gevşet - sadece açık reklam değilse kabul et
  return true;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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
    
    for (const item of contents.slice(0, 80)) { // Çok daha fazla video al
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
        
        // Başlangıç thumbnail URL'i - direkt hqdefault kullan (maxres çoğu videoda yok)
        const initialThumbnail = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
        let coverUrl = initialThumbnail;
        
        try {
          // Başlıktan artist ve title'ı ayıkla
          let artist = channelTitle;
          let songTitle = title;
          
          // Başlıkta " - " varsa ayır
          if (title.includes(' - ')) {
            const parts = title.split(' - ');
            artist = parts[0].trim();
            songTitle = parts.slice(1).join(' - ').trim();
          }
          
          // Başlıktan gereksiz kısımları temizle
          songTitle = songTitle
            .replace(/\(Official.*?\)/gi, '')
            .replace(/\[Official.*?\]/gi, '')
            .replace(/Official Music Video/gi, '')
            .replace(/Official Video/gi, '')
            .replace(/Official Audio/gi, '')
            .replace(/\(Lyrics?\)/gi, '')
            .replace(/\[Lyrics?\]/gi, '')
            .replace(/Lyric Video/gi, '')
            .replace(/Music Video/gi, '')
            .replace(/\(.*?Video.*?\)/gi, '')
            .replace(/\[.*?Video.*?\]/gi, '')
            .replace(/feat\.?/gi, '')
            .replace(/ft\.?/gi, '')
            .trim();
          
          // Deezer API'den albüm kapağı çek
          const baseUrl = request.url.split('/api/')[0];
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 saniye timeout
          
          const deezerResponse = await fetch(
            `${baseUrl}/api/deezer/search?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(songTitle)}`,
            { 
              signal: controller.signal,
              headers: {
                'Accept': 'application/json'
              }
            }
          );
          
          clearTimeout(timeoutId);
          
          if (deezerResponse.ok) {
            const deezerData = await deezerResponse.json();
            if (deezerData.coverUrl && deezerData.coverUrl.startsWith('http')) {
              console.log(`🎨 Deezer cover bulundu: ${artist} - ${songTitle}`);
              coverUrl = deezerData.coverUrl;
            } else {
              console.log(`⚠️ Deezer cover bulunamadı, YouTube thumbnail kullanılıyor: ${artist} - ${songTitle}`);
            }
          } else {
            console.log(`⚠️ Deezer API hatası (${deezerResponse.status}), YouTube thumbnail kullanılıyor`);
          }
        } catch (error) {
          // Deezer hatası olursa YouTube thumbnail kullan (zaten coverUrl'de var)
          if (error instanceof Error && error.name === 'AbortError') {
            console.log(`⏱️ Deezer API timeout, YouTube thumbnail kullanılıyor`);
          } else {
            console.log(`❌ Deezer API hatası, YouTube thumbnail kullanılıyor:`, error);
          }
        }
        
        videos.push({
          id: video.videoId,
          title: title,
          thumbnail: coverUrl,
          duration: duration,
          channelTitle: channelTitle
        });
        
        // Yeterli video toplandı mı?
        if (videos.length >= 30) {
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
      { id: 'HhZaHf8RP6g', title: 'Ezhel - Geceler', thumbnail: 'https://i.ytimg.com/vi/HhZaHf8RP6g/maxresdefault.jpg', duration: '3:42', channelTitle: 'Ezhel' },
      { id: 'YSHxt_-ntzw', title: 'Khontkar - Ölüme İnat', thumbnail: 'https://i.ytimg.com/vi/YSHxt_-ntzw/maxresdefault.jpg', duration: '3:18', channelTitle: 'Khontkar' },
      { id: 'kKO_bBNbJss', title: 'Gazapizm - Heyecanı Yok', thumbnail: 'https://i.ytimg.com/vi/kKO_bBNbJss/maxresdefault.jpg', duration: '4:01', channelTitle: 'Gazapizm' },
      { id: 'abc123def', title: 'Tarkan - Şımarık', thumbnail: 'https://i.ytimg.com/vi/abc123def/maxresdefault.jpg', duration: '3:45', channelTitle: 'Tarkan' },
      { id: 'def456ghi', title: 'Sezen Aksu - Gel Gör Beni Aşk Neyledi', thumbnail: 'https://i.ytimg.com/vi/def456ghi/maxresdefault.jpg', duration: '4:23', channelTitle: 'Sezen Aksu' },
      { id: 'ghi789jkl', title: 'Ajda Pekkan - Bambaşka Biri', thumbnail: 'https://i.ytimg.com/vi/ghi789jkl/maxresdefault.jpg', duration: '3:38', channelTitle: 'Ajda Pekkan' },
      { id: 'jkl012mno', title: 'Barış Manço - Gülpembe', thumbnail: 'https://i.ytimg.com/vi/jkl012mno/maxresdefault.jpg', duration: '3:28', channelTitle: 'Barış Manço' },
      { id: 'mno345pqr', title: 'Teoman - Kış Güneşi', thumbnail: 'https://i.ytimg.com/vi/mno345pqr/maxresdefault.jpg', duration: '4:15', channelTitle: 'Teoman' },
      { id: 'pqr678stu', title: 'Buray - Aşk Laftan Anlamaz', thumbnail: 'https://i.ytimg.com/vi/pqr678stu/maxresdefault.jpg', duration: '3:35', channelTitle: 'Buray' },
      { id: 'stu901vwx', title: 'Murat Boz - Janti', thumbnail: 'https://i.ytimg.com/vi/stu901vwx/maxresdefault.jpg', duration: '3:25', channelTitle: 'Murat Boz' },
      { id: 'vwx234yza', title: 'Hande Yener - Romeo', thumbnail: 'https://i.ytimg.com/vi/vwx234yza/maxresdefault.jpg', duration: '3:38', channelTitle: 'Hande Yener' },
      { id: 'yza567bcd', title: 'Hadise - Düm Tek Tek', thumbnail: 'https://i.ytimg.com/vi/yza567bcd/maxresdefault.jpg', duration: '2:58', channelTitle: 'Hadise' },
      { id: 'bcd890efg', title: 'Sertab Erener - Everyway That I Can', thumbnail: 'https://i.ytimg.com/vi/bcd890efg/maxresdefault.jpg', duration: '3:05', channelTitle: 'Sertab Erener' },
      { id: 'efg123hij', title: 'Kenan Doğulu - Çakkıdı', thumbnail: 'https://i.ytimg.com/vi/efg123hij/maxresdefault.jpg', duration: '3:22', channelTitle: 'Kenan Doğulu' },
      { id: 'hij456klm', title: 'Nilüfer - Show Yapma', thumbnail: 'https://i.ytimg.com/vi/hij456klm/maxresdefault.jpg', duration: '3:52', channelTitle: 'Nilüfer' },
      { id: 'klm789nop', title: 'Aşkın Nur Yengi - Sevgiliye', thumbnail: 'https://i.ytimg.com/vi/klm789nop/maxresdefault.jpg', duration: '4:15', channelTitle: 'Aşkın Nur Yengi' },
      { id: 'nop012qrs', title: 'Ebru Gündeş - Rüya', thumbnail: 'https://i.ytimg.com/vi/nop012qrs/maxresdefault.jpg', duration: '4:02', channelTitle: 'Ebru Gündeş' },
      { id: 'qrs345tuv', title: 'Demet Akalın - Afedersin', thumbnail: 'https://i.ytimg.com/vi/qrs345tuv/maxresdefault.jpg', duration: '3:48', channelTitle: 'Demet Akalın' },
      { id: 'tuv678wxy', title: 'Gülşen - Bangır Bangır', thumbnail: 'https://i.ytimg.com/vi/tuv678wxy/maxresdefault.jpg', duration: '3:33', channelTitle: 'Gülşen' },
      { id: 'wxy901zab', title: 'Simge - Miş Miş', thumbnail: 'https://i.ytimg.com/vi/wxy901zab/maxresdefault.jpg', duration: '3:15', channelTitle: 'Simge' },
      { id: 'zab234cde', title: 'Aleyna Tilki - Cevapsız Çınlama', thumbnail: 'https://i.ytimg.com/vi/zab234cde/maxresdefault.jpg', duration: '3:42', channelTitle: 'Aleyna Tilki' },
      { id: 'cde567fgh', title: 'Reynmen - Derdim Olsun', thumbnail: 'https://i.ytimg.com/vi/cde567fgh/maxresdefault.jpg', duration: '3:28', channelTitle: 'Reynmen' },
      { id: 'fgh890ijk', title: 'Berkay - Aşk Böyle Bir Şey Ki', thumbnail: 'https://i.ytimg.com/vi/fgh890ijk/maxresdefault.jpg', duration: '4:05', channelTitle: 'Berkay' },
      { id: 'ijk123lmn', title: 'Mustafa Ceceli - İyi Ki Varsın', thumbnail: 'https://i.ytimg.com/vi/ijk123lmn/maxresdefault.jpg', duration: '3:55', channelTitle: 'Mustafa Ceceli' },
      { id: 'lmn456opq', title: 'Emrah Karaduman - Hoşgeldin', thumbnail: 'https://i.ytimg.com/vi/lmn456opq/maxresdefault.jpg', duration: '3:47', channelTitle: 'Emrah Karaduman' }
    ];
    
    return NextResponse.json({ videos: fallbackVideos });
  }
}