
// !!! UYARI: Bu veriler kullanıcı tarafından sağlanan özel içeriklerdir. !!!

import { parseYouTubeMusicMeta } from "@/lib/youtube-metadata";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  aiHint?: string;
  language?: 'turkish' | 'english' | 'auto';
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  aiHint?: string;
  songs: Song[];
}

// YouTube'dan gelen şarkıları saklamak için global değişken
let youtubeCache: Song[] = [];

const placeholderAudioUrl = 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3';

// YouTube şarkılarını cache'e ekle
export function addYoutubeToCache(videos: any[]) {
  const youtubeSongs: Song[] = videos.map((video, index) => {
    const parsed = parseYouTubeMusicMeta(video.title, video.channelTitle);
    return {
      id: `youtube_${video.id}`,
      title: parsed.title,
      artist: parsed.artist,
      album: 'YouTube',
      duration: video.duration,
      imageUrl: video.thumbnail,
      audioUrl: video.id,
      aiHint: 'youtube music'
    };
  });
  
  youtubeCache = youtubeSongs;
  console.log(`🎵 YouTube cache güncellendi: ${youtubeSongs.length} şarkı`);
}

// Not: YouTube title parsing `parseYouTubeMusicMeta` ile yapılır.

// Tüm şarkıları birleştir (SADECE YouTube)
function getAllSongs(): Song[] {
  // Eğer YouTube cache'i varsa sadece onu kullan, yoksa boş array döndür
  return youtubeCache.length > 0 ? youtubeCache : [];
}

const songs: Song[] = [
  { id: '1', title: 'Rapstar', artist: 'Ceza', album: 'Rapstar', duration: '4:12', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/e33652c892b543539356264936319851.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '2', title: 'Holocaust', artist: 'Ceza', album: 'Rapstar', duration: '5:45', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/e33652c892b543539356264936319851.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '3', title: 'Bir Pesimistin Gözyaşları', artist: 'Sagopa Kajmer', album: 'Bir Pesimistin Gözyaşları', duration: '6:23', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/8d8a7c6f05e34b9d889b5c3e6c0c2a4f.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '4', title: 'Karma', artist: 'Norm Ender', album: 'Karma', duration: '3:55', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/4e9081e6992d40909f12015332f170c7.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '5', title: 'Susamam', artist: 'Şanışer ft. Fuat, Ados', album: 'Susamam', duration: '14:55', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/7c4f4544d9f64a59a72bdf274d6c6e1c.png', audioUrl: placeholderAudioUrl, aiHint: 'protest rap' },
  { id: '6', title: 'Geceler', artist: 'Ezhel', album: 'Müptezhel', duration: '3:42', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/229a4a75470d4f23b1858597f7bb1003.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '7', title: 'Ölüme İnat', artist: 'Khontkar', album: 'Ölüme İnat', duration: '3:18', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/5e8e3e4c6b3a4f6b8a8b8b8b8b8b8b8b.png', audioUrl: placeholderAudioUrl, aiHint: 'trap music' },
  { id: '8', title: 'Heyecanı Yok', artist: 'Gazapizm', album: 'Hiphoplife.com.tr - Freestyle', duration: '4:01', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/c561b365e9f84d6b9d624734ff833b5c.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '9', title: 'Şehrimin Tadı', artist: 'Teoman', album: 'Şehrimin Tadı', duration: '4:33', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '10', title: 'Paramparça', artist: 'Tarkan', album: 'Paramparça', duration: '4:15', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '11', title: 'Aşk', artist: 'Sezen Aksu', album: 'Aşk', duration: '5:12', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '12', title: 'Yalnızlık', artist: 'Barış Manço', album: 'Yalnızlık', duration: '3:45', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '13', title: 'Gel Ey Seher', artist: 'Duman', album: 'Gel Ey Seher', duration: '4:28', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '14', title: 'Haydi Gel İçelim', artist: 'Cem Karaca', album: 'Haydi Gel İçelim', duration: '3:52', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '15', title: 'Kırmızı', artist: 'Şebnem Ferah', album: 'Kırmızı', duration: '4:07', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '16', title: 'Vazgeçtim', artist: 'Murat Boz', album: 'Vazgeçtim', duration: '3:33', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '17', title: 'Aşkın Nur Yengi', artist: 'Aşkın Nur Yengi', album: 'Aşkın Nur Yengi', duration: '4:44', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '18', title: 'Yine Mi Çiçek', artist: 'Mor ve Ötesi', album: 'Yine Mi Çiçek', duration: '3:58', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '19', title: 'Beni Çok Sev', artist: 'Mustafa Sandal', album: 'Beni Çok Sev', duration: '3:21', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '20', title: 'Sensiz Olmaz', artist: 'Hadise', album: 'Sensiz Olmaz', duration: '3:47', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
];

const playlists: Playlist[] = [
  { id: '1', title: 'Senin için Derlendi', description: 'Sevdiğin sanatçılardan seçtiklerimiz.', imageUrl: '/Fotoğraflar/TÜKRÇE ROCK.037Z.png', aiHint: 'compiled for you', songs: songs },
  { id: '2', title: 'Yeni Çıkanlar', description: 'En son çıkan hitler.', imageUrl: '/Fotoğraflar/elektronik dans.885Z.png', aiHint: 'new releases', songs: songs.slice(0, 4) },
  { id: '3', title: 'Türkçe Rap & Trap', description: 'Sokakların sesi, yeni ritimler.', imageUrl: '/Fotoğraflar/YENİNESİLRAP.797Z.png', aiHint: 'rap music playlist', songs: songs },
];

// Kullanıcı tercihlerine göre şarkı filtreleme
export function filterSongsByPreferences(songs: Song[], preferences: { artists: string[], genres: string[] }): Song[] {
  if (!preferences || (!preferences.artists.length && !preferences.genres.length)) {
    return songs;
  }

  return songs.filter(song => {
    const artistMatch = preferences.artists.some(artist =>
      song.artist.toLowerCase().includes(artist.toLowerCase())
    );
    const genreMatch = preferences.genres.some(genre => {
      const genreLower = genre.toLowerCase();
      const hintLower = song.aiHint?.toLowerCase() || '';
      return hintLower.includes(genreLower);
    });
    return artistMatch || genreMatch;
  });
}

// Kullanıcı tercihlerine göre playlist filtreleme
export function filterPlaylistsByPreferences(playlists: Playlist[], preferences: { artists: string[], genres: string[] }): Playlist[] {
  if (!preferences || (!preferences.artists.length && !preferences.genres.length)) {
    return playlists;
  }

  const filteredPlaylists = [];
  for (const playlist of playlists) {
    const matchingSongs = filterSongsByPreferences(playlist.songs, preferences);
    if (matchingSongs.length > 0) {
      filteredPlaylists.push(playlist);
    }
  }
  return filteredPlaylists;
}

// Rastgele karıştırma fonksiyonu
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Rastgele ID oluşturucu
function generateRandomId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Sahte API fonksiyonları
export function getPlaylists(limit?: number): Playlist[] {
  // Simulate async delay
  const shuffledPlaylists = shuffleArray(playlists);
  if (limit) {
    return shuffledPlaylists.slice(0, limit);
  }
  return shuffledPlaylists;
}

export function getPlaylistById(id: string): Playlist | undefined {
  return playlists.find(p => p.id === id);
}

export function getMadeForYou(limit: number = 6): Playlist[] {
  // SADECE YouTube şarkılarını al
  const allSongs = getAllSongs();
  
  if (allSongs.length === 0) {
    // YouTube şarkıları henüz yüklenmemişse boş döndür
    return [];
  }
  
  const shuffledSongs = shuffleArray(allSongs);
  
  // Yeni bir playlist oluştur (her seferinde farklı ID ile)
  const madeForYouPlaylist: Playlist = {
    id: generateRandomId(), // Her seferinde farklı ID
    title: 'Senin için Derlendi',
    description: 'YouTube\'dan seçtiklerimiz.',
    imageUrl: '/Fotoğraflar/TÜKRÇE ROCK.037Z.png',
    aiHint: 'compiled for you',
    songs: shuffledSongs.slice(0, 8) // Her seferinde farklı 8 YouTube şarkısı
  };
  
  console.log(`🎵 "Senin için Derlendi" oluşturuldu: ${madeForYouPlaylist.songs.length} YouTube şarkısı`);
  
  return [madeForYouPlaylist];
}

export function getNewReleases(limit: number = 6): Playlist[] {
  // SADECE YouTube şarkılarını al
  const allSongs = getAllSongs();
  
  if (allSongs.length === 0) {
    // YouTube şarkıları henüz yüklenmemişse boş döndür
    return [];
  }
  
  const shuffledSongs = shuffleArray(allSongs);
  
  // Yeni bir playlist oluştur (her seferinde farklı ID ile)
  const newReleasesPlaylist: Playlist = {
    id: generateRandomId(), // Her seferinde farklı ID
    title: 'Yeni Çıkanlar',
    description: 'YouTube\'dan en yeniler.',
    imageUrl: '/Fotoğraflar/elektronik dans.885Z.png',
    aiHint: 'new releases',
    songs: shuffledSongs.slice(0, 6) // Her seferinde farklı 6 YouTube şarkısı
  };
  
  console.log(`🎵 "Yeni Çıkanlar" oluşturuldu: ${newReleasesPlaylist.songs.length} YouTube şarkısı`);
  
  return [newReleasesPlaylist];
}
