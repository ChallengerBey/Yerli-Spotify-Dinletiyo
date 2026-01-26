"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Music, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { SongCard } from "@/components/song-card";
import { getPlaylists, Playlist, Song } from "@/lib/data";
import { YouTubePlaylistImport } from "@/components/youtube-playlist-import";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

interface UserPlaylist extends Playlist {
  songs?: Song[];
  createdAt?: string;
  isImported?: boolean;
  source?: string;
  playlist_songs?: any[];
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  user_id?: string;
}


export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [importedPlaylists, setImportedPlaylists] = useState<UserPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | UserPlaylist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadPlaylists = async () => {
      const data = await getPlaylists();
      setPlaylists(data);
    };
    loadPlaylists();
    loadUserPlaylists();
    loadImportedPlaylists();
  }, []);

  const loadUserPlaylists = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoadingPlaylists(false);
        return;
      }

      const response = await fetch('/api/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPlaylists(data.playlists || []);
      }
    } catch (error) {
      console.error('Error loading user playlists:', error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const loadImportedPlaylists = () => {
    const saved = localStorage.getItem('user-playlists');
    if (saved) {
      setImportedPlaylists(JSON.parse(saved));
    }
  };

  // YouTube playlist import edildiğinde çağrılır
  useEffect(() => {
    const handlePlaylistImported = () => {
      loadImportedPlaylists();
    };

    window.addEventListener('playlistImported', handlePlaylistImported);
    return () => window.removeEventListener('playlistImported', handlePlaylistImported);
  }, []);

  const deleteUserPlaylist = async (playlistId: string, isImported: boolean = false) => {
    if (isImported) {
      // İçe aktarılan playlist'i localStorage'dan sil
      const updated = importedPlaylists.filter(p => p.id !== playlistId);
      setImportedPlaylists(updated);
      localStorage.setItem('user-playlists', JSON.stringify(updated));
    } else {
      // Gerçek playlist'i API'den sil
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast({
            title: "Hata",
            description: "Giriş yapmanız gerekiyor",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch(`/api/playlists?id=${playlistId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setUserPlaylists(prev => prev.filter(p => p.id !== playlistId));
          toast({
            title: "Başarılı",
            description: "Playlist silindi",
          });
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Playlist silinemedi');
        }
      } catch (error: any) {
        toast({
          title: "Hata",
          description: error.message || "Playlist silinirken bir hata oluştu",
          variant: "destructive",
        });
      }
    }
    
    // Eğer silinen playlist seçiliyse, seçimi kaldır
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
    }
  };



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

  const handlePlaylistClick = async (playlist: Playlist | UserPlaylist) => {
    setSelectedPlaylist(playlist);
    setLoading(true);
    
    try {
      // Eğer gerçek playlist ise ve playlist_songs varsa
      if ('playlist_songs' in playlist && playlist.playlist_songs && playlist.playlist_songs.length > 0) {
        const songs = playlist.playlist_songs.map((ps: any) => ({
          id: ps.song_id,
          title: ps.song_data?.title || 'Bilinmeyen Şarkı',
          artist: ps.song_data?.artist || 'Bilinmeyen Sanatçı',
          album: ps.song_data?.album || '',
          duration: ps.song_data?.duration || '0:00',
          imageUrl: ps.song_data?.imageUrl || '/placeholder-song.jpg',
          audioUrl: ps.song_data?.audioUrl || ps.song_id
        }));
        setPlaylistSongs(songs);
        setLoading(false);
        return;
      }

      // Eğer user playlist'i ise ve şarkıları varsa, direkt kullan
      if ('songs' in playlist && playlist.songs && playlist.songs.length > 0) {
        setPlaylistSongs(playlist.songs);
        setLoading(false);
        return;
      }

      const artists = getArtistsByPlaylist(playlist.title || playlist.name || '');
      
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

  const addSongToPlaylist = async (song: Song, playlistId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Hata",
          description: "Giriş yapmanız gerekiyor",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/playlists/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          playlist_id: playlistId,
          song_id: song.id,
          song_data: {
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            imageUrl: song.imageUrl,
            audioUrl: song.audioUrl,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Şarkı playlist'e eklendi",
        });
        // Playlist'i yeniden yükle
        await loadUserPlaylists();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Şarkı eklenemedi');
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Şarkı eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleRefreshSongs = async () => {
    if (!selectedPlaylist) return;
    await handlePlaylistClick(selectedPlaylist);
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Playlistler</h1>
        <div className="flex gap-2">
          <Link href="/home/create-playlist">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Playlist
            </Button>
          </Link>
          <YouTubePlaylistImport />
        </div>
      </div>

      {!selectedPlaylist ? (
        <div className="space-y-8">
          {loadingPlaylists ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Playlistler yükleniyor...</span>
            </div>
          ) : (
            <>
              {/* Kullanıcının Oluşturduğu Playlistler */}
              {userPlaylists.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Playlistlerim ({userPlaylists.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {userPlaylists.map((playlist) => (
                      <div 
                        key={playlist.id} 
                        className="cursor-pointer group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg p-3"
                      >
                        <div onClick={() => handlePlaylistClick(playlist)}>
                          <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
                            <Music className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-base font-semibold truncate">{playlist.title || playlist.name}</p>
                          <p className="text-sm truncate text-muted-foreground">
                            {playlist.playlist_songs ? `${playlist.playlist_songs.length} şarkı` : (playlist.description || 'Boş playlist')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteUserPlaylist(playlist.id, false);
                          }}
                          className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* İçe Aktarılan Playlistler */}
              {importedPlaylists.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    İçe Aktarılan Playlistler ({importedPlaylists.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {importedPlaylists.map((playlist) => (
                      <div 
                        key={playlist.id} 
                        className="cursor-pointer group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg p-3"
                      >
                        <div onClick={() => handlePlaylistClick(playlist)}>
                          <img src={playlist.imageUrl} alt={playlist.title} className="w-full aspect-square object-cover rounded-lg mb-3" />
                          <p className="text-base font-semibold truncate">{playlist.title}</p>
                          <p className="text-sm truncate text-muted-foreground">
                            {playlist.songs ? `${playlist.songs.length} şarkı` : playlist.description}
                          </p>
                          {playlist.isImported && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Music className="h-3 w-3" />
                              YouTube
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteUserPlaylist(playlist.id, true);
                          }}
                          className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Varsayılan Playlistler */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Önerilen Playlistler</h2>
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
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setSelectedPlaylist(null)}>
                ← Geri
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{selectedPlaylist.title || selectedPlaylist.name}</h2>
                <p className="text-muted-foreground">
                  {selectedPlaylist.description || `${playlistSongs.length} şarkı`}
                </p>
              </div>
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Müzikler yükleniyor...</span>
            </div>
          ) : playlistSongs.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Bu playlist'te henüz şarkı yok</p>
              {('user_id' in selectedPlaylist) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Arama yaparak şarkı ekleyebilirsiniz
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {playlistSongs.map((song) => (
                <div 
                  key={song.id}
                  className="cursor-pointer group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg p-3"
                >
                  <div onClick={() => {
                    const songWithPlaylist = { ...song, playlist: playlistSongs };
                    window.dispatchEvent(new CustomEvent('playSong', { detail: songWithPlaylist }));
                  }}>
                    <img src={song.imageUrl} alt={song.title} className="w-full aspect-square object-cover rounded-lg mb-3" />
                    <p className="text-base font-semibold truncate">{song.title}</p>
                    <p className="text-sm truncate text-muted-foreground">{song.artist}</p>
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {song.duration}
                    </div>
                  </div>
                  {('user_id' in selectedPlaylist) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addSongToPlaylist(song, selectedPlaylist.id);
                      }}
                      className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Playlist'e ekle"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}