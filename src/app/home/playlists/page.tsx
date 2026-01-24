"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Music, RefreshCw } from 'lucide-react';
import { SongCard } from "@/components/song-card";
import { getPlaylists, Playlist, Song } from "@/lib/data";


export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPlaylists = async () => {
      const data = await getPlaylists();
      setPlaylists(data);
    };
    loadPlaylists();
  }, []);



  const getArtistsByPlaylist = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('pop') && lowerTitle.includes('hit')) {
      return ['Tarkan', 'Hadise', 'Aleyna Tilki', 'Murat Boz', 'Simge', 'Edis', 'Zeynep Bastık', 'Mabel Matiz', 'Gülşen', 'Kenan Doğulu', 'Hande Yener'];
    } else if (lowerTitle.includes('damar')) {
      return ['Müslüm Gürses', 'İbrahim Tatlıses', 'Ahmet Kaya', 'Ferdi Tayfur', 'Bergen', 'Orhan Gencebay', 'Cengiz Kurtoğlu', 'Hakan Altun', 'Ebru Gündeş', 'Kibariye', 'Yıldız Tilbe'];
    } else if (lowerTitle.includes('rock') || lowerTitle.includes('alternatif')) {
      return ['Duman', 'maNga', 'Teoman', 'Mor ve Ötesi', 'Hayko Cepkin', 'Athena', 'Feridun Düzağaç', 'Seksendört', 'Emre Aydın', 'Yüksek Sadakat', 'Mavi Sakal'];
    } else if (lowerTitle.includes('keşif')) {
      return ['Emir Can İğrek', 'Canozan', 'Nilipek', 'Melike Şahin', 'Yüzyüzeyken Konuşuruz', 'Evdeki Saat', 'Batu Akdeniz', 'Sena Şener', 'Nova Norda', 'Can Ozan', 'Umut Timur'];
    } else if (lowerTitle.includes('antrenman')) {
      return ['Ceza', 'Ezhel', 'Ben Fero', 'Sagopa Kajmer', 'Şehinşah', 'Reynmen', 'Uzi', 'Gazapizm', 'Burak Yeter', 'Murda', 'Norm Ender'];
    } else if (lowerTitle.includes('yolculuk')) {
      return ['Sertab Erener', 'Göksel', 'MFÖ', 'Sezen Aksu', 'Nil Karaibrahimgil', 'Ayna', 'Fikret Kızılok', 'Yeni Türkü', 'Zerrin Özer', 'Barış Manço', 'Yalın'];
    } else if (lowerTitle.includes('odaklan')) {
      return ['Mercan Dede', 'Candan Erçetin', 'Fazıl Say', 'Can Atilla', 'Ayten Alpman', 'Anıl Piyancı', 'Enbe Orkestrası', 'Erkan Oğur', 'Ahmet Aslan', 'Mehmet Erdem', 'Bora Duran'];
    } else if (lowerTitle.includes('90')) {
      return ['Tarkan', 'Kenan Doğulu', 'Mustafa Sandal', 'Burak Kut', 'Serdar Ortaç', 'Sertab Erener', 'Levent Yüksel', 'Çelik', 'Yonca Evcimik', 'Demet Akalın', 'Hande Yener'];
    } else if (lowerTitle.includes('rap') || lowerTitle.includes('trap')) {
      return ['Ezhel', 'Uzi', 'Ceza', 'Sagopa Kajmer', 'Şehinşah', 'Murda', 'Ben Fero', 'Gazapizm', 'Motive', 'Lvbel C5', 'Patron'];
    } else if (lowerTitle.includes('yeni nesil')) {
      return ['Edis', 'Zeynep Bastık', 'Aleyna Tilki', 'Mabel Matiz', 'Simge', 'Melike Şahin', 'Emir Can İğrek', 'Sena Şener', 'Melek Mosso', 'Can Ozan', 'Sefo'];
    } else if (lowerTitle.includes('elektronik') || lowerTitle.includes('dans')) {
      return ['Burak Yeter', 'Mahmut Orhan', 'Deepjack', 'Erdem Kınay', 'İlkan Günüç', 'Bedük', 'Can Hatipoğlu', 'Ahmet Kılıç', 'Ferhat Albayrak', 'Kerem Gell', 'Sezer Uysal'];
    } else if (lowerTitle.includes('efsane') || lowerTitle.includes('akustik')) {
      return ['Sezen Aksu', 'Barış Manço', 'Cem Karaca', 'Zeki Müren', 'Ajda Pekkan', 'Erkin Koray', 'Nilüfer', 'Kayahan', 'MFÖ', 'Nükhet Duru', 'Edip Akbayram'];
    } else {
      return ['Tarkan', 'Sezen Aksu', 'Duman', 'Ezhel', 'Mabel Matiz', 'Ceza', 'Müslüm Gürses', 'Mor ve Ötesi', 'Ajda Pekkan', 'Kibariye'];
    }
  };

  const handlePlaylistClick = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setLoading(true);
    
    try {
      const artists = getArtistsByPlaylist(playlist.title);
      
      // Paralel arama yap
      const searchPromises = artists.slice(0, 8).map(async (artist) => {
        try {
          const searchResponse = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(artist)}`);
          const searchData = await searchResponse.json();
          
          if (searchData.videos && searchData.videos.length > 0) {
            return searchData.videos.slice(0, 3)
              .filter((video: any) => video.title && video.id && video.thumbnail)
              .map((video: any) => ({
                id: video.id,
                title: video.title,
                artist: artist,
                album: '',
                duration: video.duration || '0:00',
                imageUrl: video.thumbnail,
                audioUrl: video.id
              }));
          }
          return [];
        } catch (error) {
          return [];
        }
      });
      
      const results = await Promise.all(searchPromises);
      const allSongs = results.flat();
      setPlaylistSongs(allSongs);
    } catch (error) {
      setPlaylistSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSongs = async () => {
    if (!selectedPlaylist) return;
    await handlePlaylistClick(selectedPlaylist);
  };



  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Playlistler</h1>

      {!selectedPlaylist ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              onClick={() => handlePlaylistClick(playlist)} 
              className="cursor-pointer group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg p-3"
            >
              <img src={playlist.imageUrl} alt={playlist.title} className="w-full aspect-square object-cover rounded-lg mb-3" />
              <p className="text-base font-semibold truncate">{playlist.title}</p>
              <p className="text-sm truncate text-muted-foreground">{playlist.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setSelectedPlaylist(null)}>
                ← Geri
              </Button>
              <h2 className="text-2xl font-bold">{selectedPlaylist.title}</h2>
            </div>
            <Button 
              onClick={handleRefreshSongs}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Müzikler yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {playlistSongs.map((song) => (
                <div 
                  key={song.id}
                  onClick={() => {
                    const songWithPlaylist = { ...song, playlist: playlistSongs };
                    window.dispatchEvent(new CustomEvent('playSong', { detail: songWithPlaylist }));
                  }}
                  className="cursor-pointer group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg p-3"
                >
                  <img src={song.imageUrl} alt={song.title} className="w-full aspect-square object-cover rounded-lg mb-3" />
                  <p className="text-base font-semibold truncate">{song.title}</p>
                  <p className="text-sm truncate text-muted-foreground">{song.artist}</p>
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {song.duration}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}