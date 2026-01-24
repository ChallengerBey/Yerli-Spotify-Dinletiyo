
// !!! UYARI: Bu veriler kullanıcı tarafından sağlanan özel içeriklerdir. !!!

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  aiHint?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  aiHint?: string;
  songs: Song[];
}

const placeholderAudioUrl = 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3';

const songs: Song[] = [
  { id: '1', title: 'Rapstar', artist: 'Ceza', album: 'Rapstar', duration: '4:12', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/e33652c892b543539356264936319851.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '2', title: 'Holocaust', artist: 'Ceza', album: 'Rapstar', duration: '5:45', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/e33652c892b543539356264936319851.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '3', title: 'Bir Pesimistin Gözyaşları', artist: 'Sagopa Kajmer', album: 'Bir Pesimistin Gözyaşları', duration: '6:23', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/8d8a7c6f05e34b9d889b5c3e6c0c2a4f.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '4', title: 'Karma', artist: 'Norm Ender', album: 'Karma', duration: '3:55', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/4e9081e6992d40909f12015332f170c7.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '5', title: 'Susamam', artist: 'Şanışer ft. Fuat, Ados', album: 'Susamam', duration: '14:55', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/7c4f4544d9f64a59a72bdf274d6c6e1c.png', audioUrl: placeholderAudioUrl, aiHint: 'protest rap' },
  { id: '6', title: 'Geceler', artist: 'Ezhel', album: 'Müptezhel', duration: '3:42', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/229a4a75470d4f23b1858597f7bb1003.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '7', title: 'Ölüme İnat', artist: 'Khontkar', album: 'Ölüme İnat', duration: '3:18', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/5e8e3e4c6b3a4f6b8a8b8b8b8b8b8b8b.png', audioUrl: placeholderAudioUrl, aiHint: 'trap music' },
  { id: '8', title: 'Heyecanı Yok', artist: 'Gazapizm', album: 'Hiphoplife.com.tr - Freestyle', duration: '4:01', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/c561b365e9f84d6b9d624734ff833b5c.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
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

// Sahte API fonksiyonları
export function getPlaylists(limit?: number): Playlist[] {
  // Simulate async delay
  if (limit) {
    return playlists.slice(0, limit);
  }
  return playlists;
}

export function getPlaylistById(id: string): Playlist | undefined {
  return playlists.find(p => p.id === id);
}

export function getRecentlyPlayed(limit: number = 6): Playlist[] {
  return playlists.slice(0, limit);
}

export function getMadeForYou(limit: number = 6): Playlist[] {
  const madeForYou = playlists.find(p => p.id === '1');
  if (madeForYou) {
    return [madeForYou, ...playlists.filter(p => p.id !== '1')].slice(0, limit);
  }
  return playlists.slice(0, limit);
}

export function getNewReleases(limit: number = 6): Playlist[] {
  return playlists.filter(p => p.id === '2').slice(0, limit);
}
