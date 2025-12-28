
'use server';

// !!! UYARI: Bu, GÖSTERİM AMAÇLI sahte bir veri servisidir. !!!
// Gerçek bir uygulamada, bu veriler bir veritabanından veya harici bir API'den gelmelidir.

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  audioUrl: string; // Eklendi: Ses dosyasının URL'si
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

// Örnek bir telifsiz müzik URL'si. Şimdilik tüm şarkılar için bunu kullanacağız.
const placeholderAudioUrl = 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3';

const songs: Song[] = [
  { id: '1', title: 'Kuzu Kuzu', artist: 'Tarkan', album: 'Karma', duration: '3:54', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/e33652c892b543539356264936319851.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '2', title: 'Hadi Bakalım', artist: 'Sezen Aksu', album: 'Gülümse', duration: '4:45', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/e8339396381442a884f5c0977c73b0a7.png', audioUrl: placeholderAudioUrl, aiHint: '90s music' },
  { id: '3', title: 'Cambaz', artist: 'mor ve ötesi', album: 'Dünya Yalan Söylüyor', duration: '5:07', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/4c760431055c4d34a476839e99af66c6.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '4', title: 'Gündüzüm Seninle', artist: 'Yeni Türkü', album: 'Akustik', duration: '3:21', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/9e03c1788241434190828d1159e15993.png', audioUrl: placeholderAudioUrl, aiHint: 'acoustic' },
  { id: '5', title: 'Senden Daha Güzel', artist: 'Duman', album: 'Belki Alışman Lazım', duration: '3:45', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/9611f8e1205345a58adad260655c3c0a.png', audioUrl: placeholderAudioUrl, aiHint: 'rock music' },
  { id: '6', title: 'Beni Benimle Bırak', artist: 'maNga', album: 'maNga', duration: '4:30', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/c7356eb910b44b8a9643d41f55f24259.png', audioUrl: placeholderAudioUrl, aiHint: 'alternative rock' },
  { id: '7', title: 'Aşk', artist: 'Sertab Erener', album: 'Sertab Gibi', duration: '4:15', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/b0553a18357a4a988d40019a365f5b28.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '8', title: 'Böyle Kahpedir Dünya', artist: 'Müslüm Gürses', album: 'Paramparça', duration: '5:02', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/c561b365e9f84d6b9d624734ff833b5c.png', audioUrl: placeholderAudioUrl, aiHint: 'arabesque' },
  { id: '9', title: 'Yaz Yaz Yaz', artist: 'Ajda Pekkan', album: 'Ajda 90', duration: '4:09', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/3c2a411516014c44a0374e2354a3e47a.png', audioUrl: placeholderAudioUrl, aiHint: 'pop music' },
  { id: '10', title: 'Resimdeki Gözyaşları', artist: 'Cem Karaca', album: 'Yoksulluk Kader Olamaz', duration: '3:10', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/6ab41e9b2521487c9751e3a1050a9c80.png', audioUrl: placeholderAudioUrl, aiHint: 'anatolian rock' },
  { id: '11', title: 'Isabelle', artist: 'Sefo', album: 'Isabelle', duration: '2:40', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/4e9081e6992d40909f12015332f170c7.png', audioUrl: placeholderAudioUrl, aiHint: 'rap music' },
  { id: '12', title: 'Dinle', artist: 'Mahsun Kırmızıgül', album: 'Yıkılmadım', duration: '4:55', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/8d8a7c6f05e34b9d889b5c3e6c0c2a4f.png', audioUrl: placeholderAudioUrl, aiHint: 'arabesque pop' },
  { id: '13', title: 'Antidepresan', artist: 'Mabel Matiz', album: 'Antidepresan', duration: '3:11', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/229a4a75470d4f23b1858597f7bb1003.png', audioUrl: placeholderAudioUrl, aiHint: 'alternative pop' },
  { id: '14', title: 'Susamam', artist: 'Şanışer ft. Fuat, Ados', album: 'Susamam', duration: '14:55', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/7c4f4544d9f64a59a72bdf274d6c6e1c.png', audioUrl: placeholderAudioUrl, aiHint: 'protest rap' },
  { id: '15', title: 'NKBİ', artist: 'Güneş', album: 'Atlantis', duration: '2:50', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/9d4f8b9d3b1e4f4bb4e3d3683f1264b3.png', audioUrl: placeholderAudioUrl, aiHint: 'rnb pop' },
  { id: '16', title: 'Fırtınadayım', artist: 'Mabel Matiz', album: 'Fırtınadayım', duration: '4:01', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/a39bfb54020a430983d941864195748f.png', audioUrl: placeholderAudioUrl, aiHint: 'synth pop' },
  { id: '17', title: 'Gözlerime Çizdim Seni', artist: 'Kibariye', album: 'Arabeskin Kraliçesi', duration: '5:12', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/9b3f3b4b8e1a4b0e8e6f3b2b4b2a3b9b.png', audioUrl: placeholderAudioUrl, aiHint: 'arabesque' },
  { id: '18', title: '24/7', artist: 'Alizade, BEGE', album: '24/7', duration: '2:30', imageUrl: 'https://lastfm.freetls.fastly.net/i/u/300x300/5e8e3e4c6b3a4f6b8a8b8b8b8b8b8b8b.png', audioUrl: placeholderAudioUrl, aiHint: 'trap music' },
];

const playlists: Playlist[] = [
  { id: '1', title: 'Türkçe Pop Hits', description: 'En yeni ve en popüler Türkçe pop şarkıları.', imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png', aiHint: 'playlist cover', songs: songs.filter(s => ['1', '2', '7', '9', '13', '15', '16'].includes(s.id)) },
  { id: '2', title: 'Damar Şarkılar', description: 'Ayrılık, hüzün ve isyan bir arada.', imageUrl: '/Fotoğraflar/damarşarkılar.917Z.png', aiHint: 'arabesque playlist', songs: songs.filter(s => ['8', '12', '17'].includes(s.id)) },
  { id: '3', title: 'Türkçe Rock Alternatif', description: 'Gitar riffleri ve anlamlı sözler.', imageUrl: '/Fotoğraflar/TÜKRÇE ROCK.037Z.png', aiHint: 'rock playlist', songs: songs.filter(s => ['3', '5', '6', '10'].includes(s.id)) },
  { id: '4', title: 'Haftanın Keşifleri', description: 'Bu hafta ne dinlesem diyenlere.', imageUrl: '/Fotoğraflar/haftanın keşifleri.341Z.png', aiHint: 'discovery playlist', songs: songs.slice(0, 8) },
  { id: '5', title: 'Antrenman Modu', description: 'Spor yaparken motivasyonun artsın.', imageUrl: '/Fotoğraflar/ANTREMANMODU.333Z.png', aiHint: 'workout music', songs: songs.filter(s => ['1', '3', '6', '11', '14', '18'].includes(s.id)) },
  { id: '6', title: 'Yolculuk Şarkıları', description: 'Yollarda sana eşlik edecek şarkılar.', imageUrl: '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png', aiHint: 'roadtrip music', songs: songs.filter(s => ['1', '4', '5', '7', '9', '13', '16'].includes(s.id)) },
  { id: '7', title: 'Odaklanma Zamanı', description: 'Çalışırken veya okurken konsantre ol.', imageUrl: '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png', aiHint: 'focus playlist', songs: songs.filter(s => ['4', '10', '13', '16'].includes(s.id)) },
  { id: '8', title: '90\'lar Türkçe Pop', description: 'Geçmişe bir yolculuk.', imageUrl: '/Fotoğraflar/90lar.973Z.png', aiHint: '90s playlist', songs: songs.filter(s => ['2', '9', '10'].includes(s.id))},
  { id: '9', title: 'Türkçe Rap & Trap', description: 'Sokakların sesi, yeni ritimler.', imageUrl: '/Fotoğraflar/YENİNESİLRAP.797Z.png', aiHint: 'rap music playlist', songs: songs.filter(s => ['11', '14', '15', '18'].includes(s.id)) },
  { id: '10', title: 'Yeni Nesil Pop', description: 'Popun yeni ve alternatif sesleri.', imageUrl: '/Fotoğraflar/Efsaneşarkılar.885Z.png', aiHint: 'new pop', songs: songs.filter(s => ['13', '15', '16', '18'].includes(s.id))},
  { id: '11', title: 'Yeni Çıkanlar', description: 'En son çıkan hitler.', imageUrl: '/Fotoğraflar/elektronik dans.885Z.png', aiHint: 'new releases', songs: songs.slice(12, 18)},
  { id: '12', title: 'Efsane Şarkılar', description: 'Unutulmayan klasikler.', imageUrl: '/Fotoğraflar/akustik akşamlar.911Z.png', aiHint: 'legendary songs', songs: songs.filter(s => ['2', '4', '8', '10', '17'].includes(s.id))},
];

// Kullanıcı tercihlerine göre şarkı filtreleme
export async function filterSongsByPreferences(songs: Song[], preferences: { artists: string[], genres: string[] }): Promise<Song[]> {
  if (!preferences || (!preferences.artists.length && !preferences.genres.length)) {
    return songs;
  }

  return songs.filter(song => {
    // Sanatçı tercihlerine göre filtreleme
    const artistMatch = preferences.artists.some(artist =>
      song.artist.toLowerCase().includes(artist.toLowerCase())
    );

    // Tür tercihlerine göre filtreleme (aiHint kullanarak)
    const genreMatch = preferences.genres.some(genre => {
      const genreLower = genre.toLowerCase();
      const hintLower = song.aiHint?.toLowerCase() || '';
      return hintLower.includes(genreLower);
    });

    return artistMatch || genreMatch;
  });
}

// Kullanıcı tercihlerine göre playlist filtreleme
export async function filterPlaylistsByPreferences(playlists: Playlist[], preferences: { artists: string[], genres: string[] }): Promise<Playlist[]> {
  if (!preferences || (!preferences.artists.length && !preferences.genres.length)) {
    return playlists;
  }

  const filteredPlaylists = [];
  for (const playlist of playlists) {
    // Playlist'in şarkılarını kullanıcı tercihlerine göre filtrele
    const matchingSongs = await filterSongsByPreferences(playlist.songs, preferences);
    if (matchingSongs.length > 0) {
      filteredPlaylists.push(playlist);
    }
  }
  return filteredPlaylists;
}

// Sahte API fonksiyonları
export async function getPlaylists(limit?: number): Promise<Playlist[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Gecikme simülasyonu
  if (limit) {
    return playlists.slice(0, limit);
  }
  return playlists;
}

export async function getPlaylistById(id: string): Promise<Playlist | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return playlists.find(p => p.id === id);
}

export async function getRecentlyPlayed(limit: number = 6): Promise<Playlist[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return playlists.slice(0, limit);
}

export async function getMadeForYou(limit: number = 6): Promise<Playlist[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...playlists].sort(() => 0.5 - Math.random()).slice(0, limit);
}

export async function getNewReleases(limit: number = 6): Promise<Playlist[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return playlists.filter(p => ['10', '11'].includes(p.id)).slice(0, limit);
}
