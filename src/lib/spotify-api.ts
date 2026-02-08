/**
 * Spotify Web API Integration
 * Şarkı bilgilerinden gerçek albüm kapağı çeker
 */

/**
 * Şarkı başlığını normalize et (feat, ft, video version vb. temizle)
 */
export function normalizeSongTitle(title: string): string {
  let normalized = title;
  
  // Parantez içindeki gereksiz bilgileri temizle
  normalized = normalized.replace(/\s*\((Video Version|Official Video|Official Audio|Lyric Video|Audio)\)/gi, '');
  normalized = normalized.replace(/\s*\[(Video Version|Official Video|Official Audio|Lyric Video|Audio)\]/gi, '');
  
  // feat, ft, featuring kısımlarını temizle
  normalized = normalized.replace(/\s*[\(\[]?\s*(feat\.?|ft\.?|featuring)\s+[^\)\]]*[\)\]]?/gi, '');
  
  // Fazla boşlukları temizle
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Spotify'da şarkı ara ve albüm kapağını al (API route üzerinden)
 */
export async function searchSpotifyAlbumArt(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    // Başlığı normalize et
    const normalizedTitle = normalizeSongTitle(title);
    
    // Backend API route'u kullan
    const response = await fetch(
      `/api/spotify/search?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(normalizedTitle)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      // 500 hatası credentials eksikliği olabilir, sessizce geç
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.albumArt) {
      console.log(`✅ Spotify: ${artist} - ${normalizedTitle}`);
      return data.albumArt;
    }

    // Credentials yoksa veya bulunamadıysa sessizce null döndür
    return null;
  } catch (error) {
    // Hata durumunda sessizce null döndür (varsayılan görsel kullanılacak)
    return null;
  }
}

/**
 * Şarkı için en iyi albüm kapağını al
 * Önce mevcut imageUrl'i kontrol et, sonra Spotify'dan çek
 */
export async function getBestAlbumArt(
  currentImageUrl: string,
  artist: string,
  title: string
): Promise<string> {
  // Eğer mevcut görsel YouTube thumbnail ise Spotify'dan çekmeyi dene
  const isYoutubeThumbnail = currentImageUrl.includes('ytimg.com') || 
                             currentImageUrl.includes('youtube.com');

  // Spotify'dan zaten geliyorsa veya kaliteli bir görsel varsa kullan
  if (!isYoutubeThumbnail || currentImageUrl.includes('i.scdn.co')) {
    return currentImageUrl;
  }

  // Spotify'dan daha iyi bir görsel bulmaya çalış
  const spotifyArt = await searchSpotifyAlbumArt(artist, title);
  
  // Spotify'dan bulunduysa onu kullan, bulunamadıysa mevcut görseli kullan
  return spotifyArt || currentImageUrl;
}

