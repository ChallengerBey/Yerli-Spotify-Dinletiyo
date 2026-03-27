/**
 * Spotify Web API Integration
 * Şarkı bilgilerinden gerçek albüm kapağı çeker
 */

/**
 * YouTube thumbnail'ı maksimum kaliteye çevir (fallback sistemi ile)
 */
export async function getMaxResYouTubeThumbnail(url: string): Promise<string> {
  if (!url.includes('ytimg.com') && !url.includes('youtube.com')) {
    return url;
  }

  // YouTube video ID'sini çıkar
  const videoIdMatch = url.match(/\/vi\/([^\/]+)\//);
  if (!videoIdMatch) return url;
  
  const videoId = videoIdMatch[1];
  
  // Direkt hqdefault kullan (genelde her zaman var ve yeterince kaliteli)
  // maxresdefault çoğu videoda yok, HEAD request yapmak gereksiz yük
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  console.log(`✅ YouTube thumbnail: hqdefault (${videoId})`);
  return thumbnailUrl;
}

/**
 * Şarkı başlığını normalize et (feat, ft, video version vb. temizle)
 */
export function normalizeSongTitle(title: string): string {
  let normalized = title;
  
  // Emoji'leri temizle
  normalized = normalized.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  
  // Parantez içindeki HER ŞEYİ temizle (çeviri, remix, cover, vs.)
  normalized = normalized.replace(/\s*\([^)]*\)/g, '');
  normalized = normalized.replace(/\s*\[[^\]]*\]/g, '');
  
  // | (pipe) işaretinden sonrasını temizle (genelde açıklama olur)
  normalized = normalized.split('|')[0].trim();
  
  // feat, ft, featuring kısımlarını temizle
  normalized = normalized.replace(/\s*(feat\.?|ft\.?|featuring)\s+.*/gi, '');
  
  // Fazla boşlukları temizle
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Deezer'dan şarkı ara ve albüm kapağını al
 */
export async function searchDeezerAlbumArt(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    // Başlığı normalize et
    const normalizedTitle = normalizeSongTitle(title);
    
    // Deezer API route'u kullan
    const response = await fetch(
      `/api/deezer/search?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(normalizedTitle)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.coverUrl) {
      console.log(`✅ Deezer: ${artist} - ${normalizedTitle}`);
      return data.coverUrl;
    }

    return null;
  } catch (error) {
    return null;
  }
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
 * Last.fm'den sanatçı fotoğrafı al
 */
export async function getArtistImage(artist: string): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/lastfm/artist?artist=${encodeURIComponent(artist)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.imageUrl) {
      console.log(`✅ Last.fm artist: ${artist}`);
      return data.imageUrl;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Şarkı için en iyi albüm kapağını al
 * Önce Deezer'dan, sonra Spotify'dan, sonra sanatçı fotoğrafı, en son YouTube maxres thumbnail
 */
export async function getBestAlbumArt(
  currentImageUrl: string,
  artist: string,
  title: string
): Promise<string> {
  // Eğer mevcut görsel YouTube thumbnail ise daha iyi bir görsel bulmaya çalış
  const isYoutubeThumbnail = currentImageUrl.includes('ytimg.com') || 
                             currentImageUrl.includes('youtube.com');

  // Zaten kaliteli bir görsel varsa kullan
  if (!isYoutubeThumbnail || currentImageUrl.includes('i.scdn.co') || currentImageUrl.includes('dzcdn.net')) {
    return currentImageUrl;
  }

  // Önce Deezer'dan dene (genelde daha iyi kalite)
  const deezerArt = await searchDeezerAlbumArt(artist, title);
  if (deezerArt) {
    return deezerArt;
  }

  // Deezer'da bulunamadıysa Spotify'dan dene
  const spotifyArt = await searchSpotifyAlbumArt(artist, title);
  if (spotifyArt) {
    return spotifyArt;
  }
  
  // Şarkı kapağı bulunamadıysa sanatçı fotoğrafını dene
  const artistImage = await getArtistImage(artist);
  if (artistImage) {
    return artistImage;
  }
  
  // Hiçbiri bulunamadıysa YouTube'un en yüksek kaliteli thumbnail'ını kullan (fallback ile)
  return await getMaxResYouTubeThumbnail(currentImageUrl);
}

