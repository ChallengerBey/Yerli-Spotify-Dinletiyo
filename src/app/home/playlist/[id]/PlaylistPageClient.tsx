'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  MoreHorizontal,
  Heart,
  Share2,
  Download,
  Plus,
  Clock,
  Music,
  Search,
  Edit,
  Trash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import SongContextMenu from '@/components/song-context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  isLiked?: boolean;
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
  songs: Song[];
}

export default function PlaylistPageClient({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    song: Song;
  } | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getDefaultSongs = (): Song[] => [
    {
      id: 'default_1',
      title: 'Örnek Şarkı',
      artist: 'Sanatçı',
      album: 'Albüm',
      duration: '3:45',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
      audioUrl: '',
    }
  ];

  const getFallbackSongs = (): Song[] => {
    return [
      {
        id: 'BNAEBRXlUlk',
        title: 'Tarkan - Şımarık',
        artist: 'Tarkan',
        album: 'Türkçe Pop Hits',
        duration: '3:45',
        imageUrl: 'https://i.ytimg.com/vi/BNAEBRXlUlk/maxresdefault.jpg',
        audioUrl: 'BNAEBRXlUlk',
        isLiked: true
      },
      {
        id: 'BypWUfBsNlE',
        title: 'Sezen Aksu - Gel Gör Beni Aşk Neyledi',
        artist: 'Sezen Aksu',
        album: 'Türkçe Pop Hits',
        duration: '4:23',
        imageUrl: 'https://i.ytimg.com/vi/BypWUfBsNlE/maxresdefault.jpg',
        audioUrl: 'BypWUfBsNlE'
      },
      {
        id: 'rxlKhwHkRP0',
        title: 'Ajda Pekkan - Bambaşka Biri',
        artist: 'Ajda Pekkan',
        album: 'Türkçe Pop Hits',
        duration: '3:38',
        imageUrl: 'https://i.ytimg.com/vi/rxlKhwHkRP0/maxresdefault.jpg',
        audioUrl: 'rxlKhwHkRP0',
        isLiked: true
      },
      {
        id: 'qDptS1C7rkE',
        title: 'Barış Manço - Gülpembe',
        artist: 'Barış Manço',
        album: 'Türkçe Pop Hits',
        duration: '3:28',
        imageUrl: 'https://i.ytimg.com/vi/qDptS1C7rkE/maxresdefault.jpg',
        audioUrl: 'qDptS1C7rkE'
      },
      {
        id: 'gyCADiiKmPs',
        title: 'Teoman - Kış Güneşi',
        artist: 'Teoman',
        album: 'Türkçe Pop Hits',
        duration: '4:15',
        imageUrl: 'https://i.ytimg.com/vi/gyCADiiKmPs/maxresdefault.jpg',
        audioUrl: 'gyCADiiKmPs',
        isLiked: true
      },
      {
        id: 'HhZaHf8RP6g',
        title: 'Buray - Aşk Laftan Anlamaz',
        artist: 'Buray',
        album: 'Türkçe Pop Hits',
        duration: '3:35',
        imageUrl: 'https://i.ytimg.com/vi/HhZaHf8RP6g/maxresdefault.jpg',
        audioUrl: 'HhZaHf8RP6g'
      }
    ];
  };

  const fetchPlaylistSongs = async (pid: string) => {
    setSongsLoading(true);
    try {
      const playlistMap: Record<string, { name: string; ytId?: string; search?: string }> = {
        '2': { name: 'Türkçe Pop Hits', ytId: 'PLDIoUOhQQPlVr3qepMVRsDe4T8vNQsvno' },
        '3': { name: 'Odaklanma Zamanı', ytId: 'PLSFO4kUjyZoCxYe-eyZPTslPyFPBt4Jco', search: 'odaklanma müziği focus music instrumental' },
        '4': { name: 'Antrenman Modu', ytId: 'PLGBKsNyGY-af7Zg-1EfUoteJZLnk_P09y', search: 'antrenman müziği workout music gym motivation' },
        '5': { name: '90\'lar Nostalji', ytId: 'PLdl_B4yAg4ESyGpUYItES61syZvW5Abjq', search: '90lar müzik nostalji 90s hits türkçe' },
        '6': { name: 'Akustik Akşamlar', ytId: 'PLzBgi-bjxcqLwxcVV-cjdW08yvc3Vp3c8', search: 'akustik müzik acoustic songs türkçe sakin' },
        '7': { name: 'Türkçe Rock', ytId: 'PLexq5cxhVyKJ-4FIk3q3R6WT3j6H8tO3O', search: 'türkçe rock müzik duman teoman şebnem ferah' },
        '8': { name: 'Damar Şarkılar', ytId: 'PLzBgi-bjxcqLAUUOFxLjay28s_4Zkn6lS', search: 'damar şarkılar türkçe hüzünlü aşk şarkıları' },
        '9': { name: 'Elektronik Dans', ytId: 'PLMmqTuUsDkRIqz8Z-YlOLsDSB9nb0A_vn', search: 'elektronik dans müzik electronic dance music EDM' },
        '10': { name: 'Yeni Nesil Rap', ytId: 'PLzBgi-bjxcqI-xneYr9Dy05DkputIExBs', search: 'yeni nesil rap türkçe rap 2024 ezhel khontkar' },
        '11': { name: 'Yolculuk Şarkıları', ytId: 'PLXpMeQYR1ilKdiZXiH5ac8QXWLOLIpPYt', search: 'yolculuk şarkıları road trip music türkçe' },
        '12': { name: 'Efsane Şarkılar', ytId: 'PLuUt-gc4791kpVxrboejzEIt_63eHQabz', search: 'efsane şarkılar klasik türkçe müzik hit şarkılar' },
        '13': { name: 'Haftanın Keşifleri', ytId: 'PLbtb_CUyJgTw7ZbNLEoc1qQy-vNuEhvYL', search: 'yeni çıkan şarkılar 2024 keşif müzik trend' },
      };

      const info = playlistMap[pid];
      if (info) {
        if (info.ytId) {
          const res = await fetch(`/api/youtube-playlist?playlistId=${info.ytId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.videos?.length) {
              setPlaylistSongs(data.videos.map((v: any) => ({
                id: v.id,
                title: v.title,
                artist: v.channelTitle || 'YouTube',
                album: info.name,
                duration: v.duration || '3:45',
                imageUrl: v.thumbnail,
                isLiked: Math.random() > 0.7
              })));
              return;
            }
          }
        }

        if (info.search || pid === '2') {
          const q = info.search || 'türkçe pop hits 2024 popüler';
          const res = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.videos?.length) {
              setPlaylistSongs(data.videos.slice(0, 30).map((v: any) => ({
                id: v.id,
                title: v.title,
                artist: v.channelTitle || 'YouTube',
                album: info.name,
                duration: v.duration || '3:45',
                imageUrl: v.thumbnail,
                isLiked: Math.random() > 0.7
              })));
              return;
            }
          }
        }
      }

      // Fallback for custom or failed fetches
      if (pid === '2') {
        setPlaylistSongs(getFallbackSongs());
      } else {
        // Try dynamic fetch from API
        const response = await fetch(`/api/playlists/${pid}/songs`);
        if (response.ok) {
          const songsData = await response.json();
          setPlaylistSongs(songsData.songs || []);
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      }
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      setPlaylistSongs(getDefaultSongs());
    } finally {
      setSongsLoading(false);
    }
  };

  const fetchPlaylist = async (pid: string) => {
    try {
      const response = await fetch(`/api/playlists/${pid}`);
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data.playlist);
        setLoading(false);
        return;
      }
      
      // Fallback for hardcoded IDs
      const names: Record<string, string> = {
        '2': 'Türkçe Pop Hits', '3': 'Odaklanma Zamanı', '4': 'Antrenman Modu',
        '5': '90\'lar Nostalji', '6': 'Akustik Akşamlar', '7': 'Türkçe Rock',
        '8': 'Damar Şarkılar', '9': 'Elektronik Dans', '10': 'Yeni Nesil Rap',
        '11': 'Yolculuk Şarkıları', '12': 'Efsane Şarkılar', '13': 'Haftanın Keşifleri'
      };
      
      const descriptions: Record<string, string> = {
        '2': 'En popüler Türkçe şarkılar', '3': 'Çalışma ve odaklanma için sakin müzikler',
        '4': 'Spor yaparken dinlenecek enerjik şarkılar', '5': '90\'ların unutulmaz şarkıları',
        '6': 'Sakin akşamlar için akustik şarkılar', '7': 'Türk rock müziğinin en iyileri',
        '8': 'Kalbe dokunan damar şarkılar', '9': 'Dans etmek için elektronik müzikler',
        '10': 'Türkiye\'nin yeni nesil rap sanatçıları', '11': 'Uzun yolculuklar için keyifli şarkılar',
        '12': 'Hiç eskimeyen efsane şarkılar', '13': 'Bu hafta keşfettiğin yeni şarkılar'
      };

      const images: Record<string, string> = {
        '2': '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png', '3': '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png',
        '4': '/Fotoğraflar/ANTREMANMODU.333Z.png', '5': '/Fotoğraflar/90lar.973Z.png',
        '6': '/Fotoğraflar/akustik akşamlar.911Z.png', '7': '/Fotoğraflar/TÜKRÇE ROCK.037Z.png',
        '8': '/Fotoğraflar/damarşarkılar.917Z.png', '9': '/Fotoğraflar/elektronik dans.885Z.png',
        '10': '/Fotoğraflar/YENİNESİLRAP.797Z.png', '11': '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
        '12': '/Fotoğraflar/Efsaneşarkılar.885Z.png', '13': '/Fotoğraflar/haftanın keşifleri.341Z.png'
      };

      if (names[pid]) {
        setPlaylist({
          id: pid,
          name: names[pid],
          description: descriptions[pid],
          imageUrl: images[pid],
          songCount: 30,
          duration: '2s 0dk',
          isPublic: true,
          createdBy: 'Dinletiyo',
          createdAt: new Date().toISOString(),
          songs: []
        });
        setLoading(false);
      } else {
        setPlaylist(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist(playlistId);
      fetchPlaylistSongs(playlistId);
    }
  }, [playlistId]);

  useEffect(() => {
    const handleSongChange = (event: any) => {
      const songData = event.detail;
      const displayId = songData.originalId || songData.id;
      setCurrentSong(displayId);
      setIsPlaying(true);
      localStorage.setItem('current-song-id', displayId);
    };

    const handlePlayStateChange = (event: any) => {
      const { isPlaying: playing } = event.detail;
      setIsPlaying(playing);
      localStorage.setItem('is-playing', playing.toString());
    };

    const loadCurrentSong = () => {
      try {
        const savedSongId = localStorage.getItem('current-song-id');
        const savedIsPlaying = localStorage.getItem('is-playing');
        if (savedSongId) setCurrentSong(savedSongId);
        if (savedIsPlaying) setIsPlaying(savedIsPlaying === 'true');
      } catch {}
    };

    loadCurrentSong();
    window.addEventListener('songChanged', handleSongChange);
    window.addEventListener('playStateChanged', handlePlayStateChange);
    return () => {
      window.removeEventListener('songChanged', handleSongChange);
      window.removeEventListener('playStateChanged', handlePlayStateChange);
    };
  }, []);

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Başarılı', description: 'Playlist silindi.' });
        router.push('/home/playlists');
      } else {
        throw new Error('Playlist silinemedi');
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Playlist silinirken hata oluştu.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, song: Song) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, song });
  };

  const handleEditPlaylist = () => {
    if (playlist) {
      setEditName(playlist.name);
      setEditDescription(playlist.description);
      setEditImageUrl(playlist.imageUrl);
      setIsEditing(true);
    }
  };

  const handleSavePlaylist = async () => {
    if (!playlist) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editName, description: editDescription, image_url: editImageUrl }),
      });
      if (!response.ok) throw new Error('Playlist güncellenemedi');
      setPlaylist({ ...playlist, name: editName, description: editDescription, imageUrl: editImageUrl });
      toast({ title: 'Başarılı', description: 'Playlist güncellendi.' });
      setIsEditing(false);
    } catch (error) {
      toast({ title: 'Hata', description: 'Playlist güncellenirken hata oluştu.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayPlaylist = (shuffle = false) => {
    if (playlistSongs.length === 0) return;
    const songsToPlay = shuffle ? [...playlistSongs].sort(() => Math.random() - 0.5) : playlistSongs;
    const firstSong = songsToPlay[0];
    setCurrentSong(firstSong.id);
    setIsPlaying(true);
    const songData = {
      id: firstSong.id,
      title: firstSong.title,
      artist: firstSong.artist,
      album: firstSong.album,
      duration: firstSong.duration,
      imageUrl: firstSong.imageUrl,
      audioUrl: firstSong.id,
      aiHint: 'youtube',
      playlist: { id: playlist?.id, name: playlist?.name, songs: songsToPlay, currentIndex: 0 }
    };
    window.dispatchEvent(new CustomEvent('playSong', { detail: songData }));
    toast({ title: shuffle ? 'Karıştırılarak Çalıyor' : 'Playlist Çalıyor', description: `${firstSong.title} - ${firstSong.artist}` });
  };

  const handleSongPlay = (songId: string) => {
    setCurrentSong(songId);
    setIsPlaying(true);
    const song = playlistSongs.find(s => s.id === songId);
    if (song) {
      const currentIndex = playlistSongs.findIndex(s => s.id === songId);
      const songData = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        imageUrl: song.imageUrl,
        audioUrl: song.id,
        aiHint: 'youtube',
        playlist: { id: playlist?.id, name: playlist?.name, songs: playlistSongs, currentIndex: currentIndex }
      };
      window.dispatchEvent(new CustomEvent('playSong', { detail: songData }));
      toast({ title: 'Şimdi Çalıyor', description: `${song.title} - ${song.artist}` });
    }
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredSongs = playlistSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Playlist yükleniyor...</p></div>;
  if (!playlist) return <div className="flex flex-col items-center justify-center h-64 space-y-4"><Music className="h-12 w-12 text-muted-foreground" /><p className="text-muted-foreground">Playlist bulunamadı</p><Button onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Geri Dön</Button></div>;

  return (
    <main className="space-y-6">
      <nav className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Geri dön">
          <ArrowLeft className="h-4 w-4 mr-2" />Geri
        </Button>
      </nav>

      <header className="flex flex-col md:flex-row gap-6 mb-8">
        <Avatar className="h-64 w-64 rounded-lg shadow-lg">
          <AvatarImage src={playlist.imageUrl} alt={playlist.name} className="object-cover" />
          <AvatarFallback className="h-64 w-64 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="h-16 w-16 text-white" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              {playlist.isPublic ? 'Herkese Açık Playlist' : 'Özel Playlist'}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground text-lg">{playlist.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold">{playlist.createdBy}</span>
            <span>•</span>
            <span>{playlist.songCount} şarkı</span>
            <span>•</span>
            <span>{playlist.duration}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              onClick={() => handlePlayPlaylist(false)} 
              className="rounded-full h-14 w-14"
              aria-label={`${playlist.name} çalma listesini başlat`}
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => handlePlayPlaylist(true)}>
              <Shuffle className="h-5 w-5 mr-2" />Karıştır
            </Button>
            <Button variant="outline" size="lg" onClick={handleEditPlaylist}>
              <Edit className="h-5 w-5 mr-2" />Düzenle
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-red-500 hover:text-red-500 hover:bg-red-500/10" 
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <Trash className="h-5 w-5 mr-2" />Sil
            </Button>
            <Button variant="ghost" size="lg" aria-label="Beğen">
              <Heart className={`h-5 w-5 ${playlist.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="lg" aria-label="İndir"><Download className="h-5 w-5" /></Button>
            <Button variant="ghost" size="lg" aria-label="Paylaş"><Share2 className="h-5 w-5" /></Button>
            <Button variant="ghost" size="lg" aria-label="Daha fazla"><MoreHorizontal className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      <section className="space-y-4" aria-label="Şarkı listesi ve arama">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Playlist'te ara..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10"
              aria-label="Playlist içinde şarkı ara"
            />
          </div>
          <Button onClick={() => toast({ title: 'Yakında', description: 'Şarkı ekleme özelliği yakında eklenecek.' })}>
            <Plus className="h-4 w-4 mr-2" />Şarkı Ekle
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {songsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Şarkılar yükleniyor...</p>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{searchQuery ? 'Şarkı bulunamadı' : 'Henüz şarkı yok'}</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery ? 'Arama kriterlerinize uygun şarkı bulunamadı' : 'Bu playlist\'e şarkı ekleyerek başlayın'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                <div className="grid grid-cols-12 gap-4 p-4 text-sm text-muted-foreground font-medium" role="row">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Başlık</div>
                  <div className="col-span-3">Albüm</div>
                  <div className="col-span-1"><Clock className="h-4 w-4" aria-label="Süre" /></div>
                  <div className="col-span-1"></div>
                </div>
                {filteredSongs.map((song, index) => (
                  <article 
                    key={song.id} 
                    className={`grid grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors group cursor-pointer ${currentSong === song.id ? 'bg-accent' : ''}`} 
                    onClick={() => handleSongPlay(song.id)} 
                    onContextMenu={(e) => handleContextMenu(e, song)}
                    role="row"
                  >
                    <div className="col-span-1 flex items-center">
                      <span className="text-muted-foreground group-hover:hidden">{index + 1}</span>
                      <Button variant="ghost" size="sm" className="hidden group-hover:flex h-8 w-8 p-0" aria-label={currentSong === song.id && isPlaying ? 'Duraklat' : 'Oynat'}>
                        {currentSong === song.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="col-span-6 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={song.imageUrl} alt={song.title} />
                        <AvatarFallback><Music className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className={`font-medium truncate ${currentSong === song.id ? 'text-primary' : ''}`}>{song.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <p className="text-sm text-muted-foreground truncate">{song.album}</p>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100" aria-label="Beğen">
                        <Heart className={`h-4 w-4 ${song.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <span className="text-sm text-muted-foreground group-hover:hidden">{song.duration}</span>
                      <Button variant="ghost" size="sm" className="hidden group-hover:flex h-8 w-8 p-0" aria-label="Seçenekler">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {contextMenu && <SongContextMenu song={contextMenu.song} x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} />}
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="name">İsim</Label><Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="description">Açıklama</Label><Textarea id="description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="imageUrl">Kapak Resmi URL</Label><Input id="imageUrl" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button onClick={handleSavePlaylist} disabled={isSaving}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <div className="p-4 text-center space-y-4">
            <h2 className="text-xl font-bold">Playlisti Sil</h2>
            <p className="text-muted-foreground">Bu playlisti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>İptal</Button>
              <Button variant="destructive" onClick={handleDeletePlaylist} disabled={isDeleting}>{isDeleting ? 'Siliniyor...' : 'Sil'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
