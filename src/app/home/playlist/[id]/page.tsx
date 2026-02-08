'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  DialogTrigger
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

export default function PlaylistDetailPage() {
  const params = useParams();
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

  const fetchPlaylistSongs = async (playlistId: string) => {
    if (playlistId.startsWith('imported_')) {
      return; // Imported playlists are handled in fetchPlaylist
    }
    if (playlistId === '2') { // Türkçe Pop Hits
      setSongsLoading(true);
      try {
        // Önce YouTube playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLDIoUOhQQPlVr3qepMVRsDe4T8vNQsvno`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Türkçe Pop Hits',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa normal arama yap
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('türkçe pop hits 2024 popüler')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            // YouTube'dan gelen şarkıları fallback şarkılarla birleştir
            const youtubeVideos = data.videos.slice(0, 15);
            const fallbackVideos = getFallbackSongs().slice(0, 15);

            const allVideos = [...youtubeVideos, ...fallbackVideos];

            const songs: Song[] = allVideos.map((video: any, index: number) => ({
              id: video.id || `fallback_${index}`,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Türkçe Pop Hits',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail?.thumbnails?.[0]?.url || video.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
              audioUrl: video.id || video.videoId || video.audioUrl || '',
              isLiked: video.isLiked || false,
            }));

            setPlaylistSongs(songs);
          } else {
            // API başarısız olursa sadece fallback şarkıları kullan
            const fallbackSongs = getFallbackSongs();
            setPlaylistSongs(fallbackSongs);
          }
        } else {
          const fallbackSongs = getFallbackSongs();
          setPlaylistSongs(fallbackSongs);
        }
      } catch (error) {
        console.error('Error fetching playlist songs:', error);
        const fallbackSongs = getFallbackSongs();
        setPlaylistSongs(fallbackSongs);
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '3') { // Odaklanma Zamanı
      setSongsLoading(true);
      try {
        // Odaklanma Zamanı playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLSFO4kUjyZoCxYe-eyZPTslPyFPBt4Jco`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Odaklanma Zamanı',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa odaklanma müziği ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('odaklanma müziği focus music instrumental')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 25).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Odaklanma Zamanı',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching focus playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '4') { // Antrenman Modu
      setSongsLoading(true);
      try {
        // Antrenman Modu playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLGBKsNyGY-af7Zg-1EfUoteJZLnk_P09y`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Antrenman Modu',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa antrenman müziği ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('antrenman müziği workout music gym motivation')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 35).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Antrenman Modu',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching workout playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '5') { // 90'lar Nostalji
      setSongsLoading(true);
      try {
        // 90'lar Nostalji playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLdl_B4yAg4ESyGpUYItES61syZvW5Abjq`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: '90\'lar Nostalji',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa 90'lar müziği ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('90lar müzik nostalji 90s hits türkçe')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 42).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: '90\'lar Nostalji',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching 90s playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '6') { // Akustik Akşamlar
      setSongsLoading(true);
      try {
        // Akustik Akşamlar playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLzBgi-bjxcqLwxcVV-cjdW08yvc3Vp3c8`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Akustik Akşamlar',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa akustik müzik ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('akustik müzik acoustic songs türkçe sakin')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 28).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Akustik Akşamlar',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching acoustic playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '7') { // Türkçe Rock
      setSongsLoading(true);
      try {
        // Türkçe Rock playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLexq5cxhVyKJ-4FIk3q3R6WT3j6H8tO3O`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Türkçe Rock',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa türkçe rock ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('türkçe rock müzik duman teoman şebnem ferah')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 38).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Türkçe Rock',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching turkish rock playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '8') { // Damar Şarkılar
      setSongsLoading(true);
      try {
        // Damar Şarkılar playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLzBgi-bjxcqLAUUOFxLjay28s_4Zkn6lS`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Damar Şarkılar',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa damar şarkılar ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('damar şarkılar türkçe hüzünlü aşk şarkıları')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 33).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Damar Şarkılar',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching damar playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '9') { // Elektronik Dans
      setSongsLoading(true);
      try {
        // Elektronik Dans playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLMmqTuUsDkRIqz8Z-YlOLsDSB9nb0A_vn`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Elektronik Dans',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa elektronik dans ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('elektronik dans müzik electronic dance music EDM')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 29).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Elektronik Dans',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching electronic dance playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '10') { // Yeni Nesil Rap
      setSongsLoading(true);
      try {
        // Yeni Nesil Rap playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLzBgi-bjxcqI-xneYr9Dy05DkputIExBs`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Yeni Nesil Rap',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa yeni nesil rap ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('yeni nesil rap türkçe rap 2024 ezhel khontkar')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 31).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Yeni Nesil Rap',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching new generation rap playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '11') { // Yolculuk Şarkıları
      setSongsLoading(true);
      try {
        // Yolculuk Şarkıları playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLXpMeQYR1ilKdiZXiH5ac8QXWLOLIpPYt`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Yolculuk Şarkıları',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa yolculuk şarkıları ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('yolculuk şarkıları road trip music türkçe')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 26).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Yolculuk Şarkıları',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching road trip playlist songs:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '12') { // Efsane Şarkılar
      setSongsLoading(true);
      try {
        // Efsane Şarkılar playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLuUt-gc4791kpVxrboejzEIt_63eHQabz`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Efsane Şarkılar',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa efsane şarkılar ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('efsane şarkılar klasik türkçe müzik hit şarkılar')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 44).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Efsane Şarkılar',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching legendary songs playlist:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else if (playlistId === '13') { // Haftanın Keşifleri
      setSongsLoading(true);
      try {
        // Haftanın Keşifleri playlist'inden çek
        const playlistResponse = await fetch(`/api/youtube-playlist?playlistId=PLbtb_CUyJgTw7ZbNLEoc1qQy-vNuEhvYL`);

        if (playlistResponse.ok) {
          const playlistData = await playlistResponse.json();

          if (playlistData.videos && playlistData.videos.length > 0) {
            const songs: Song[] = playlistData.videos.map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Haftanın Keşifleri',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
            setSongsLoading(false);
            return;
          }
        }

        // Playlist API başarısız olursa haftanın keşifleri ara
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent('yeni çıkan şarkılar 2024 keşif müzik trend')}`);

        if (response.ok) {
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            const songs: Song[] = data.videos.slice(0, 22).map((video: any, index: number) => ({
              id: video.id,
              title: video.title,
              artist: video.channelTitle || 'YouTube',
              album: 'Haftanın Keşifleri',
              duration: video.duration || '3:45',
              imageUrl: video.thumbnail,
              isLiked: Math.random() > 0.7 // Random like status
            }));

            setPlaylistSongs(songs);
          } else {
            setPlaylistSongs(getDefaultSongs());
          }
        } else {
          setPlaylistSongs(getDefaultSongs());
        }
      } catch (error) {
        console.error('Error fetching weekly discoveries playlist:', error);
        setPlaylistSongs(getDefaultSongs());
      } finally {
        setSongsLoading(false);
      }
    } else {
      // Diğer playlist'ler için varsayılan şarkılar
      const defaultSongs = getDefaultSongs();
      setPlaylistSongs(defaultSongs);
    }
  };

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
      // ... (reducing list for brevity in this replacement, but keeping key ones)
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

  const getDefaultSongs = (): Song[] => {
    return [
      {
        id: '1',
        title: 'Örnek Şarkı 1',
        artist: 'Örnek Sanatçı',
        album: 'Örnek Albüm',
        duration: '3:45',
        imageUrl: 'https://i.ytimg.com/vi/default/maxresdefault.jpg',
        audioUrl: '1'
      },
      {
        id: '2',
        title: 'Örnek Şarkı 2',
        artist: 'Örnek Sanatçı 2',
        album: 'Örnek Albüm 2',
        duration: '4:12',
        imageUrl: 'https://i.ytimg.com/vi/default/maxresdefault.jpg',
        audioUrl: '2'
      }
    ];
  };

  const getPlaylistName = (id: string) => {
    const names: { [key: string]: string } = {
      '2': 'Türkçe Pop Hits',
      '3': 'Odaklanma Zamanı',
      '4': 'Antrenman Modu',
      '5': '90\'lar Nostalji',
      '6': 'Akustik Akşamlar',
      '7': 'Türkçe Rock',
      '8': 'Damar Şarkılar',
      '9': 'Elektronik Dans',
      '10': 'Yeni Nesil Rap',
      '11': 'Yolculuk Şarkıları',
      '12': 'Efsane Şarkılar',
      '13': 'Haftanın Keşifleri'
    };
    return names[id] || 'Bilinmeyen Playlist';
  };

  const getPlaylistDescription = (id: string) => {
    const descriptions: { [key: string]: string } = {
      '2': 'En popüler Türkçe şarkılar',
      '3': 'Çalışma ve odaklanma için sakin müzikler',
      '4': 'Spor yaparken dinlenecek enerjik şarkılar',
      '5': '90\'ların unutulmaz şarkıları',
      '6': 'Sakin akşamlar için akustik şarkılar',
      '7': 'Türk rock müziğinin en iyileri',
      '8': 'Kalbe dokunan damar şarkılar',
      '9': 'Dans etmek için elektronik müzikler',
      '10': 'Türkiye\'nin yeni nesil rap sanatçıları',
      '11': 'Uzun yolculuklar için keyifli şarkılar',
      '12': 'Hiç eskimeyen efsane şarkılar',
      '13': 'Bu hafta keşfettiğin yeni şarkılar'
    };
    return descriptions[id] || 'Playlist açıklaması';
  };

  const getPlaylistInfo = (id: string) => {
    const info: { [key: string]: { songCount: number, duration: string } } = {
      '2': { songCount: 47, duration: '2s 58dk' }, // Türkçe Pop Hits
      '3': { songCount: 25, duration: '1s 32dk' }, // Odaklanma Zamanı
      '4': { songCount: 35, duration: '2s 15dk' }, // Antrenman Modu
      '5': { songCount: 42, duration: '2s 45dk' }, // 90'lar Nostalji
      '6': { songCount: 28, duration: '1s 48dk' }, // Akustik Akşamlar
      '7': { songCount: 38, duration: '2s 22dk' }, // Türkçe Rock
      '8': { songCount: 33, duration: '2s 8dk' },  // Damar Şarkılar
      '9': { songCount: 29, duration: '1s 55dk' }, // Elektronik Dans
      '10': { songCount: 31, duration: '2s 2dk' }, // Yeni Nesil Rap
      '11': { songCount: 26, duration: '1s 38dk' }, // Yolculuk Şarkıları
      '12': { songCount: 44, duration: '2s 52dk' }, // Efsane Şarkılar
      '13': { songCount: 22, duration: '1s 25dk' }  // Haftanın Keşifleri
    };
    return info[id] || { songCount: 30, duration: '2s 0dk' };
  };

  const getPlaylistImage = (id: string) => {
    const images: { [key: string]: string } = {
      '2': '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
      '3': '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png',
      '4': '/Fotoğraflar/ANTREMANMODU.333Z.png',
      '5': '/Fotoğraflar/90lar.973Z.png',
      '6': '/Fotoğraflar/akustik akşamlar.911Z.png',
      '7': '/Fotoğraflar/TÜKRÇE ROCK.037Z.png',
      '8': '/Fotoğraflar/damarşarkılar.917Z.png',
      '9': '/Fotoğraflar/elektronik dans.885Z.png',
      '10': '/Fotoğraflar/YENİNESİLRAP.797Z.png',
      '11': '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
      '12': '/Fotoğraflar/Efsaneşarkılar.885Z.png',
      '13': '/Fotoğraflar/haftanın keşifleri.341Z.png'
    };
    return images[id] || '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png';
  };

  useEffect(() => {
    if (params.id) {
      fetchPlaylist(params.id as string);
      fetchPlaylistSongs(params.id as string);
    }
  }, [params.id]);

  // Player'dan gelen şarkı değişikliklerini dinle
  useEffect(() => {
    const handleSongChange = (event: any) => {
      const songData = event.detail;
      console.log('🎵 Playlist: Şarkı değişti:', songData.title, 'ID:', songData.id);

      // Orijinal ID varsa onu kullan, yoksa normal ID'yi kullan
      const displayId = songData.originalId || songData.id;
      setCurrentSong(displayId);
      setIsPlaying(true);

      // LocalStorage'a da kaydet
      localStorage.setItem('current-song-id', displayId);

      console.log('🎯 Playlist vurgulanacak ID:', displayId);
    };

    const handlePlayStateChange = (event: any) => {
      const { isPlaying: playing } = event.detail;
      console.log('▶️ Playlist: Play state değişti:', playing);
      setIsPlaying(playing);

      // LocalStorage'a da kaydet
      localStorage.setItem('is-playing', playing.toString());
    };

    // Player'dan progress güncellemelerini dinle
    const handleProgressUpdate = (event: any) => {
      const { progress, duration } = event.detail;
      // Progress güncellemelerini burada işleyebiliriz
    };

    // LocalStorage'dan mevcut şarkıyı yükle
    const loadCurrentSong = () => {
      try {
        const savedSong = localStorage.getItem('current-song');
        const savedSongId = localStorage.getItem('current-song-id');
        const savedIsPlaying = localStorage.getItem('is-playing');

        if (savedSong) {
          const songData = JSON.parse(savedSong);
          console.log('💾 LocalStorage\'dan şarkı yüklendi:', songData.title, 'ID:', songData.id);
          setCurrentSong(savedSongId || songData.id);
          setIsPlaying(savedIsPlaying === 'true');
        }
      } catch (error) {
        console.error('LocalStorage şarkı yükleme hatası:', error);
      }
    };

    // Sayfa yüklendiğinde mevcut şarkıyı yükle
    loadCurrentSong();

    // Event listener'ları ekle
    window.addEventListener('songChanged', handleSongChange);
    window.addEventListener('playStateChanged', handlePlayStateChange);
    window.addEventListener('progressUpdate', handleProgressUpdate);

    return () => {
      window.removeEventListener('songChanged', handleSongChange);
      window.removeEventListener('playStateChanged', handlePlayStateChange);
      window.removeEventListener('progressUpdate', handleProgressUpdate);
    };
  }, []);

  // Debug: currentSong değişikliklerini logla
  useEffect(() => {
    console.log('🎯 Playlist currentSong değişti:', currentSong);
    console.log('🎯 Playlist isPlaying:', isPlaying);
  }, [currentSong, isPlaying]);

  const fetchPlaylist = async (playlistId: string) => {
    try {
      // İçe aktarılan playlist kontrolü
      if (playlistId.startsWith('imported_')) {
        const savedPlaylists = localStorage.getItem('my_imported_playlists');
        if (savedPlaylists) {
          const playlists = JSON.parse(savedPlaylists);
          const foundPlaylist = playlists.find((p: any) => p.id === playlistId);

          if (foundPlaylist) {
            setPlaylist({
              ...foundPlaylist,
              songs: foundPlaylist.songs || [] // Ensure songs array exists
            });
            // Eğer şarkılar playlist objesi içindeyse, şarkıları da yükle
            if (foundPlaylist.songs && foundPlaylist.songs.length > 0) {
              setPlaylistSongs(foundPlaylist.songs);
            }
            setLoading(false);
            return;
          }
        }
      }

      const playlistInfo = getPlaylistInfo(playlistId);

      // Mock data - sabit değerlerle
      const mockPlaylist: Playlist = {
        id: playlistId,
        name: getPlaylistName(playlistId),
        description: getPlaylistDescription(playlistId),
        imageUrl: getPlaylistImage(playlistId),
        songCount: playlistInfo.songCount,
        duration: playlistInfo.duration,
        isPublic: true,
        createdBy: 'Sen',
        createdAt: '2024-01-15',
        songs: playlistSongs
      };

      setPlaylist(mockPlaylist);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast({
        title: 'Hata',
        description: 'Playlist yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      if (!playlistId.startsWith('imported_')) {
        setLoading(false);
      }
    }
  };

  // Delete State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ... (edit state stuff) ...

  const handleDeletePlaylist = async () => {
    if (!playlist) return;

    setIsDeleting(true);
    try {
      if (playlist.id.startsWith('imported_')) {
        const savedPlaylists = localStorage.getItem('my_imported_playlists');
        if (savedPlaylists) {
          const playlists = JSON.parse(savedPlaylists);
          const updatedPlaylists = playlists.filter((p: any) => p.id !== playlist.id);
          localStorage.setItem('my_imported_playlists', JSON.stringify(updatedPlaylists));

          toast({
            title: 'Başarılı',
            description: 'Playlist silindi.',
          });
          router.push('/home/playlists');
        }
      } else {
        // Mock data or other types - prevent deletion for now or implement DB logic
        toast({
          title: 'Bilgi',
          description: 'Bu playlist silinemez (Sistem Playlisti).',
        });
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: 'Hata',
        description: 'Playlist silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, song: Song) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, song });
  };

  // ... handleEditPlaylist ...


  const handleEditPlaylist = () => {
    if (playlist) {
      setEditName(playlist.name);
      setEditDescription(playlist.description);
      setEditImageUrl(playlist.imageUrl);
      setIsEditing(true);
    }
  };

  // ... handleSavePlaylist ...

  const handleSavePlaylist = async () => {
    if (!playlist) return;

    setIsSaving(true);
    try {
      if (playlist.id.startsWith('imported_')) {
        const savedPlaylists = localStorage.getItem('my_imported_playlists');
        if (savedPlaylists) {
          const playlists = JSON.parse(savedPlaylists);
          const updatedPlaylists = playlists.map((p: any) => {
            if (p.id === playlist.id) {
              return {
                ...p,
                name: editName,
                description: editDescription,
                imageUrl: editImageUrl
              };
            }
            return p;
          });

          localStorage.setItem('my_imported_playlists', JSON.stringify(updatedPlaylists));

          setPlaylist({
            ...playlist,
            name: editName,
            description: editDescription,
            imageUrl: editImageUrl
          });

          toast({
            title: 'Başarılı',
            description: 'Playlist güncellendi.',
          });
          setIsEditing(false);
        }
      } else {
        toast({
          title: 'Hata',
          description: 'Sadece içe aktarılan playlistler düzenlenebilir.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast({
        title: 'Hata',
        description: 'Playlist güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? 'Durduruldu' : 'Çalıyor',
      description: `Playlist ${isPlaying ? 'durduruldu' : 'çalmaya başladı'}`,
    });
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
      audioUrl: firstSong.id, // YouTube video ID'sini audioUrl olarak ayarla
      aiHint: 'youtube',
      playlist: {
        id: playlist?.id,
        name: playlist?.name,
        songs: songsToPlay, // Shuffle edilmiş veya normal sıra
        currentIndex: 0
      }
    };

    window.dispatchEvent(new CustomEvent('playSong', { detail: songData }));

    toast({
      title: shuffle ? 'Karıştırılarak Çalıyor' : 'Playlist Çalıyor',
      description: `${firstSong.title} - ${firstSong.artist}`,
    });
  };

  const handleSongPlay = (songId: string) => {
    setCurrentSong(songId);
    setIsPlaying(true);
    const song = playlistSongs.find(s => s.id === songId);

    if (song) {
      // Playlist'teki şarkının index'ini bul
      const currentIndex = playlistSongs.findIndex(s => s.id === songId);

      // YouTube şarkısı için özel player event'i - playlist bilgisiyle birlikte
      const songData = {
        id: song.id, // Orijinal playlist ID'sini koru
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        imageUrl: song.imageUrl,
        audioUrl: song.id, // YouTube video ID'sini audioUrl olarak ayarla
        aiHint: 'youtube',
        // Playlist bilgileri ekle
        playlist: {
          id: playlist?.id,
          name: playlist?.name,
          songs: playlistSongs,
          currentIndex: currentIndex
        }
      };

      window.dispatchEvent(new CustomEvent('playSong', { detail: songData }));

      toast({
        title: 'Şimdi Çalıyor',
        description: `${song.title} - ${song.artist}`,
      });
    }
  };

  const handleAddSongs = () => {
    toast({
      title: 'Yakında',
      description: 'Şarkı ekleme özelliği yakında eklenecek.',
    });
  };

  const filteredSongs = playlistSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Playlist yükleniyor...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Music className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Playlist bulunamadı</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </div>

      {/* Playlist Info */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Avatar className="h-64 w-64 rounded-lg shadow-lg">
          <AvatarImage
            src={playlist.imageUrl}
            alt={playlist.name}
            className="object-cover"
          />
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

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={() => handlePlayPlaylist(false)}
              className="rounded-full h-14 w-14"
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePlayPlaylist(true)}
            >
              <Shuffle className="h-5 w-5 mr-2" />
              Karıştır
            </Button>

            {playlist.id.startsWith('imported_') && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleEditPlaylist}
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Düzenle
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash className="h-5 w-5 mr-2" />
                  Sil
                </Button>
              </>
            )}

            <Button variant="ghost" size="lg">
              <Heart className={`h-5 w-5 ${playlist.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>

            <Button variant="ghost" size="lg">
              <Download className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="lg">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Add Songs */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Playlist'te ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={handleAddSongs}>
          <Plus className="h-4 w-4 mr-2" />
          Şarkı Ekle
        </Button>
      </div>

      {/* Songs List */}
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
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'Şarkı bulunamadı' : 'Henüz şarkı yok'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? 'Arama kriterlerinize uygun şarkı bulunamadı'
                  : 'Bu playlist\'e şarkı ekleyerek başlayın'
                }
              </p>
              {!searchQuery && (
                <Button onClick={handleAddSongs}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Şarkıyı Ekle
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-4 text-sm text-muted-foreground font-medium">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Başlık</div>
                <div className="col-span-3">Albüm</div>
                <div className="col-span-1">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Songs */}
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className={`grid grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors group cursor-pointer ${currentSong === song.id ? 'bg-accent' : ''
                    }`}
                  onClick={() => handleSongPlay(song.id)}
                  onContextMenu={(e) => handleContextMenu(e, song)}
                >
                  <div className="col-span-1 flex items-center">
                    <span className="text-muted-foreground group-hover:hidden">
                      {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden group-hover:flex h-8 w-8 p-0"
                    >
                      {currentSong === song.id && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="col-span-6 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={song.imageUrl} alt={song.title} />
                      <AvatarFallback>
                        <Music className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${currentSong === song.id ? 'text-primary' : ''
                        }`}>
                        {song.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {song.album}
                    </p>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Heart className={`h-4 w-4 ${song.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <span className="text-sm text-muted-foreground group-hover:hidden">
                      {song.duration}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden group-hover:flex h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {contextMenu && (
        <SongContextMenu
          song={contextMenu.song}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Playlisti Düzenle</DialogTitle>
            <DialogDescription>
              Playlist bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">İsim</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Kapak Resmi URL</Label>
              <Input
                id="imageUrl"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSavePlaylist} disabled={isSaving}>
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Playlisti Sil</DialogTitle>
            <DialogDescription>
              Bu playlisti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeletePlaylist} disabled={isDeleting}>
              {isDeleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}