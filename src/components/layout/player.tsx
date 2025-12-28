"use client";

import Image from "next/image";
import dynamic from 'next/dynamic';

const YouTubePlayer = dynamic(() => import('@/components/youtube-player').then(mod => ({ default: mod.YouTubePlayer })), {
  ssr: false,
  loading: () => null
});
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, ListMusic, Volume2, X, Heart, Shuffle, Repeat, Home, User, Library } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Song } from "@/lib/data";
import { Signal, SignalLow } from "lucide-react";

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

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong.id !== '0') {
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
        setIsYouTube(Boolean(song.audioUrl && !song.audioUrl.startsWith('http')));

        // Player state'ini localStorage'da sakla
        localStorage.setItem('current-song', JSON.stringify(song));
        localStorage.setItem('is-playing', 'true');
        localStorage.setItem('is-youtube', Boolean(song.audioUrl && !song.audioUrl.startsWith('http')).toString());


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
          setQueue(filtered.slice(0, 10));
          setCurrentIndex(0);
          localStorage.setItem('current-queue', JSON.stringify(filtered.slice(0, 10)));
          localStorage.setItem('current-index', '0');
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

    window.addEventListener('playSong', handlePlaySong);
    return () => {
      window.removeEventListener('playSong', handlePlaySong);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentSong, queue, currentIndex]);

  useEffect(() => {
    if (isYouTube && playerRef.current) {
      const playerState = playerRef.current.getPlayerState();
      if (isPlaying && playerState !== 1) {
        playerRef.current.playVideo();
      } else if (!isPlaying && playerState === 1) {
        playerRef.current.pauseVideo();
      }
    } else if (audioRef.current && currentSong.audioUrl) {
      if (isPlaying) {
        audioRef.current.src = currentSong.audioUrl;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, isYouTube]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(100); // Maksimum ses
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.playVideo();
      }
    }, 100);
  };

  const onPlayerStateChange = (event: any) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (event.data === 1) { // Playing
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 1000);
    } else if (event.data === 2) { // Paused
      setIsPlaying(false);
    } else if (event.data === 0) { // Ended
      handleSongEnd();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSongEnd = () => {
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
        audioRef.current.play();
      }
    } else {
      // Always play next song (queue will loop automatically)
      playNext();
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (isYouTube && playerRef.current) {
      playerRef.current.seekTo(value[0], true);
      setProgress(value[0]);
    } else if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = value[0];
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (isYouTube && playerRef.current) {
      playerRef.current.setVolume(newVolume);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const loadMoreSongs = async (currentSongTitle: string, currentArtist: string) => {
    try {
      const searchQuery = `${currentArtist} ${currentSongTitle.split(' ').slice(0, 2).join(' ')}`;
      const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        const newSongs = data.videos.slice(0, 10)
          .filter((video: any) => video.title && video.id && video.thumbnail)
          .map((video: any) => ({
            id: video.id,
            title: video.title,
            artist: currentArtist,
            album: '',
            duration: video.duration || '0:00',
            imageUrl: video.thumbnail,
            audioUrl: video.id
          }));

        setQueue(prev => [...prev, ...newSongs]);
        return newSongs;
      }
    } catch (error) {
      console.error('Yeni şarkılar yüklenemedi:', error);
    }
    return [];
  };

  const playNext = async () => {
    if (queue.length === 0) return;

    if (isShuffling && queue.length > 1) {
      // Shuffle mode: play random song
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === currentIndex && queue.length > 1);

      const nextSong = queue[randomIndex];
      setCurrentSong(nextSong);
      setCurrentIndex(randomIndex);
      setIsPlaying(true);
      setIsYouTube(Boolean(nextSong.audioUrl && !nextSong.audioUrl.startsWith('http')));
    } else if (currentIndex < queue.length - 1) {
      // Normal mode: play next song
      const nextSong = queue[currentIndex + 1];
      setCurrentSong(nextSong);
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
      setIsYouTube(Boolean(nextSong.audioUrl && !nextSong.audioUrl.startsWith('http')));
    } else if (repeatMode === 'all' && queue.length > 0) {
      // Repeat all: go back to first song
      const firstSong = queue[0];
      setCurrentSong(firstSong);
      setCurrentIndex(0);
      setIsPlaying(true);
      setIsYouTube(Boolean(firstSong.audioUrl && !firstSong.audioUrl.startsWith('http')));
      localStorage.setItem('current-song', JSON.stringify(firstSong));
      localStorage.setItem('current-index', '0');
    } else {
      // Stop playing when queue ends
      setIsPlaying(false);
      localStorage.setItem('is-playing', 'false');
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      setCurrentSong(prevSong);
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
      setIsYouTube(Boolean(prevSong.audioUrl && !prevSong.audioUrl.startsWith('http')));
    } else if (repeatMode === 'all' && queue.length > 0) {
      // Go to last song
      const lastSong = queue[queue.length - 1];
      setCurrentSong(lastSong);
      setCurrentIndex(queue.length - 1);
      setIsPlaying(true);
      setIsYouTube(Boolean(lastSong.audioUrl && !lastSong.audioUrl.startsWith('http')));
    }
  };

  const togglePlay = () => {
    if (!currentSong.audioUrl) return;

    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    localStorage.setItem('is-playing', newIsPlaying.toString());

    if (isYouTube && playerRef.current) {
      if (newIsPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <Image
            src={currentSong.imageUrl}
            alt={currentSong.title}
            width={56}
            height={56}
            className="rounded-xl shadow-lg"
          />
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
        <div className="flex items-center w-full px-4 py-3">
          <Image
            src={currentSong.imageUrl}
            alt={currentSong.title}
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="flex-1 mx-3 min-w-0">
            <p className="font-semibold text-sm truncate text-white">{currentSong.title}</p>
            <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-white hover:text-purple-400 transition-colors shrink-0"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDataSaver}
            className={cn("ml-1 text-white hover:text-green-400 transition-colors shrink-0", isDataSaver && "text-green-400")}
          >
            {isDataSaver ? <SignalLow className="h-5 w-5" /> : <Signal className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="w-full grid grid-cols-3 items-center border-t border-white/10">
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
