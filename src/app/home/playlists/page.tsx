'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Play, Clock, Music, Heart, MoreHorizontal, Shuffle, Youtube, Loader2, Import } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  songCount: number;
  duration: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  isLiked?: boolean;
  songs?: Song[];
  isImported?: boolean;
}

export default function PlaylistsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Load playlists from Supabase API
  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setMyPlaylists(data.playlists || []);
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportPlaylist = async () => {
    if (!importUrl) return;

    setIsImporting(true);
    try {
      // 1. YouTube playlist'ten şarkıları çek
      const res = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistUrl: importUrl }),
      });

      if (!res.ok) {
        throw new Error('Playlist alınamadı');
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 2. Playlist'i Supabase'e kaydet
      const createResponse = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.title || 'İçe Aktarılan Playlist',
          description: 'YouTube\'dan aktarıldı',
          isPublic: false,
          imageUrl: data.songs[0]?.imageUrl || '/default-playlist.png'
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Playlist kaydedilemedi');
      }

      const playlistData = await createResponse.json();
      const playlistId = playlistData.playlist.id;

      // 3. Şarkıları playlist'e ekle
      for (const song of data.songs) {
        await fetch(`/api/playlists/${playlistId}/songs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ song }),
        });
      }

      // 4. Playlist listesini yenile
      await loadPlaylists();

      setIsImportDialogOpen(false);
      setImportUrl('');
      toast({
        title: "Başarılı",
        description: `${data.songs.length} şarkı ile playlist başarıyla içe aktarıldı.`,
      });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Playlist aktarılırken bir hata oluştu.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const filteredPlaylists = myPlaylists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/home/playlist/${playlistId}`);
  };

  const handleCreatePlaylist = () => {
    router.push('/home/create-playlist');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Playlistlerin</h1>
          <p className="text-muted-foreground">
            Kendi müzik koleksiyonunu oluştur ve yönet
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Import className="h-4 w-4 mr-2" />
                Playlist Aktar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>YouTube & YouTube Music Playlist Aktar</DialogTitle>
                <DialogDescription>
                  YouTube veya YouTube Music playlist bağlantısını yapıştırarak müziklerini buraya aktarabilirsin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="url">Playlist Linki</Label>
                  <Input
                    id="url"
                    placeholder="https://music.youtube.com/playlist?list=..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleImportPlaylist} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aktarılıyor...
                    </>
                  ) : (
                    <>
                      <Youtube className="mr-2 h-4 w-4" />
                      Aktar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleCreatePlaylist}>
            <Plus className="h-4 w-4 mr-2" />
            Playlist Oluştur
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Playlist ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {myPlaylists.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Benim Playlistlerim (İçe Aktarılanlar)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myPlaylists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((playlist) => (
              <Card
                key={playlist.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-primary/20"
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <CardHeader className="pb-3">
                  <div className="relative aspect-square">
                    <Avatar className="h-full w-full rounded-lg">
                      <AvatarImage
                        src={playlist.imageUrl}
                        alt={playlist.name}
                        className="object-cover w-full h-full"
                      />
                      <AvatarFallback className="h-full w-full rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                        <Music className="h-12 w-12 text-white" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <Button
                        size="lg"
                        className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg"
                      >
                        <Play className="h-6 w-6 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <CardTitle className="text-lg truncate">{playlist.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {playlist.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Music className="h-3 w-3" />
                      <span>{playlist.songCount} şarkı</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && filteredPlaylists.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz playlist yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              Yeni bir playlist oluşturabilir veya YouTube’dan playlist aktarabilirsin.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleCreatePlaylist}>
                <Plus className="h-4 w-4 mr-2" />
                Playlist Oluştur
              </Button>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Import className="h-4 w-4 mr-2" />
                Playlist Aktar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}