'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPlaylistById, Playlist, Song } from '@/lib/data';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

export default function PlaylistPage() {
  const params = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);

  const getArtistsByPlaylist = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('pop') && lowerTitle.includes('hit')) {
      return ['Tarkan', 'Hadise', 'Aleyna Tilki'];
    } else if (lowerTitle.includes('damar')) {
      return ['Müslüm Gürses', 'İbrahim Tatlıses', 'Ahmet Kaya'];
    } else if (lowerTitle.includes('rock') || lowerTitle.includes('alternatif')) {
      return ['Duman', 'maNga', 'Teoman'];
    } else if (lowerTitle.includes('keşif')) {
      return ['Emir Can İğrek', 'Canozan', 'Nilipek'];
    } else if (lowerTitle.includes('antrenman')) {
      return ['Ceza', 'Ezhel', 'Ben Fero'];
    } else if (lowerTitle.includes('yolculuk')) {
      return ['Sertab Erener', 'Göksel', 'MFÖ'];
    } else if (lowerTitle.includes('odaklan')) {
      return ['Mercan Dede', 'Candan Erçetin', 'Fazıl Say'];
    } else if (lowerTitle.includes('90')) {
      return ['Tarkan', 'Kenan Doğulu', 'Mustafa Sandal'];
    } else if (lowerTitle.includes('rap') || lowerTitle.includes('trap')) {
      return ['Ezhel', 'Uzi', 'Ceza'];
    } else if (lowerTitle.includes('yeni nesil')) {
      return ['Edis', 'Zeynep Bastık', 'Aleyna Tilki'];
    } else if (lowerTitle.includes('elektronik') || lowerTitle.includes('dans')) {
      return ['Burak Yeter', 'Mahmut Orhan', 'Deepjack'];
    } else if (lowerTitle.includes('efsane') || lowerTitle.includes('akustik')) {
      return ['Sezen Aksu', 'Barış Manço', 'Cem Karaca'];
    } else {
      return ['Tarkan', 'Sezen Aksu', 'Duman'];
    }
  };

  const loadPlaylistSongs = async (playlist: Playlist) => {
    console.log('loadPlaylistSongs başladı:', playlist.title);
    setSongsLoading(true);
    
    try {
      const artists = getArtistsByPlaylist(playlist.title);
      console.log('Sanatçılar:', artists);
      
      const searchPromises = artists.map(async (artist) => {
        console.log('API çağrısı yapılıyor:', artist);
        try {
          const searchResponse = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(artist + ' şarkıları en iyi')}`);
          const searchData = await searchResponse.json();
          console.log(`${artist} için sonuç:`, searchData.videos?.length || 0, 'video');
          
          if (searchData.videos && searchData.videos.length > 0) {
            return searchData.videos
              .filter((video: any) => {
                const title = video.title?.toLowerCase() || '';
                const artistName = artist.toLowerCase();
                // Sanatçı adı geçen ve müzik içeriği olan videoları filtrele
                return video.title && video.id && video.thumbnail && 
                       (title.includes(artistName) || title.includes('şarkı') || title.includes('music'));
              })
              .slice(0, 5)
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
          console.error(`${artist} için hata:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(searchPromises);
      const allSongs = results.flat();
      console.log('Toplam şarkı sayısı:', allSongs.length);
      setPlaylistSongs(allSongs);
    } catch (error) {
      console.error('loadPlaylistSongs genel hata:', error);
      setPlaylistSongs([]);
    } finally {
      setSongsLoading(false);
    }
  };

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const data = await getPlaylistById(params.id as string);
        setPlaylist(data || null);
        setLoading(false);
        
        if (data) {
          loadPlaylistSongs(data);
        }
      } catch (error) {
        console.error('Playlist yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (params.id) {
      loadPlaylist();
    }
  }, [params.id]);

  const handleRefreshSongs = async () => {
    console.log('Yenileme başladı, playlist:', playlist?.title);
    if (!playlist) return;
    
    console.log('loadPlaylistSongs çağrılıyor...');
    await loadPlaylistSongs(playlist);
    console.log('loadPlaylistSongs tamamlandı');
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  if (!playlist) {
    return <div className="text-center py-8">Playlist bulunamadı.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <img 
          src={playlist.imageUrl} 
          alt={playlist.title}
          className="w-48 h-48 rounded-lg object-cover"
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{playlist.title}</h1>
          <p className="text-muted-foreground text-lg">{playlist.description}</p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">{playlistSongs.length} şarkı</p>
            <Button 
              onClick={handleRefreshSongs}
              disabled={songsLoading}
              className="flex items-center gap-2"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${songsLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Şarkılar</h2>
        {songsLoading ? (
          <div className="text-center py-8">Müzikler yükleniyor...</div>
        ) : playlistSongs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Henüz şarkı yüklenmedi. Yenile butonuna tıklayın.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {playlistSongs.map((song) => (
              <div 
                key={song.id}
                onClick={() => {
                  // Aynı sanatçının şarkılarını gruplayarak queue oluştur
                  const artistSongs = playlistSongs.filter(s => s.artist === song.artist);
                  const otherSongs = playlistSongs.filter(s => s.artist !== song.artist);
                  const orderedQueue = [...artistSongs, ...otherSongs];
                  
                  const songWithPlaylist = { ...song, playlist: orderedQueue };
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
    </div>
  );
}
