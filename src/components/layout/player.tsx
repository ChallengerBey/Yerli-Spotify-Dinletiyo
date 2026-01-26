"use client";

import Image from "next/image";
import dynamic from 'next/dynamic';

const YouTubePlayer = dynamic(() => import('@/components/youtube-player').then(mod => ({ default: mod.YouTubePlayer })), {
  ssr: false,
  loading: () => null
});
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, ListMusic, Volume2, X, Heart, Shuffle, Repeat, Home, User, Library, Music } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Song } from "@/lib/data";
import { Signal, SignalLow, Radio, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

const safeJsonParse = (key: string, fallback: any) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error parsing ${key} from localStorage:`, e);
    return fallback;
  }
};

const mobileNavLinks = [
  { href: "/home", label: "Ana Sayfa", icon: Home },
  { href: "/home/friends", label: "Yeni Biriyle Tanış", icon: Sparkles },
  { href: "/home/profile", label: "Profil", icon: User },
  { href: "/home/library", label: "Kitaplığın", icon: Library },
];

const placeholderSong: Song = {
  id: '0',
  title: 'Şarkı Seçilmedi',
  artist: 'Dinletiyo',
  album: '',
  duration: '0:00',
  imageUrl: 'https://placehold.co/64x64.png',
  audioUrl: '',
  aiHint: 'album cover'
}

type RepeatMode = 'off' | 'one' | 'all';

export function Player() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song>(placeholderSong);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isYouTube, setIsYouTube] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(false);
  const [isHosting, setIsHosting] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeVolume, setFadeVolume] = useState(100);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isRoomHost, setIsRoomHost] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Component mount kontrolü
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fade in/out fonksiyonları
  const fadeOut = (callback?: () => void) => {
    if (!mounted) {
      if (callback) callback();
      return;
    }
    
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    
    let currentVol = fadeVolume;
    fadeIntervalRef.current = setInterval(() => {
      currentVol -= 10;
      if (currentVol <= 0) {
        currentVol = 0;
        setFadeVolume(0);
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        if (callback) callback();
      } else {
        setFadeVolume(currentVol);
      }
      
      // Ses seviyesini güvenli şekilde uygula
      try {
        if (isYouTube && playerRef.current && typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume((currentVol * volume) / 100);
        } else if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.volume = (currentVol * volume) / 10000;
        }
      } catch (error) {
        console.warn('Fade out volume error:', error);
      }
    }, 50);
  };

  const fadeIn = () => {
    if (!mounted) return;
    
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    
    let currentVol = 0;
    setFadeVolume(0);
    
    // İlk başta ses seviyesini güvenli şekilde 0'a ayarla
    try {
      if (isYouTube && playerRef.current && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(0);
      } else if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    } catch (error) {
      console.warn('Fade in initial volume error:', error);
    }
    
    fadeIntervalRef.current = setInterval(() => {
      currentVol += 10;
      if (currentVol >= 100) {
        currentVol = 100;
        setFadeVolume(100);
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        setFadeVolume(currentVol);
      }
      
      // Ses seviyesini güvenli şekilde kademeli artır
      try {
        if (isYouTube && playerRef.current && typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume((currentVol * volume) / 100);
        } else if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.volume = (currentVol * volume) / 10000;
        }
      } catch (error) {
        console.warn('Fade in volume error:', error);
      }
    }, 50);
  };

  const getAccessToken = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  };

  useEffect(() => {
    const syncRoomStateFromStorage = () => {
      const roomId = typeof window !== 'undefined' ? localStorage.getItem('active-room-id') : null;
      const isHost = typeof window !== 'undefined' ? localStorage.getItem('active-room-is-host') : null;

      setActiveRoomId(roomId || null);
      setIsRoomHost(isHost === 'true');
    };

    syncRoomStateFromStorage();
    window.addEventListener('activeRoomChanged', syncRoomStateFromStorage);
    return () => window.removeEventListener('activeRoomChanged', syncRoomStateFromStorage);
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong.id !== '0' && currentSong.imageUrl) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: [
          { src: currentSong.imageUrl, sizes: '96x96', type: 'image/png' },
          { src: currentSong.imageUrl, sizes: '128x128', type: 'image/png' },
          { src: currentSong.imageUrl, sizes: '192x192', type: 'image/png' },
          { src: currentSong.imageUrl, sizes: '256x256', type: 'image/png' },
          { src: currentSong.imageUrl, sizes: '384x384', type: 'image/png' },
          { src: currentSong.imageUrl, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        if (isYouTube && playerRef.current) playerRef.current.playVideo();
        else if (audioRef.current) audioRef.current.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        if (isYouTube && playerRef.current) playerRef.current.pauseVideo();
        else if (audioRef.current) audioRef.current.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }, [currentSong, isYouTube]);

  useEffect(() => {
    const handlePlaySong = async (event: Event) => {
      const customEvent = event as CustomEvent<Song & { playlist?: Song[] }>;
      const song = customEvent.detail;
      const playlistSongs = (customEvent.detail as any).playlist;

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (currentSong?.id === song.id) {
        setIsPlaying(prev => !prev);
      } else {
        // Fade out mevcut şarkı
        fadeOut(() => {
          // Mevcut şarkıyı durdur
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          if (playerRef.current) {
            playerRef.current.stopVideo();
          }

          setProgress(0);
          setDuration(0);
          setCurrentSong(song);
          setIsPlaying(true);
          setIsYouTube(Boolean(song.audioUrl && !song.audioUrl.startsWith('http') && song.aiHint !== 'podcast episode'));

          // Player state'ini localStorage'da sakla
          localStorage.setItem('current-song', JSON.stringify(song));
          localStorage.setItem('is-playing', 'true');
          localStorage.setItem('is-youtube', Boolean(song.audioUrl && !song.audioUrl.startsWith('http')).toString());

          // Yeni şarkı başladığında fade in
          setTimeout(() => {
            fadeIn();
          }, 300);
        });

        // Now playing'i veritabanına kaydet
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            const response = await fetch('/api/now-playing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userData.id,
                song: song,
                progress: 0,
                duration: 0,
                isPlaying: true
              })
            });
            
            if (!response.ok) {
              console.warn('Now playing update failed:', response.status);
            }
          } catch (err) {
            console.error('Now playing update error:', err);
          }
        }

        const recentlyPlayed = safeJsonParse('recently-played', []);
        const filtered = recentlyPlayed.filter((item: any) => item.id !== song.id);
        filtered.unshift(song);
        localStorage.setItem('recently-played', JSON.stringify(filtered.slice(0, 20)));

        if (playlistSongs && Array.isArray(playlistSongs)) {
          setQueue(playlistSongs);
          const songIndex = playlistSongs.findIndex(s => s.id === song.id);
          setCurrentIndex(songIndex >= 0 ? songIndex : 0);
          // Queue'yu localStorage'da sakla
          localStorage.setItem('current-queue', JSON.stringify(playlistSongs));
          localStorage.setItem('current-index', (songIndex >= 0 ? songIndex : 0).toString());
        } else {
          // Otomatik playlist oluştur
          createAutoPlaylist(song);
        }

        try {
          const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
          if (currentUser) {
            try {
              const userData = JSON.parse(currentUser);
              await fetch('/api/user-data/recently-played', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id, song: song }),
              });
            } catch (e) { console.error('Error parsing user data:', e); }
          }
        } catch (error) {
          console.error('Son çalınan şarkı sunucuya kaydedilemedi:', error);
        }
      }
    };

    const handleJoinSession = async (event: any) => {
      const { hostId } = event.detail;
      const { data: session } = await supabase
        .from('listening_sessions')
        .select('*')
        .eq('host_id', hostId)
        .single();

      if (session) {
        setActiveSession(session);
        setIsHosting(false);
        setCurrentSong(session.song_data);
        setIsPlaying(session.is_playing);
        setIsYouTube(Boolean(session.song_data.audioUrl && !session.song_data.audioUrl.startsWith('http')));

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        if (isYouTube && playerRef.current) {
          playerRef.current.seekTo(session.progress_ms / 1000, true);
        } else if (audioRef.current) {
          audioRef.current.currentTime = session.progress_ms / 1000;
        }
      }
    };

    const handleTogglePlay = () => {
      togglePlay();
    };

    const handlePlayerSetVolume = (event: any) => {
      const newVolume = Math.round(event.detail * 100);
      setVolume(newVolume);
      localStorage.setItem('volume', newVolume.toString());
      
      try {
        if (isYouTube && playerRef.current && typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(newVolume);
        } else if (audioRef.current) {
          audioRef.current.volume = newVolume / 100;
        }
      } catch (error) {
        console.warn('Set volume error:', error);
      }
    };

    const handlePlayerToggleMute = () => {
      const newVolume = volume > 0 ? 0 : 50; // Mute ise 50'ye, değilse 0'a ayarla
      setVolume(newVolume);
      localStorage.setItem('volume', newVolume.toString());
      
      try {
        if (isYouTube && playerRef.current && typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(newVolume);
        } else if (audioRef.current) {
          audioRef.current.volume = newVolume / 100;
        }
      } catch (error) {
        console.warn('Toggle mute error:', error);
      }
    };

    const handleSeekTo = (event: any) => {
      const seekTime = event.detail;
      if (!isNaN(seekTime)) {
        try {
          if (isYouTube && playerRef.current && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(seekTime, true);
            setProgress(seekTime);
          } else if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
            setProgress(seekTime);
          }
        } catch (error) {
          console.warn('Seek error:', error);
        }
      }
    };

    window.addEventListener('playSong', handlePlaySong);
    window.addEventListener('joinSession', handleJoinSession);
    window.addEventListener('togglePlay', handleTogglePlay);
    window.addEventListener('playerSetVolume', handlePlayerSetVolume);
    window.addEventListener('playerToggleMute', handlePlayerToggleMute);
    window.addEventListener('seekTo', handleSeekTo);
    
    return () => {
      window.removeEventListener('playSong', handlePlaySong);
      window.removeEventListener('joinSession', handleJoinSession);
      window.removeEventListener('togglePlay', handleTogglePlay);
      window.removeEventListener('playerSetVolume', handlePlayerSetVolume);
      window.removeEventListener('playerToggleMute', handlePlayerToggleMute);
      window.removeEventListener('seekTo', handleSeekTo);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [currentSong, queue, currentIndex]);

  useEffect(() => {
    if (!mounted) return;
    
    if (isYouTube && playerRef.current) {
      const playerState = playerRef.current.getPlayerState();
      if (isPlaying && playerState !== 1) {
        playerRef.current.playVideo();
        // Yeni şarkı başlarken fade in başlat
        if (fadeVolume === 0) {
          setTimeout(() => fadeIn(), 200);
        }
      } else if (!isPlaying && playerState === 1) {
        playerRef.current.pauseVideo();
      }
    } else if (audioRef.current && currentSong.audioUrl && currentSong.audioUrl.startsWith('http')) {
      if (isPlaying) {
        try {
          if (audioRef.current.src !== currentSong.audioUrl) {
            audioRef.current.src = currentSong.audioUrl;
          }
          // Ses seviyesini başlangıçta 0'a ayarla
          audioRef.current.volume = 0;
          audioRef.current.play().then(() => {
            // Çalmaya başladıktan sonra fade in başlat
            if (fadeVolume === 0) {
              setTimeout(() => fadeIn(), 200);
            }
          }).catch(e => {
            console.warn("Audio play failed:", e.message);
            // Kullanıcı etkileşimi gerekiyor, pause yap
            setIsPlaying(false);
          });
        } catch (error) {
          console.warn("Audio src assignment failed:", error);
          setIsPlaying(false);
        }
      } else {
        try {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        } catch (error) {
          console.warn("Audio pause failed:", error);
        }
      }
    }
  }, [isPlaying, currentSong, isYouTube, mounted]);

  // Real-time Session Logic
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (!activeSession) return;

    const channel = supabase
      .channel(`session:${activeSession.host_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'listening_sessions',
        filter: `host_id=eq.${activeSession.host_id}`
      }, (payload) => {
        const newSession = payload.new as any;
        if (newSession.song_id !== currentSong.id) {
          setCurrentSong(newSession.song_data);
          setIsYouTube(Boolean(newSession.song_data.audioUrl && !newSession.song_data.audioUrl.startsWith('http') && newSession.song_data.aiHint !== 'podcast episode'));
        }
        setIsPlaying(newSession.is_playing);

        const timeDiff = Math.abs((newSession.progress_ms / 1000) - progress);
        if (timeDiff > 2) {
          if (isYouTube && playerRef.current) {
            playerRef.current.seekTo(newSession.progress_ms / 1000, true);
          } else if (audioRef.current) {
            audioRef.current.currentTime = newSession.progress_ms / 1000;
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession, currentSong, progress, isYouTube]);

  // Host update interval
  useEffect(() => {
    if (!isHosting || !currentUser || currentSong.id === '0') return;

    const interval = setInterval(async () => {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: currentUser.id,
          songId: currentSong.id,
          songData: currentSong,
          isPlaying: isPlaying,
          progressMs: Math.floor(progress * 1000)
        })
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isHosting, currentUser, currentSong, isPlaying, progress]);

  useEffect(() => {
    if (!activeRoomId || !isRoomHost) return;
    if (currentSong.id === '0') return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      
      try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch('/api/rooms', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            room_id: activeRoomId,
            current_song_id: currentSong.id,
            current_song_data: currentSong,
            is_playing: isPlaying,
            progress_ms: Math.floor(progress * 1000),
          }),
        });

        // If room update fails, clear room state
        if (!response.ok) {
          console.warn('Room update failed, clearing room state');
          setActiveRoomId(null);
          setIsRoomHost(false);
          localStorage.removeItem('active-room-id');
          localStorage.removeItem('active-room-is-host');
        }
      } catch (error) {
        console.error('Room update error:', error);
        // Clear room state on persistent errors
        setActiveRoomId(null);
        setIsRoomHost(false);
        localStorage.removeItem('active-room-id');
        localStorage.removeItem('active-room-is-host');
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeRoomId, isRoomHost, currentSong, isPlaying, progress]);

  useEffect(() => {
    if (!activeRoomId || isRoomHost) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;

      const token = await getAccessToken();
      const headers: any = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await fetch(`/api/rooms?id=${encodeURIComponent(activeRoomId)}`, {
        headers,
      });

      if (!res.ok) return;

      const data = await res.json();
      const room = data?.room;
      if (!room) return;

      const song = room.current_song_data;
      if (!song || !song.id) return;

      if (song.id !== currentSong.id) {
        window.dispatchEvent(new CustomEvent('playSong', { detail: song }));
      }

      if (typeof room.is_playing === 'boolean') {
        setIsPlaying(room.is_playing);
      }

      const remoteProgress = typeof room.progress_ms === 'number' ? room.progress_ms / 1000 : null;
      if (remoteProgress !== null) {
        const diff = Math.abs(remoteProgress - progress);
        if (diff > 2) {
          setProgress(remoteProgress);
          if (isYouTube && playerRef.current) {
            playerRef.current.seekTo(remoteProgress, true);
          } else if (audioRef.current) {
            audioRef.current.currentTime = remoteProgress;
          }
        }
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeRoomId, isRoomHost, currentSong.id, progress, isYouTube]);

  const toggleHosting = () => {
    if (!isHosting && currentUser) {
      setIsHosting(true);
      setActiveSession(null);
    } else {
      setIsHosting(false);
      if (currentUser) {
        fetch(`/api/session?hostId=${currentUser.id}`, { method: 'DELETE' });
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onPlayerReady = (event: any) => {
    try {
      playerRef.current = event.target;
      if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
        // Başlangıçta ses seviyesini 0'a ayarla
        playerRef.current.setVolume(0);
      }
      setTimeout(() => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
          // Çalmaya başladıktan sonra fade in başlat
          setTimeout(() => fadeIn(), 300);
        }
      }, 100);
    } catch (error) {
      console.warn('YouTube player ready error:', error);
    }
  };

  const onPlayerStateChange = (event: any) => {
    try {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (event.data === 1) { // Playing
        setIsPlaying(true);
        if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
          const newDuration = playerRef.current.getDuration();
          setDuration(newDuration);
          localStorage.setItem('current-duration', newDuration.toString());
        }
        progressIntervalRef.current = setInterval(() => {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const newProgress = playerRef.current.getCurrentTime();
            setProgress(newProgress);
            
            // Mini player için progress güncelle
            localStorage.setItem('current-progress', newProgress.toString());
            
            // Progress event'ini gönder
            const progressEvent = new CustomEvent('progressUpdate', { 
              detail: { progress: newProgress, duration: duration } 
            });
            window.dispatchEvent(progressEvent);
          }
        }, 1000);
      } else if (event.data === 2) { // Paused
        setIsPlaying(false);
      } else if (event.data === 0) { // Ended
        handleSongEnd();
      }
    } catch (error) {
      console.warn('YouTube player state change error:', error);
    }
  };

  const handleTimeUpdate = () => {
    try {
      if (audioRef.current && !isNaN(audioRef.current.currentTime) && !isNaN(audioRef.current.duration)) {
        const newProgress = audioRef.current.currentTime;
        const newDuration = audioRef.current.duration;
        
        setProgress(newProgress);
        setDuration(newDuration);
        
        // Mini player için progress güncelle
        localStorage.setItem('current-progress', newProgress.toString());
        localStorage.setItem('current-duration', newDuration.toString());
        
        // Progress event'ini gönder
        const progressEvent = new CustomEvent('progressUpdate', { 
          detail: { progress: newProgress, duration: newDuration } 
        });
        window.dispatchEvent(progressEvent);
      }
    } catch (error) {
      console.warn("Time update error:", error);
    }
  };

  const handleSongEnd = async () => {
    if (repeatMode === 'one') {
      // Repeat current song
      setProgress(0);
      if (isYouTube && playerRef.current) {
        setTimeout(() => {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        }, 100);
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.warn("Auto-play failed:", e.message);
          setIsPlaying(false);
        });
      }
    } else {
      // Always play next song (queue will loop automatically or fetch new)
      await playNext();
    }
  };

  const handleProgressChange = (value: number[]) => {
    try {
      if (isYouTube && playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(value[0], true);
        setProgress(value[0]);
      } else if (audioRef.current && audioRef.current.duration) {
        audioRef.current.currentTime = value[0];
      }
    } catch (error) {
      console.warn('Progress change error:', error);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    try {
      const newVolume = value[0];
      setVolume(newVolume);
      
      // Fade volume'u dikkate alarak ses seviyesini ayarla
      const effectiveVolume = (newVolume * fadeVolume) / 100;
      
      if (isYouTube && playerRef.current && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(effectiveVolume);
      } else if (audioRef.current) {
        audioRef.current.volume = effectiveVolume / 100;
      }
    } catch (error) {
      console.warn('Volume change error:', error);
    }
  };

  // Otomatik playlist oluşturma fonksiyonu
  const createAutoPlaylist = async (song: Song) => {
    try {
      console.log('🎵 Otomatik playlist oluşturuluyor:', song.title, '-', song.artist);
      
      const cleanArtist = song.artist.replace(/[(\[].*?[)\]]/g, '').trim();
      
      // SADECE SANATÇI ADI İLE ARAMA YAP
      const searchQuery = cleanArtist;
      console.log('🔍 Arama yapılıyor:', searchQuery);
      
      let allSongs: Song[] = [song]; // İlk şarkıyı ekle
      
      try {
        const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (data.videos && data.videos.length > 0) {
          console.log(`📺 ${data.videos.length} video bulundu, filtreleniyor...`);
          
          const newSongs = data.videos
            .filter((v: any) => {
              const title = v.title.toLowerCase();
              const channel = v.channelTitle?.toLowerCase() || '';
              
              // ÇOCUK İÇERİKLERİNİ KESMEN ÇIKAR - ÇOK GÜÇLÜ FİLTRE
              const childKeywords = [
                'kids', 'children', 'baby', 'nursery', 'çocuk', 'bebek', 'çocuklar',
                'kiboomers', 'super simple', 'freeze dance', 'floor is lava',
                'preschool', 'kindergarten', 'toddler', 'cartoon', 'animation',
                'lullaby', 'ninni', 'songs for kids', 'kids songs', 'children songs',
                'bye bye goodbye', 'goodbye song', 'hello song', 'abc song',
                'wheels on the bus', 'twinkle twinkle', 'old macdonald',
                'if you\'re happy', 'head shoulders', 'itsy bitsy spider',
                'bingo song', 'mary had a little lamb', 'london bridge',
                'row row row your boat', 'hickory dickory dock', 'humpty dumpty',
                'jack and jill', 'little bo peep', 'rock a bye baby',
                'educational', 'eğitici', 'öğretici', 'learning', 'öğrenme',
                'cocomelon', 'little baby bum', 'dave and ava', 'bounce patrol',
                'simple songs', 'nursery rhymes', 'tekerlemeler', 'masal',
                'fairy tale', 'story', 'hikaye', 'masallar', 'çizgi film'
              ];
              
              const hasChildContent = childKeywords.some(keyword => 
                title.includes(keyword) || channel.includes(keyword)
              );
              
              // EĞİTİM İÇERİKLERİNİ ÇIKAR
              const educationKeywords = [
                'learn', 'tutorial', 'lesson', 'alphabet', 'numbers', 'colors',
                'öğren', 'ders', 'eğitim', 'öğretim', 'kurs', 'nasıl yapılır',
                'how to', 'guide', 'rehber', 'anlatım'
              ];
              
              const hasEducationContent = educationKeywords.some(keyword => 
                title.includes(keyword) || channel.includes(keyword)
              );
              
              // SANATÇI ADI KONTROLÜ - MUTLAKA OLMALI
              const artistInTitle = title.includes(cleanArtist.toLowerCase());
              const artistInChannel = channel.includes(cleanArtist.toLowerCase());
              
              // SÜRE KONTROLÜ - Çok kısa videolar çıkar
              const duration = v.duration || '';
              const tooShort = duration.startsWith('0:0') || duration.startsWith('0:1');
              
              // DUPLICATE KONTROLÜ
              const alreadyExists = allSongs.some(existing => existing.id === v.id);
              
              // KANAL ADI KONTROLÜ - Çocuk kanallarını çıkar
              const childChannels = [
                'kiboomers', 'super simple', 'cocomelon', 'little baby bum',
                'dave and ava', 'bounce patrol', 'kids tv', 'nursery rhymes',
                'children', 'kids', 'baby', 'toddler', 'preschool'
              ];
              
              const isChildChannel = childChannels.some(childCh => 
                channel.includes(childCh)
              );
              
              const isValid = !hasChildContent && 
                             !hasEducationContent && 
                             !isChildChannel &&
                             (artistInTitle || artistInChannel) && 
                             !tooShort && 
                             !alreadyExists;
              
              if (isValid) {
                console.log('✅ Geçerli:', v.title);
              } else {
                console.log('❌ Filtrelendi:', v.title, 
                  hasChildContent ? '[ÇOCUK]' : '',
                  hasEducationContent ? '[EĞİTİM]' : '',
                  isChildChannel ? '[ÇOCUK KANAL]' : '',
                  !artistInTitle && !artistInChannel ? '[SANATÇI YOK]' : '',
                  tooShort ? '[KISA]' : '',
                  alreadyExists ? '[DUPLICATE]' : ''
                );
              }
              
              return isValid;
            })
            .slice(0, 15) // İlk 15 geçerli şarkı
            .map((video: any) => ({
              id: video.id,
              title: video.title,
              artist: cleanArtist,
              album: '',
              duration: video.duration || '0:00',
              imageUrl: video.thumbnail,
              audioUrl: video.id,
              aiHint: 'song'
            }));
          
          allSongs = [...allSongs, ...newSongs];
          console.log(`✅ ${newSongs.length} şarkı eklendi`);
        }
      } catch (error) {
        console.error('❌ Arama hatası:', error);
      }
      
      // Eğer yeterli şarkı yoksa recently played ekle
      if (allSongs.length < 5) {
        console.log('📝 Yeterli şarkı yok, recently played ekleniyor...');
        const recentlyPlayed = safeJsonParse('recently-played', []);
        const recentSongs = recentlyPlayed
          .filter((recent: any) => recent.id !== song.id)
          .slice(0, 10);
        allSongs = [...allSongs, ...recentSongs];
      }
      
      // İlk şarkı sabit, diğerleri karışık
      const firstSong = allSongs[0];
      const restSongs = allSongs.slice(1);
      const shuffledRest = restSongs.sort(() => Math.random() - 0.5);
      const finalPlaylist = [firstSong, ...shuffledRest].slice(0, 20);
      
      console.log(`🎵 PLAYLIST OLUŞTURULDU: ${finalPlaylist.length} şarkı`);
      finalPlaylist.forEach((s, i) => {
        console.log(`${i + 1}. ${s.title} - ${s.artist}`);
      });
      
      // Queue'yu güncelle
      setQueue(finalPlaylist);
      setCurrentIndex(0);
      localStorage.setItem('current-queue', JSON.stringify(finalPlaylist));
      localStorage.setItem('current-index', '0');
      
    } catch (error) {
      console.error('❌ Playlist oluşturma hatası:', error);
      
      // Hata durumunda basit fallback
      const recentlyPlayed = safeJsonParse('recently-played', []);
      const fallbackQueue = [song, ...recentlyPlayed.slice(0, 9)];
      setQueue(fallbackQueue);
      setCurrentIndex(0);
      localStorage.setItem('current-queue', JSON.stringify(fallbackQueue));
      localStorage.setItem('current-index', '0');
    }
  };

  const loadMoreSongs = async (currentSongTitle: string, currentArtist: string) => {
    try {
      setIsTransitioning(true);
      const cleanTitle = currentSongTitle.replace(/[(\[].*?[)\]]/g, '').trim();
      const cleanArtist = currentArtist.replace(/[(\[].*?[)\]]/g, '').trim();
      
      // Türkçe rap sanatçılarını tespit et
      const turkishRapArtists = ['ceza', 'sagopa', 'ezhel', 'khontkar', 'ben fero', 'reynmen', 'murda', 'uzi', 'norm ender', 'joker', 'defkhan', 'anıl piyancı', 'şehinşah', 'allame'];
      const isTurkishRap = turkishRapArtists.some(artist => 
        cleanArtist.toLowerCase().includes(artist) || 
        cleanTitle.toLowerCase().includes(artist)
      );
      
      let searchQuery = '';
      let response, data;
      
      if (isTurkishRap) {
        // Türkçe rap için özel arama
        const rapKeywords = ['türkçe rap', 'turkish rap', 'rap türkçe', cleanArtist];
        searchQuery = rapKeywords[Math.floor(Math.random() * rapKeywords.length)];
      } else {
        // Normal arama - önce aynı sanatçı
        searchQuery = cleanArtist;
      }
      
      response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(searchQuery)}`);
      data = await response.json();
      
      // Eğer yeterli sonuç yoksa alternatif arama
      if (!data.videos || data.videos.length < 5) {
        if (isTurkishRap) {
          searchQuery = 'türkçe rap 2024';
        } else {
          searchQuery = `${cleanArtist} ${cleanTitle.split(' ').slice(0, 2).join(' ')}`;
        }
        response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(searchQuery)}`);
        data = await response.json();
      }

      if (data.videos && data.videos.length > 0) {
        // Sonuçları filtrele - istenmeyen içerikleri çıkar
        const filteredVideos = data.videos.filter((v: any) => {
          const title = v.title.toLowerCase();
          const channel = v.channelTitle?.toLowerCase() || '';
          
          // ÇOCUK İÇERİKLERİNİ KESMEN ÇIKAR - ÇOK GÜÇLÜ FİLTRE
          const childKeywords = [
            'kids', 'children', 'baby', 'nursery', 'çocuk', 'bebek', 'çocuklar',
            'kiboomers', 'super simple', 'freeze dance', 'floor is lava',
            'preschool', 'kindergarten', 'toddler', 'cartoon', 'animation',
            'lullaby', 'ninni', 'songs for kids', 'kids songs', 'children songs',
            'bye bye goodbye', 'goodbye song', 'hello song', 'abc song',
            'wheels on the bus', 'twinkle twinkle', 'old macdonald',
            'if you\'re happy', 'head shoulders', 'itsy bitsy spider',
            'bingo song', 'mary had a little lamb', 'london bridge',
            'row row row your boat', 'hickory dickory dock', 'humpty dumpty',
            'jack and jill', 'little bo peep', 'rock a bye baby',
            'educational', 'eğitici', 'öğretici', 'learning', 'öğrenme',
            'cocomelon', 'little baby bum', 'dave and ava', 'bounce patrol',
            'simple songs', 'nursery rhymes', 'tekerlemeler', 'masal',
            'fairy tale', 'story', 'hikaye', 'masallar', 'çizgi film'
          ];
          
          const hasChildContent = childKeywords.some(keyword => 
            title.includes(keyword) || channel.includes(keyword)
          );
          
          // KANAL ADI KONTROLÜ - Çocuk kanallarını çıkar
          const childChannels = [
            'kiboomers', 'super simple', 'cocomelon', 'little baby bum',
            'dave and ava', 'bounce patrol', 'kids tv', 'nursery rhymes',
            'children', 'kids', 'baby', 'toddler', 'preschool'
          ];
          
          const isChildChannel = childChannels.some(childCh => 
            channel.includes(childCh)
          );
          
          const badKeywords = [
            'youtube music', 'descubre', 'discover', 'playlist', 'mix',
            'live with orchestra', 'orchestra', 'classical', 'klasik',
            'piano', 'piyano', 'instrumental', 'enstrümantal',
            'mariage d\'amour', 'wedding', 'düğün', 'romantic', 'romantik',
            'ambient', 'meditation', 'meditasyon', 'relaxing', 'rahatlatıcı'
          ];
          
          const hasBadKeyword = badKeywords.some(keyword => 
            title.includes(keyword) || channel.includes(keyword)
          );
          
          return !hasChildContent && !isChildChannel && !hasBadKeyword && v.id !== currentSong.id;
        });

        const newSongs = filteredVideos.slice(0, 10)
          .map((video: any) => ({
            id: video.id,
            title: video.title,
            artist: video.channelTitle || currentArtist,
            album: '',
            duration: video.duration || '0:00',
            imageUrl: video.thumbnail,
            audioUrl: video.id
          }));

        if (newSongs.length > 0) {
          setQueue(prev => {
            const updated = [...prev, ...newSongs];
            localStorage.setItem('current-queue', JSON.stringify(updated));
            return updated;
          });
          return newSongs;
        }
      }
    } catch (error) {
      console.error('Yeni şarkılar yüklenemedi:', error);
    } finally {
      setIsTransitioning(false);
    }
    return [];
  };

  const playNext = async () => {
    if (isTransitioning || !mounted) return;

    console.log('⏭️ Sonraki şarkıya geçiliyor...');
    
    try {
      // Fade out mevcut şarkı
      fadeOut(async () => {
        try {
          // Önce queue'dan sonraki şarkıyı çal
          if (currentIndex < queue.length - 1) {
            const nextSong = queue[currentIndex + 1];
            console.log('🎵 Queue\'dan sonraki şarkı:', nextSong.title);
            
            // Güvenli şarkı değişimi
            await changeSongSafely(nextSong, currentIndex + 1);
            return;
          }

          // Queue bittiyse başa dön
          if (repeatMode === 'all' && queue.length > 0) {
            const firstSong = queue[0];
            console.log('🔄 Queue başa döndü:', firstSong.title);
            
            await changeSongSafely(firstSong, 0);
            return;
          }

          // Son çare: yeni şarkılar yükle
          console.log('🔍 Yeni şarkılar aranıyor...');
          const newSongs = await loadMoreSongs(currentSong.title, currentSong.artist);
          if (newSongs.length > 0) {
            const nextSong = newSongs[0];
            console.log('✅ Yeni şarkı bulundu:', nextSong.title);
            
            // Queue'yu güncelle
            const updatedQueue = [...queue, ...newSongs];
            setQueue(updatedQueue);
            localStorage.setItem('current-queue', JSON.stringify(updatedQueue));
            
            await changeSongSafely(nextSong, queue.length);
          } else {
            console.log('❌ Yeni şarkı bulunamadı, çalma durduruluyor');
            setIsPlaying(false);
            localStorage.setItem('is-playing', 'false');
          }
        } catch (error) {
          console.error('❌ playNext içi hata:', error);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('❌ playNext ana hata:', error);
      setIsPlaying(false);
    }
  };

  // Güvenli şarkı değiştirme fonksiyonu
  const changeSongSafely = async (song: Song, index: number) => {
    try {
      // Audio elementini güvenli şekilde durdur
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }
      
      // YouTube player'ı durdur
      if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      }
      
      // State'leri güncelle
      setProgress(0);
      setDuration(0);
      setCurrentSong(song);
      setCurrentIndex(index);
      setIsPlaying(true);
      setIsYouTube(Boolean(song.audioUrl && !song.audioUrl.startsWith('http') && song.aiHint !== 'podcast episode'));
      
      // LocalStorage'ı güncelle
      localStorage.setItem('current-song', JSON.stringify(song));
      localStorage.setItem('current-index', index.toString());
      localStorage.setItem('is-playing', 'true');
      
      // Fade in başlat
      setTimeout(() => {
        if (mounted) {
          fadeIn();
        }
      }, 300);
      
    } catch (error) {
      console.error('❌ changeSongSafely hatası:', error);
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (!mounted) return;
    
    console.log('⏮️ Önceki şarkıya geçiliyor...');
    
    try {
      fadeOut(() => {
        try {
          if (currentIndex > 0) {
            const prevSong = queue[currentIndex - 1];
            console.log('🎵 Önceki şarkı:', prevSong.title);
            changeSongSafely(prevSong, currentIndex - 1);
          } else if (repeatMode === 'all' && queue.length > 0) {
            // Son şarkıya git
            const lastSong = queue[queue.length - 1];
            console.log('🔄 Son şarkıya geçiliyor:', lastSong.title);
            changeSongSafely(lastSong, queue.length - 1);
          }
        } catch (error) {
          console.error('❌ playPrevious içi hata:', error);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('❌ playPrevious ana hata:', error);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!mounted || !currentSong.audioUrl) return;

    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    localStorage.setItem('is-playing', newIsPlaying.toString());

    try {
      if (isYouTube && playerRef.current) {
        if (newIsPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    } catch (error) {
      console.warn("Toggle play error:", error);
    }
  };

  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
    localStorage.setItem('shuffle-mode', (!isShuffling).toString());
  };

  const toggleRepeat = () => {
    const newMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    setRepeatMode(newMode);
    localStorage.setItem('repeat-mode', newMode);
  };

  const toggleFavorite = async () => {
    const favorites = safeJsonParse('favorites', []);
    if (isFavorite) {
      const newFavorites = favorites.filter((fav: any) => fav.id !== currentSong.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      favorites.push(currentSong);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }

    window.dispatchEvent(new CustomEvent('favoriteChanged'));

    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          if (isFavorite) {
            await fetch(`/api/user-data/favorites?userId=${userData.id}&songId=${currentSong.id}`, {
              method: 'DELETE',
            });
          } else {
            await fetch('/api/user-data/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userData.id, song: currentSong }),
            });
          }
        } catch (e) {
          console.error('Error parsing user data in favorite toggle:', e);
        }
      }
    } catch (error) {
      console.error('Favori şarkı sunucuda güncellenemedi:', error);
    }
  };

  const closeSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (playerRef.current) {
      playerRef.current.stopVideo();
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setIsPlaying(false);
    setCurrentSong(placeholderSong);
    setIsYouTube(false);
    setProgress(0);
    setDuration(0);
  };

  // Check if current song is favorite
  useEffect(() => {
    if (currentSong.id !== '0') {
      const favorites = safeJsonParse('favorites', []);
      setIsFavorite(favorites.some((fav: any) => fav.id === currentSong.id));
    }
  }, [currentSong]);

  // Load saved settings
  useEffect(() => {
    const savedShuffle = localStorage.getItem('shuffle-mode');
    const savedRepeat = localStorage.getItem('repeat-mode');
    const savedDataSaver = localStorage.getItem('data-saver');

    if (savedShuffle) setIsShuffling(savedShuffle === 'true');
    if (savedRepeat) setRepeatMode(savedRepeat as RepeatMode);
    if (savedDataSaver) setIsDataSaver(savedDataSaver === 'true');
  }, []);

  const toggleDataSaver = () => {
    const newVal = !isDataSaver;
    setIsDataSaver(newVal);
    localStorage.setItem('data-saver', newVal.toString());

    // Update active player if exists
    if (isYouTube && playerRef.current) {
      playerRef.current.setPlaybackQuality(newVal ? 'small' : 'default');
    }
  };

  // Sayfa yüklenince player state'ini geri yükle
  useEffect(() => {
    if (!mounted) return;

    const savedSong = localStorage.getItem('current-song');
    const savedIsPlaying = localStorage.getItem('is-playing');
    const savedIsYouTube = localStorage.getItem('is-youtube');
    const savedQueue = localStorage.getItem('current-queue');
    const savedIndex = localStorage.getItem('current-index');

    if (savedSong && savedSong !== JSON.stringify(placeholderSong)) {
      const song = JSON.parse(savedSong);
      setCurrentSong(song);
      setIsYouTube(savedIsYouTube === 'true');

      // Queue'yu geri yükle
      if (savedQueue) {
        setQueue(JSON.parse(savedQueue));
      }
      if (savedIndex) {
        setCurrentIndex(parseInt(savedIndex));
      }

      // Eğer çalıyorsa, biraz bekleyip çalmaya başla
      if (savedIsPlaying === 'true') {
        setTimeout(() => {
          setIsPlaying(true);
        }, 500);
      }
    }
  }, [mounted]);



  if (!mounted || currentSong.id === '0') return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={handleSongEnd}
      />

      {isYouTube && mounted && (
        <YouTubePlayer
          videoId={currentSong.audioUrl}
          isPlaying={isPlaying}
          volume={volume}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          isDataSaver={isDataSaver}
        />
      )}

      {/* Desktop Player */}
      <footer className="hidden lg:flex items-center justify-between w-full glass-card border-t border-white/10 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-4 w-1/4">
          {currentSong.imageUrl ? (
            <Image
              src={currentSong.imageUrl}
              alt={currentSong.title}
              width={56}
              height={56}
              className="rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center">
              <Music className="w-6 h-6 text-gray-600" />
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{currentSong.title}</p>
            <p className="text-sm text-gray-400">{currentSong.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 w-1/2 max-w-xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className={cn("h-10 w-10 text-gray-400 hover:text-white transition-colors", isShuffling && "text-purple-400")}
            >
              <Shuffle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="h-10 w-10 text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12 rounded-full gradient-primary neon-glow hover:scale-105 transition-all duration-200"
            >
              {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 fill-white text-white ml-1" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              className="h-10 w-10 text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRepeat}
              className={cn("h-10 w-10 text-gray-400 hover:text-white transition-colors relative", repeatMode !== 'off' && "text-purple-400")}
            >
              <Repeat className="h-5 w-5" />
              {repeatMode === 'one' && (
                <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center font-bold">
                  1
                </span>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(progress)}</span>
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={duration || 100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-1/4 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn("text-gray-400 hover:text-white transition-colors", isFavorite && "text-red-500 hover:text-red-400")}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white transition-colors">
            <ListMusic className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleHosting}
            className={cn("text-gray-400 hover:text-white transition-colors", isHosting && "text-red-500 animate-pulse")}
            title={isHosting ? "Yayını Durdur" : "Beraber Dinle Başlat"}
          >
            <Radio className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDataSaver}
            className={cn("text-gray-400 hover:text-white transition-colors", isDataSaver && "text-green-400")}
            title={isDataSaver ? "Veri Tasarrufu Açık" : "Veri Tasarrufu Kapalı"}
          >
            {isDataSaver ? <SignalLow className="h-5 w-5" /> : <Signal className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 w-[120px]">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSong}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </footer>

      {/* Mobile Player & Nav */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 flex flex-col z-[9999] bg-black/80 backdrop-blur-xl safe-area-pb">
        <div className="flex items-center w-full px-3 py-3">
          {currentSong.imageUrl ? (
            <Image
              src={currentSong.imageUrl}
              alt={currentSong.title}
              width={36}
              height={36}
              className="rounded-lg"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
              <Music className="w-4 h-4 text-gray-600" />
            </div>
          )}
          <div className="flex-1 mx-2 min-w-0">
            <p className="font-semibold text-xs truncate text-white">{currentSong.title}</p>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
          
          {/* Şarkı Kontrolleri - Büyük ve Görünür */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="text-white hover:text-purple-400 transition-colors w-10 h-10 rounded-full bg-white/10 border border-white/20"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:text-purple-400 transition-colors w-12 h-12 rounded-full bg-primary/30 border-2 border-primary/50 mx-1"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              className="text-white hover:text-purple-400 transition-colors w-10 h-10 rounded-full bg-white/10 border border-white/20"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Diğer Kontroller */}
          <div className="flex items-center gap-1 ml-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleHosting}
              className={cn("text-white hover:text-red-400 transition-colors w-8 h-8", isHosting && "text-red-400")}
            >
              <Radio className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDataSaver}
              className={cn("text-white hover:text-green-400 transition-colors w-8 h-8", isDataSaver && "text-green-400")}
            >
              {isDataSaver ? <SignalLow className="h-4 w-4" /> : <Signal className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <nav className="w-full grid grid-cols-4 items-center border-t border-white/10">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 text-gray-400 hover:text-white transition-colors",
                pathname === link.href && "text-red-400 bg-white/5"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </nav>
      </footer>
    </>
  );
}
