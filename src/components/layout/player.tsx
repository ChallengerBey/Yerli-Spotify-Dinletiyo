"use client";

import Image from "next/image";
import dynamic from 'next/dynamic';

const YouTubePlayer = dynamic(() => import('@/components/youtube-player').then(mod => ({ default: mod.YouTubePlayer })), {
  ssr: false,
  loading: () => null
});
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, ListMusic, Volume2, X, Heart, Shuffle, Repeat, Home, User, Library, Music, Maximize2, ChevronUp, MoreHorizontal } from "lucide-react";
import { FullScreenPlayer } from "@/components/player/full-screen-player";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Song } from "@/lib/data";
import { detectSongLanguage, filterSongsByLanguage, SongLanguage } from '@/lib/language-utils';
import { Signal, SignalLow, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { analytics } from '@/lib/analytics';
import { libraryManager } from '@/lib/library-manager';
import { parseYouTubeMusicMeta } from "@/lib/youtube-metadata";

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
  { href: "/home/playlists", label: "Playlistler", icon: ListMusic },
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

const detectArtistGenre = (artistName: string): string | null => {
  const lowerName = artistName.toLowerCase();

  const genreMap: Record<string, string> = {
    // Hip Hop / Rap / Trap
    'kanye west': 'hip hop', 'drake': 'hip hop rnb', 'kendrick lamar': 'hip hop',
    'eminem': 'hip hop rap', 'travis scott': 'trap hip hop', 'j. cole': 'hip hop',
    'jay-z': 'hip hop', '2pac': '90s hip hop', 'notorious b.i.g.': '90s hip hop',
    '50 cent': 'hip hop', 'snoop dogg': 'west coast hip hop', 'dr. dre': 'west coast hip hop',
    'cardi b': 'trap pop', 'nicki minaj': 'pop rap', 'post malone': 'pop rap',
    'juice wrld': 'emo rap', 'xxxtentacion': 'emo rap', 'lil uzi vert': 'trap',
    'migos': 'trap', 'future': 'trap', 'young thug': 'trap', 'playboi carti': 'trap',
    'tyler, the creator': 'alternative hip hop', 'a$ap rocky': 'hip hop', 'mac miller': 'hip hop',
    'lil baby': 'trap', 'da baby': 'trap', 'rodmv': 'hip hop', 'gunna': 'trap',
    'metro boomin': 'trap logic', '21 savage': 'trap', 'lil durk': 'drill trap',
    'pop smoke': 'drill', 'central cee': 'uk drill', 'yeat': 'rage trap',

    // Pop / R&B
    'taylor swift': 'pop', 'ariana grande': 'pop rnb', 'justin bieber': 'pop rnb',
    'beyonce': 'rnb pop', 'rihanna': 'rnb pop', 'the weeknd': 'rnb synth pop',
    'dua lipa': 'disco pop', 'billie eilish': 'alternative pop', 'harry styles': 'pop rock',
    'adele': 'soul pop', 'bruno mars': 'funk rnb', 'ed sheeran': 'pop',
    'shawn mendes': 'pop', 'camila cabello': 'latin pop', 'shakira': 'latin pop',
    'katy perry': 'pop', 'lady gaga': 'pop dance', 'maroon 5': 'pop rock',
    'coldplay': 'rock pop', 'imagine dragons': 'pop rock', 'one republic': 'pop rock',
    'sia': 'pop', 'selena gomez': 'pop', 'miley cyrus': 'pop rock', 'sam smith': 'soul pop',
    'olivia rodrigo': 'pop rock', 'doja cat': 'pop rap', 'sza': 'rnb', 'frank ocean': 'rnb soul',
    'lana del rey': 'alternative pop', 'lord': 'alternative pop',

    // Rock / Metal
    'queen': 'classic rock', 'the beatles': 'classic rock', 'pink floyd': 'progressive rock',
    'led zeppelin': 'hard rock', 'ac/dc': 'hard rock', 'metallica': 'heavy metal',
    'guns n\' roses': 'hard rock', 'nirvana': 'grunge', 'linkin park': 'nu metal',
    'red hot chili peppers': 'funk rock', 'green day': 'punk rock', 'arctic monkeys': 'indie rock',
    'tame impala': 'psychedelic rock', 'radiohead': 'alternative rock', 'bon jovi': 'rock',
    'u2': 'rock', 'aeropsmith': 'rock', 'the rolling stones': 'classic rock', 'system of a down': 'metal',

    // Turkish
    'sezen aksu': 'türkçe pop', 'tarkan': 'türkçe pop', 'müslüm gürses': 'arabesk',
    'ahmet kaya': 'özgün müzik', 'ezhel': 'türkçe rap', 'ceza': 'türkçe rap',
    'sagopa kajmer': 'türkçe rap', 'duman': 'türkçe rock', 'manga': 'türkçe rock',
    'mor ve ötesi': 'türkçe rock', 'şebnem ferah': 'türkçe rock', 'teoman': 'türkçe rock',
    'mabel matiz': 'alternatif pop', 'haluk levent': 'anadolu rock', 'barış manço': 'anadolu rock',
    'cem karaca': 'anadolu rock', 'erkin koray': 'anadolu rock', 'zeynep bastık': 'akustik pop',
    'edis': 'türkçe pop', 'aleyna tilki': 'türkçe pop', 'gazapizm': 'türkçe rap',
    'khontkar': 'türkçe trap', 'ben fero': 'türkçe trap', 'uzi': 'türkçe drill',
    'sefo': 'türkçe pop rap', 'lvbel c5': 'türkçe drill', 'batuflex': 'türkçe drill',
    'cakal': 'türkçe drill', 'reckol': 'türkçe drill', 'motive': 'türkçe rap',
    'norm ender': 'türkçe rap', 'şanışer': 'türkçe rap', 'aspova': 'türkçe rnb',
    'patron': 'türkçe rap', 'hayki': 'türkçe rap', 'massaka': 'hardcore rap',
    'sena şener': 'alternatif rock', 'yüzyüzeyken konuşuruz': 'indie rock', 'adamlar': 'indie rock'
  };

  for (const [artist, genre] of Object.entries(genreMap)) {
    if (lowerName.includes(artist)) return genre;
  }

  if (lowerName.includes('lil ')) return 'hip hop trap';
  if (lowerName.includes('mc ')) return 'hip hop';
  if (lowerName.includes('dj ')) return 'dance house';

  return null;
}

export function Player() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song>(placeholderSong);
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);
  const [languagePreferences, setLanguagePreferences] = useState({
    preferredLanguage: 'auto' as SongLanguage,
    smartLanguageMode: true, // Varsayılan olarak açık
    mixLanguages: false
  });
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
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeVolume, setFadeVolume] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imgSrc, setImgSrc] = useState(currentSong.imageUrl);

  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionLockRef = useRef(false);
  const lastNavActionAtRef = useRef(0);
  const autoPlaylistRequestIdRef = useRef(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Component mount kontrolü
  useEffect(() => {
    setMounted(true);

    // Kullanıcı kontrolü - eğer kullanıcı yoksa player çalışmaz
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) {
      console.log('⚠️ Player: Kullanıcı bulunamadı, player devre dışı');
      return () => setMounted(false);
    } else {
      console.log('✅ Player: Kullanıcı bulundu, player aktif');
    }

    // Saved queue ve index'i yükle
    try {
      const savedQueue = localStorage.getItem('current-queue');
      const savedIndex = localStorage.getItem('current-index');
      const savedSong = localStorage.getItem('current-song');
      const savedIsPlaying = localStorage.getItem('is-playing');
      const savedVolume = localStorage.getItem('volume');

      if (savedQueue) {
        const parsedQueue = JSON.parse(savedQueue);
        setQueue(parsedQueue);
        console.log('📂 Queue yüklendi:', parsedQueue.length, 'şarkı');
      }

      if (savedIndex) {
        const parsedIndex = parseInt(savedIndex);
        setCurrentIndex(parsedIndex);
        console.log('📍 Index yüklendi:', parsedIndex);
      }

      if (savedSong) {
        const parsedSong = JSON.parse(savedSong);
        setCurrentSong(parsedSong);
        setIsYouTube(Boolean(parsedSong.audioUrl && !parsedSong.audioUrl.startsWith('http')));
        console.log('🎵 Şarkı yüklendi:', parsedSong.title);
      }

      if (savedIsPlaying) {
        setIsPlaying(savedIsPlaying === 'true');
      }

      if (savedVolume) {
        setVolume(parseInt(savedVolume));
      }

      // Progress ve Duration yükle
      const savedProgress = localStorage.getItem('current-progress');
      const savedDuration = localStorage.getItem('current-duration');
      if (savedProgress) setProgress(parseFloat(savedProgress));
      if (savedDuration) setDuration(parseFloat(savedDuration));


      // Dil tercihlerini yükle
      const savedLanguagePrefs = localStorage.getItem('language-preferences');
      if (savedLanguagePrefs) {
        try {
          const parsed = JSON.parse(savedLanguagePrefs);
          setLanguagePreferences(parsed);
          console.log('🌍 Dil tercihleri yüklendi:', parsed);
        } catch (error) {
          console.error('❌ Dil tercihleri yükleme hatası:', error);
        }
      } else {
        // Varsayılan dil tercihlerini ayarla ve kaydet
        const defaultPrefs = {
          preferredLanguage: 'auto' as SongLanguage,
          smartLanguageMode: true,
          mixLanguages: false
        };
        setLanguagePreferences(defaultPrefs);
        localStorage.setItem('language-preferences', JSON.stringify(defaultPrefs));
        console.log('🌍 Varsayılan dil tercihleri ayarlandı:', defaultPrefs);
      }
    } catch (error) {
      console.error('❌ Saved state yükleme hatası:', error);
    }

    return () => setMounted(false);
  }, []);

  // Full-screen açıkken route değişince "arkada açılma" olmasın
  useEffect(() => {
    const handler = () => setIsFullScreen(false);
    window.addEventListener("closeFullScreenPlayer", handler as any);
    return () => window.removeEventListener("closeFullScreenPlayer", handler as any);
  }, []);

  // Visibility change handler - başka sekmeye geçince de çalsın
  useEffect(() => {
    if (!mounted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Sekme gizlendi - müzik çalmaya devam ediyor');
      } else {
        console.log('👁️ Sekme görünür - player durumu kontrol ediliyor');
        
        // Sekme tekrar görünür olduğunda player durumunu senkronize et
        if (isYouTube && playerRef.current && isPlaying) {
          try {
            const playerState = playerRef.current.getPlayerState();
            // Eğer player durmuşsa ama çalması gerekiyorsa, tekrar başlat
            if (playerState !== 1) { // 1 = playing
              console.log('🔄 Player durmuş, tekrar başlatılıyor');
              playerRef.current.playVideo();
            }
          } catch (error) {
            console.warn('Visibility change player kontrol hatası:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted, isYouTube, isPlaying]);

  // Full screen kapandığında player'ın çalmaya devam etmesini sağla
  useEffect(() => {
    if (!mounted || !isYouTube || !playerRef.current) return;

    // Full screen kapandığında ve şarkı çalıyor olması gerekiyorsa
    if (!isFullScreen && isPlaying) {
      setTimeout(() => {
        try {
          const playerState = playerRef.current?.getPlayerState();
          if (playerState !== 1) { // 1 = playing
            console.log('🔄 Full screen kapandı, player tekrar başlatılıyor');
            playerRef.current?.playVideo();
          }
        } catch (error) {
          console.warn('Full screen player kontrol hatası:', error);
        }
      }, 100);
    }
  }, [isFullScreen, mounted, isYouTube, isPlaying]);

  // Android uygulaması: arka plan servisi + widget (ekran kapalı / uygulama alttayken müzik çalsın)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bridge = (window as any).AndroidBridge;
    if (!bridge) return;
    const title = currentSong?.title || '';
    const artist = currentSong?.artist || '';
    if (isPlaying && title) {
      bridge.startMediaService(title, artist);
    } else if (title) {
      bridge.updateNowPlaying(title, artist, false);
    } else {
      bridge.stopMediaService();
    }
  }, [currentSong?.id, currentSong?.title, currentSong?.artist, isPlaying]);

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
          audioRef.current.volume = Math.max(0, Math.min(1, (currentVol * volume) / 10000));
        }
      } catch (error) {
        console.warn('⚠️ Fade out volume error:', error);
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
      console.warn('⚠️ Fade in initial volume error:', error);
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
          audioRef.current.volume = Math.max(0, Math.min(1, (currentVol * volume) / 10000));
        }
      } catch (error) {
        console.warn('⚠️ Fade in volume error:', error);
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

  const handleImageError = () => {
    console.log('⚠️ Image yükleme hatası, fallback kullanılıyor');
    
    // Zaten placeholder ise tekrar deneme
    if (imgSrc?.includes('placehold')) {
      return;
    }
    
    // YouTube video ID'sini çıkar
    const videoIdMatch = imgSrc?.match(/\/vi\/([^\/]+)\//);
    if (!videoIdMatch) {
      // YouTube değilse placeholder kullan
      setImgSrc('https://placehold.co/64x64/1a1a1a/666?text=♪');
      return;
    }
    
    const videoId = videoIdMatch[1];
    
    // Mevcut kaliteyi tespit et ve bir sonrakini dene
    if (imgSrc && imgSrc.includes('hqdefault')) {
      setImgSrc(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
    } else if (imgSrc && imgSrc.includes('mqdefault')) {
      setImgSrc(`https://i.ytimg.com/vi/${videoId}/default.jpg`);
    } else if (imgSrc && imgSrc.includes('default.jpg')) {
      // Son YouTube kalitesi de çalışmadı
      setImgSrc('https://placehold.co/64x64/1a1a1a/666?text=♪');
    } else {
      // İlk hata, hqdefault dene
      setImgSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
    }
  };

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

  // currentSong değiştiğinde imgSrc'yi güncelle
  useEffect(() => {
    setImgSrc(currentSong.imageUrl);
  }, [currentSong.imageUrl]);

  useEffect(() => {
    const handlePlaySong = async (event: Event) => {
      const customEvent = event as CustomEvent<Song & { playlist?: any }>;
      const song = customEvent.detail;
      const playlistData = (customEvent.detail as any).playlist;
      const skipAutoPlaylist = Boolean((customEvent.detail as any)?.skipAutoPlaylist);

      // Auth kontrolü - giriş yapılmamışsa modal göster
      const rawUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!rawUser) {
        window.dispatchEvent(new CustomEvent('showAuthModal', { detail: song }));
        return;
      }
      try {
        const parsed = JSON.parse(rawUser);
        if (!parsed) {
          window.dispatchEvent(new CustomEvent('showAuthModal', { detail: song }));
          return;
        }
      } catch {}

      console.log('🎵 Player: playSong event received:', song.title, song.id);
      console.log('🎵 Player: audioUrl:', song.audioUrl, 'aiHint:', song.aiHint);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (currentSong?.id === song.id) {
        console.log('⏯️ Same song, toggling play state');
        setIsPlaying(prev => !prev);

        if (!isPlaying) {
          libraryManager.notifyPlaybackStart(song.id);
        } else {
          libraryManager.notifyPlaybackEnd(song.id);
        }
      } else {
        // End previous song playback protection
        if (currentSong?.id) {
          libraryManager.notifyPlaybackEnd(currentSong.id);
        }

        // Mevcut şarkıyı durdur
        if (audioRef.current) {
          try {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          } catch (error) {
            console.warn('Audio durdurma hatası:', error);
          }
        }
        if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
          try {
            playerRef.current.stopVideo();
          } catch (error) {
            console.warn('YouTube durdurma hatası:', error);
          }
        }

        setProgress(0);
        setDuration(0);
        
        // Deezer'dan yüksek kaliteli albüm kapağını ÇEK (şarkıyı göstermeden ÖNCE)
        let updatedSong = { ...song };
        const isYoutubeThumbnail = song.imageUrl.includes('ytimg.com') || song.imageUrl.includes('youtube.com');
        
        if (isYoutubeThumbnail) {
          try {
            const { getBestAlbumArt } = await import('@/lib/spotify-api');
            const betterArt = await getBestAlbumArt(song.imageUrl, song.artist, song.title);
            if (betterArt && betterArt !== song.imageUrl) {
              updatedSong.imageUrl = betterArt;
              console.log('🎨 Deezer yüksek kalite albüm kapağı kullanılıyor');
            }
          } catch (error) {
            console.warn('Deezer artwork fetch hatası:', error);
          }
        }
        
        setCurrentSong(updatedSong);
        setIsPlaying(true);

        // Robust YouTube detection
        const isYT = (song.aiHint === 'youtube') || (song.audioUrl && !song.audioUrl.startsWith('http'));
        setIsYouTube(Boolean(isYT));
        console.log('🎬 isYouTube set to:', isYT);

        // LocalStorage'ı güncelle (güncellenmiş imageUrl ile)
        localStorage.setItem('current-song', JSON.stringify(updatedSong));
        localStorage.setItem('is-playing', 'true');

        // Notify LibraryManager about new playback
        libraryManager.notifyPlaybackStart(song.id);

        // Add to recently played through LibraryManager
        await libraryManager.addToRecentlyPlayed(song.id);

        // Playlist bilgilerini işle
        if (playlistData && playlistData.songs && Array.isArray(playlistData.songs)) {
          console.log('✅ Playlist:', playlistData.songs.length, 'şarkı');

          setQueue(playlistData.songs);
          setCurrentIndex(playlistData.currentIndex || 0);

          localStorage.setItem('current-queue', JSON.stringify(playlistData.songs));
          localStorage.setItem('current-index', (playlistData.currentIndex || 0).toString());
        } else {
          if (!skipAutoPlaylist) {
            console.log('❌ Playlist yok, otomatik oluşturuluyor');
            // Don't await this, let playback start
            createAutoPlaylist(song);
          } else {
            console.log('ℹ️ Auto-playlist atlandı (startRadio kontrol ediyor)');
          }
        }


        // Playlist sayfasına şarkı değişikliğini bildir
        window.dispatchEvent(new CustomEvent('songChanged', {
          detail: updatedSong
        }));

        // Otomatik tam ekran aç
        setIsFullScreen(true);

        // Analytics
        try {
          const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
          if (currentUser) {
            const userData = JSON.parse(currentUser);
            analytics.trackSongPlay(updatedSong.id, updatedSong.title, updatedSong.artist, userData.id);

            // Now playing API'sine gönder (overlay için) - güncellenmiş imageUrl ile
            updateNowPlaying(userData.id, updatedSong, 0, 0, true);
          }
        } catch (error) {
          console.error('Analytics error:', error);
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

    // Context menu event'leri için handler'lar
    const handlePlayNext = async (event: any) => {
      const song = event.detail;
      console.log('🎵 Player: playNext event alındı:', song.title);
      try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          console.log('👤 Kullanıcı bulundu:', userData.id);

          const response = await fetch('/api/user-data/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id,
              song: song,
              playNext: true
            }),
          });

          console.log('📡 API Response:', response.status);

          if (response.ok) {
            // Queue'yu güncelle
            setQueue(prev => {
              const newQueue = [song, ...prev];
              localStorage.setItem('current-queue', JSON.stringify(newQueue));
              console.log('✅ Queue güncellendi, yeni uzunluk:', newQueue.length);
              return newQueue;
            });

            // Toast notification
            const toastEvent = new CustomEvent('showToast', {
              detail: { message: `"${song.title}" sonraki şarkı olarak eklendi!`, type: 'success' }
            });
            window.dispatchEvent(toastEvent);
            console.log('🎉 Toast gönderildi');
          } else {
            console.error('❌ API hatası:', response.status);
          }
        } else {
          console.error('❌ Kullanıcı bulunamadı');
        }
      } catch (error) {
        console.error('❌ Sonraki şarkı ekleme hatası:', error);
      }
    };

    const handleAddToQueue = async (event: any) => {
      const song = event.detail;
      console.log('🎵 Player: addToQueue event alındı:', song.title);
      try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          console.log('👤 Kullanıcı bulundu:', userData.id);

          const response = await fetch('/api/user-data/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id,
              song: song,
              playNext: false
            }),
          });

          console.log('📡 API Response:', response.status);

          if (response.ok) {
            // Queue'yu güncelle
            setQueue(prev => {
              const newQueue = [...prev, song];
              localStorage.setItem('current-queue', JSON.stringify(newQueue));
              console.log('✅ Queue güncellendi, yeni uzunluk:', newQueue.length);
              return newQueue;
            });

            // Toast notification
            const toastEvent = new CustomEvent('showToast', {
              detail: { message: `"${song.title}" kuyruğa eklendi!`, type: 'success' }
            });
            window.dispatchEvent(toastEvent);
            console.log('🎉 Toast gönderildi');
          } else {
            console.error('❌ API hatası:', response.status);
          }
        } else {
          console.error('❌ Kullanıcı bulunamadı');
        }
      } catch (error) {
        console.error('❌ Kuyruğa ekleme hatası:', error);
      }
    };

    const handleStartRadio = async (event: any) => {
      const song = event.detail;
      console.log('🎵 Player: startRadio event alındı:', song.title);

      // Auth kontrolü - giriş yapılmamışsa modal göster
      const rawUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!rawUser) {
        window.dispatchEvent(new CustomEvent('showAuthModal', { detail: song }));
        return;
      }
      try {
        const parsed = JSON.parse(rawUser);
        if (!parsed) {
          window.dispatchEvent(new CustomEvent('showAuthModal', { detail: song }));
          return;
        }
      } catch {}

      try {
        console.log('📻 Radyo başlatılıyor:', song.title, '-', song.artist);

        // Mevcut şarkıyı çal
        window.dispatchEvent(new CustomEvent('playSong', { detail: { ...song, skipAutoPlaylist: true } }));
        console.log('▶️ Şarkı çalma eventi gönderildi');

        // Benzer şarkılar için otomatik playlist oluştur
        await createAutoPlaylist(song);
        console.log('📝 Otomatik playlist oluşturuldu');

        // Toast notification
        const toastEvent = new CustomEvent('showToast', {
          detail: { message: `"${song.title}" temalı radyo başlatıldı! 📻`, type: 'success' }
        });
        window.dispatchEvent(toastEvent);
        console.log('🎉 Toast gönderildi');
      } catch (error) {
        console.error('❌ Radyo başlatma hatası:', error);
      }
    };

    const handleRepeatSong = (event: any) => {
      const song = event.detail;
      console.log('🎵 Player: repeatSong event alındı:', song.title);
      setRepeatMode('one');
      localStorage.setItem('repeat-mode', 'one');

      // Eğer farklı bir şarkıysa önce onu çal
      if (currentSong.id !== song.id) {
        window.dispatchEvent(new CustomEvent('playSong', { detail: song }));
      }

      // Toast notification
      const toastEvent = new CustomEvent('showToast', {
        detail: { message: `"${song.title}" tekrar modunda!`, type: 'info' }
      });
      window.dispatchEvent(toastEvent);
      console.log('🎉 Repeat toast gönderildi');
    };

    // Event listener'ları kaydet
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Player event listener\'ları kaydediliyor...');
    }
    window.addEventListener('playSong', handlePlaySong);
    window.addEventListener('joinSession', handleJoinSession);
    window.addEventListener('togglePlay', handleTogglePlay);
    window.addEventListener('playerSetVolume', handlePlayerSetVolume);
    window.addEventListener('playerToggleMute', handlePlayerToggleMute);
    window.addEventListener('seekTo', handleSeekTo);
    window.addEventListener('playNext', handlePlayNext);
    window.addEventListener('addToQueue', handleAddToQueue);
    window.addEventListener('startRadio', handleStartRadio);
    window.addEventListener('repeatSong', handleRepeatSong);

    // Dil tercihi değişikliklerini dinle
    const handleLanguagePreferencesChanged = (event: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌍 Dil tercihleri güncellendi:', event.detail);
      }
      setLanguagePreferences(event.detail);
    };
    window.addEventListener('languagePreferencesChanged', handleLanguagePreferencesChanged);

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Tüm event listener\'lar kaydedildi');
    }

    return () => {
      window.removeEventListener('playSong', handlePlaySong);
      window.removeEventListener('joinSession', handleJoinSession);
      window.removeEventListener('togglePlay', handleTogglePlay);
      window.removeEventListener('playerSetVolume', handlePlayerSetVolume);
      window.removeEventListener('playerToggleMute', handlePlayerToggleMute);
      window.removeEventListener('seekTo', handleSeekTo);
      window.removeEventListener('playNext', handlePlayNext);
      window.removeEventListener('addToQueue', handleAddToQueue);
      window.removeEventListener('startRadio', handleStartRadio);
      window.removeEventListener('repeatSong', handleRepeatSong);
      window.removeEventListener('languagePreferencesChanged', handleLanguagePreferencesChanged);
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

    if (isYouTube) {
      // Hızlı şarkı geçişlerinde YouTube player yeniden mount olurken ref kısa süreli null/yarım olabilir.
      // Ready olmadan play/pause komutu gönderme.
      if (!isYouTubeReady || !playerRef.current) return;

      try {
        const playerState = playerRef.current.getPlayerState?.();
        if (isPlaying && playerState !== 1) {
          playerRef.current.playVideo?.();
          // Yeni şarkı başlarken fade in başlat
          if (fadeVolume === 0) {
            setTimeout(() => fadeIn(), 200);
          }
        } else if (!isPlaying && playerState === 1) {
          playerRef.current.pauseVideo?.();
        }
      } catch (e) {
        console.warn('⚠️ YouTube play/pause race condition:', e);
      }
    } else if (audioRef.current && currentSong.audioUrl && currentSong.audioUrl.startsWith('http')) {
      if (isPlaying) {
        try {
          if (audioRef.current && audioRef.current.src !== currentSong.audioUrl) {
            audioRef.current.src = currentSong.audioUrl;
          }
          if (audioRef.current) {
            // Ses seviyesini başlangıçta 0'a ayarla
            audioRef.current.volume = 0;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                // Çalmaya başladıktan sonra fade in başlat
                if (fadeVolume === 0) {
                  setTimeout(() => fadeIn(), 200);
                }
              }).catch(e => {
                console.warn("Audio play failed:", e.message);
                // Kullanıcı etkileşimi gerekiyor, pause yap
                setIsPlaying(false);
              });
            }
          }
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
  }, [isPlaying, currentSong, isYouTube, mounted, isYouTubeReady, fadeVolume]);

  // YouTube şarkısı değişince player tekrar hazır olana kadar komut gönderme
  useEffect(() => {
    if (isYouTube) setIsYouTubeReady(false);
  }, [isYouTube, currentSong.audioUrl]);

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
          setIsYouTube(Boolean(newSession.song_data.audioUrl && !newSession.song_data.audioUrl.startsWith('http')));
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

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onPlayerReady = (event: any) => {
    console.log('🎬 YouTube player hazır');

    try {
      playerRef.current = event.target;
      setIsYouTubeReady(true);

      // Player'ın hazır olduğundan emin ol
      if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
        // Ses seviyesini ayarla
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume((fadeVolume * volume) / 100);
        }

        // Eğer çalması gerekiyorsa çal
        if (isPlaying && typeof playerRef.current.playVideo === 'function') {
          setTimeout(() => {
            try {
              if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
                // Fade in başlat
                if (fadeVolume === 0) {
                  setTimeout(() => fadeIn(), 200);
                }
              }
            } catch (error) {
              console.warn('YouTube play hatası:', error);
            }
          }, 500); // Player'ın tamamen hazır olması için bekle
        }
      }
    } catch (error) {
      console.warn('YouTube player ready hatası:', error);
    }
  };

  const onPlayerStateChange = (event: any) => {
    console.log('🎬 YouTube state:', event.data);

    try {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (event.data === 1) { // Playing
        console.log('▶️ YouTube çalıyor');
        setIsPlaying(true);

        // Duration al - güvenli şekilde
        setTimeout(() => {
          try {
            if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
              const newDuration = playerRef.current.getDuration();
              if (newDuration > 0 && !isNaN(newDuration)) {
                setDuration(newDuration);
              }
            }
          } catch (error) {
            console.warn('Duration alma hatası:', error);
          }
        }, 1000);

        // Progress tracking
        progressIntervalRef.current = setInterval(() => {
          try {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
              const newProgress = playerRef.current.getCurrentTime();
              if (!isNaN(newProgress) && isFinite(newProgress)) {
                setProgress(newProgress);

                // LocalStorage'ı güncelle (senkronizasyon için)
                localStorage.setItem('current-progress', newProgress.toString());
                if (duration > 0) {
                  localStorage.setItem('current-duration', duration.toString());
                }

                // Progress event gönder

                window.dispatchEvent(new CustomEvent('progressUpdate', {
                  detail: { progress: newProgress, duration: duration }
                }));

                // Now playing güncelle (her 5 saniyede bir)
                if (Math.floor(newProgress) % 5 === 0) {
                  try {
                    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                    if (currentUser) {
                      const userData = JSON.parse(currentUser);
                      updateNowPlaying(userData.id, currentSong, newProgress, duration, true);
                    }
                  } catch (error) {
                    console.error('Now playing update error:', error);
                  }
                }
              }
            }
          } catch (error) {
            console.warn('Progress update hatası:', error);
          }
        }, 1000);

        // Play state değişikliğini bildir
        window.dispatchEvent(new CustomEvent('playStateChanged', {
          detail: { isPlaying: true }
        }));

      } else if (event.data === 2) { // Paused
        console.log('⏸️ YouTube durdu');
        setIsPlaying(false);

        // Play state değişikliğini bildir
        window.dispatchEvent(new CustomEvent('playStateChanged', {
          detail: { isPlaying: false }
        }));

      } else if (event.data === 0) { // Ended
        console.log('⏹️ YouTube bitti');
        handleSongEnd();
      } else if (event.data === -1) { // Unstarted
        console.log('🔄 YouTube yükleniyor');
      } else if (event.data === 3) { // Buffering
        console.log('⏳ YouTube buffering');
      } else if (event.data === 5) { // Cued
        console.log('📋 YouTube cued');
      }
    } catch (error) {
      console.warn('YouTube state change hatası:', error);
    }
  };

  const handleTimeUpdate = () => {
    try {
      if (audioRef.current && audioRef.current.readyState >= 2) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;

        if (!isNaN(currentTime) && !isNaN(duration) && isFinite(currentTime) && isFinite(duration)) {
          setProgress(currentTime);
          setDuration(duration);

          // Mini player için progress güncelle
          localStorage.setItem('current-progress', currentTime.toString());
          localStorage.setItem('current-duration', duration.toString());

          // Now playing güncelle (her 5 saniyede bir)
          if (Math.floor(currentTime) % 5 === 0) {
            try {
              const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
              if (currentUser) {
                const userData = JSON.parse(currentUser);
                updateNowPlaying(userData.id, currentSong, currentTime, duration, true);
              }
            } catch (error) {
              console.error('Now playing update error:', error);
            }
          }

          // Progress event'ini gönder
          const progressEvent = new CustomEvent('progressUpdate', {
            detail: { progress: currentTime, duration: duration }
          });
          window.dispatchEvent(progressEvent);
        }
      }
    } catch (error) {
      console.warn("⚠️ Time update error:", error);
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
        audioRef.current.volume = Math.max(0, Math.min(1, effectiveVolume / 100));
      }

      // LocalStorage'a kaydet
      localStorage.setItem('volume', newVolume.toString());
    } catch (error) {
      console.warn('⚠️ Volume change error:', error);
    }
  };

  // Now playing güncelleme fonksiyonu (overlay için)
  const updateNowPlaying = async (userId: string, song: Song, progress: number, duration: number, isPlaying: boolean) => {
    try {
      // Firebase UID gibi uuid olmayan userId'lerde Supabase now_playing FK/RLS patlıyor.
      // Yayıncı/overlay'i şimdilik devre dışı bırakıyoruz.
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) return;

      // Artık playSong'da Deezer'dan çekiyoruz, burada tekrar çekmeye gerek yok
      await fetch('/api/now-playing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          song,
          progress,
          duration,
          isPlaying
        }),
      });
    } catch (error) {
      console.error('Now playing update error:', error);
    }
  };

  // Şarkı başlığından sanatçı ve şarkı adını ayıran fonksiyon
  const extractArtistAndTitle = (fullTitle: string) => {
    // Yaygın ayırıcıları kontrol et
    const separators = [' - ', ' – ', ' — ', ' | ', ': ', ' / '];

    for (const separator of separators) {
      if (fullTitle.includes(separator)) {
        const parts = fullTitle.split(separator);
        if (parts.length >= 2) {
          let artist = parts[0].trim();
          let title = parts.slice(1).join(separator).trim();

          // feat, ft gibi kısımları temizle
          title = title.replace(/\s*\(.*?(feat|ft|featuring).*?\)/gi, '');
          title = title.replace(/\s*(feat|ft|featuring).*$/gi, '');

          // Parantez içindeki gereksiz bilgileri temizle
          title = title.replace(/\s*\(official.*?\)/gi, '');
          title = title.replace(/\s*\[official.*?\]/gi, '');
          title = title.replace(/\s*\(.*?video.*?\)/gi, '');
          title = title.replace(/\s*\[.*?video.*?\]/gi, '');
          title = title.replace(/\s*\(.*?version.*?\)/gi, '');

          // Söz-Müzik gibi kısımları temizle
          title = title.replace(/\s*Söz-Müzik\s*:.*$/gi, '');

          return {
            artist: artist,
            title: title.trim() || fullTitle
          };
        }
      }
    }

    // Özel durumlar için regex kontrolleri
    const dashMatch = fullTitle.match(/^([^-]+)\s*-\s*(.+)$/);
    if (dashMatch) {
      const artist = dashMatch[1].trim();
      const title = dashMatch[2].trim();

      if (artist.length > 2 && !artist.match(/^\d+$/)) {
        return {
          artist: artist,
          title: title
        };
      }
    }

    // Yaygın sanatçı isimlerini kontrol et
    const knownArtists = [
      'ceza', 'ezhel', 'sagopa kajmer', 'norm ender', 'khontkar', 'gazapizm', 'şanışer',
      'ed sheeran', 'the weeknd', 'billie eilish', 'adele', 'harry styles',
      'zeynep bastık', 'aleyna tilki', 'deha bilimlier', 'eypio', 'yener çevik',
      'ismail yk', 'ufuk çalışkan', 'dr.fuchs'
    ];

    const lowerTitle = fullTitle.toLowerCase();

    for (const artist of knownArtists) {
      if (lowerTitle.includes(artist)) {
        const artistRegex = new RegExp(artist, 'gi');
        const remaining = fullTitle.replace(artistRegex, '').trim();
        const cleanTitle = remaining.replace(/^[-–—|:\s]+/, '').replace(/[-–—|:\s]+$/, '').trim();

        const properArtist = artist.split(' ').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        return {
          artist: properArtist,
          title: cleanTitle || fullTitle
        };
      }
    }

    return {
      ...parseYouTubeMusicMeta(fullTitle),
    };
  };

  // Otomatik playlist oluşturma fonksiyonu
  const createAutoPlaylist = async (song: Song) => {
    try {
      const requestId = ++autoPlaylistRequestIdRef.current;
      console.log('🎵 Otomatik playlist oluşturuluyor:', song.title, '-', song.artist);

      // İlk şarkının dil bilgisini ayarla
      if (!song.language || song.language === 'auto') {
        song.language = detectSongLanguage(song.title, song.artist);
        console.log(`🌍 İlk şarkının dili tespit edildi: ${song.language}`);
      }

      const cleanArtist = song.artist.replace(/[(\[].*?[)\]]/g, '').trim();
      const currentLanguage = song.language;
      const artistGenre = detectArtistGenre(cleanArtist);

      console.log(`🎵 Radyo Modu: "${cleanArtist}" için tür: ${artistGenre || 'Bilinmiyor'} (${currentLanguage})`);

      let allSongs: Song[] = [song]; // İlk şarkıyı ekle

      const isJunkTitle = (t: string) => {
        const s = (t || '').toLowerCase();
        // playlist/mix/compilation gibi şeyler büyük oranda "alakası yok" çıkarıyor
        return (
          s.includes('mix') ||
          s.includes('playlist') ||
          s.includes('compilation') ||
          s.includes('full album') ||
          s.includes('top ') ||
          s.includes('#türkçerap') ||
          s.includes('#hiphop') ||
          s.includes('yeni müzik') ||
          s.includes('1 hour') ||
          s.includes('1 saat') ||
          s.includes('2 hours') ||
          s.includes('2 saat')
        );
      };

      const sanitizeQueue = (songs: Song[]) => {
        const seen = new Set<string>();
        const out: Song[] = [];
        for (const s of songs) {
          if (!s || !s.id || !s.title) continue;
          if (seen.has(s.id)) continue;
          // audioUrl yoksa YouTube id ile doldur
          if (!s.audioUrl) s.audioUrl = s.id;
          seen.add(s.id);
          out.push(s);
        }
        return out;
      };

      // 1) Önce aynı sanatçıdan şarkıları topla (büyük modda alaka artsın)
      try {
        const sameArtistQuery = currentLanguage === 'turkish'
          ? `${cleanArtist} en popüler şarkıları`
          : `${cleanArtist} top songs`;

        const sameArtistRes = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(sameArtistQuery)}`);
        const sameArtistData = await sameArtistRes.json();

        if (sameArtistData?.videos?.length > 0) {
          const sameArtistSongs: Song[] = sameArtistData.videos
            .filter((v: any) => {
              if (!v?.id || !v?.title) return false;
              if (isJunkTitle(v.title)) return false;
              const alreadyExistsById = allSongs.some(existing => existing.id === v.id);
              if (alreadyExistsById) return false;

              const parsed = extractArtistAndTitle(v.title);
              const parsedArtist = (parsed.artist || '').toLowerCase();
              const target = cleanArtist.toLowerCase();

              // "BLOK3" vs "BLOK 3" gibi boşluk farklarını da tolere et
              const normalize = (s: string) => s.replace(/\s+/g, '').trim();
              const sameArtist =
                normalize(parsedArtist) === normalize(target) ||
                normalize(parsedArtist).includes(normalize(target)) ||
                normalize(target).includes(normalize(parsedArtist));

              if (!sameArtist) return false;

              const videoLanguage = detectSongLanguage(parsed.title, parsed.artist);
              if (videoLanguage !== currentLanguage) return false;

              return true;
            })
            .slice(0, 12)
            .map((video: any) => {
              const { artist, title } = extractArtistAndTitle(video.title);

              let highQualityImage = video.thumbnail;
              if (highQualityImage && highQualityImage.includes('i.ytimg.com')) {
                highQualityImage = highQualityImage
                  .replace('default.jpg', 'maxresdefault.jpg')
                  .replace('mqdefault.jpg', 'maxresdefault.jpg')
                  .replace('hqdefault.jpg', 'maxresdefault.jpg')
                  .replace('sddefault.jpg', 'maxresdefault.jpg');
              }

              return {
                id: video.id,
                title,
                artist,
                album: '',
                duration: video.duration || '0:00',
                imageUrl: highQualityImage,
                audioUrl: video.id,
                aiHint: 'song',
                language: currentLanguage as SongLanguage,
              };
            });

          if (sameArtistSongs.length > 0) {
            allSongs = [...allSongs, ...sameArtistSongs];
            console.log(`✅ Aynı sanatçıdan ${sameArtistSongs.length} şarkı eklendi (öncelikli)`);
          }
        }
      } catch (e) {
        console.warn('⚠️ Aynı sanatçı şarkıları yüklenemedi:', e);
      }

      // Dil bazlı arama terimleri
      let searchQueries: string[] = [];

      if (currentLanguage === 'turkish') {
        if (artistGenre) {
          searchQueries = [
            `${cleanArtist} ${artistGenre} mix`,
            `${artistGenre} popüler şarkılar`,
            `${artistGenre} mix 2024`,
            `${cleanArtist} benzer sanatçılar`,
            `${artistGenre} en çok dinlenenler`,
            `türkçe ${artistGenre} listesi`,
          ];
          // Tür rap ise drill ve trap de ekle
          if (artistGenre.includes('rap')) {
            searchQueries.push('türkçe drill mix');
            searchQueries.push('türkçe trap mix');
          }
        } else {
          searchQueries = [
            `${cleanArtist} türkçe şarkılar`,
            'türkçe pop müzik',
            'türkçe rock şarkıları',
            'türkçe rap hip hop',
            'popüler türkçe müzik',
            `${cleanArtist} benzer sanatçılar`
          ];
        }
      } else {
        if (artistGenre) {
          searchQueries = [
            `${cleanArtist} ${artistGenre} radio`,
            `best ${artistGenre} songs`,
            `${artistGenre} hits 2024`,
            `${cleanArtist} similar songs`,
            `top ${artistGenre} artists`,
            `${artistGenre} mix playlist`,
            `classic ${artistGenre} songs`
          ];
        } else {
          searchQueries = [
            `${cleanArtist} similar artists`,
            'english pop music',
            'english rock songs',
            'popular english music',
            'international hits',
            `songs like ${song.title}`
          ];
        }
      }

      console.log(`🔍 ${currentLanguage} dili için ${searchQueries.length} farklı arama yapılacak`);

      // Her arama terimini dene
      for (let i = 0; i < searchQueries.length && allSongs.length < 50; i++) {
        // Bu arada yeni bir istek geldiyse eski playlisti yazma
        if (requestId !== autoPlaylistRequestIdRef.current) {
          console.log('⏭️ Auto-playlist iptal: daha yeni bir istek var');
          return;
        }
        const searchQuery = searchQueries[i];
        console.log(`🔍 Arama ${i + 1}: "${searchQuery}"`);

        try {
          const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();

          if (data.videos && data.videos.length > 0) {
            console.log(`📺 ${data.videos.length} video bulundu`);

            const newSongs = data.videos
              .filter((v: any) => {
                if (!v?.id || !v?.title) return false;
                if (isJunkTitle(v.title)) return false;
                // DUPLICATE KONTROLÜ - ID ve başlık bazlı
                const alreadyExistsById = allSongs.some(existing => existing.id === v.id);
                const alreadyExistsByTitle = allSongs.some(existing =>
                  existing.title.toLowerCase().includes(v.title.toLowerCase().substring(0, 10)) ||
                  v.title.toLowerCase().includes(existing.title.toLowerCase().substring(0, 10))
                );

                if (alreadyExistsById || alreadyExistsByTitle) {
                  console.log('❌ Duplicate:', v.title);
                  return false;
                }

                // Dil kontrolü
                const { artist, title } = extractArtistAndTitle(v.title);
                const videoLanguage = detectSongLanguage(title, artist);

                if (videoLanguage !== currentLanguage) {
                  console.log(`❌ Farklı dil (${videoLanguage}):`, v.title);
                  return false;
                }

                console.log('✅ Ekleniyor:', v.title);
                return true;
              })
              .slice(0, 15) // Her aramadan max 15 şarkı
              .map((video: any) => {
                // Video başlığından sanatçı ve şarkı adını ayır
                const { artist, title } = extractArtistAndTitle(video.title);

                // Yüksek kaliteli thumbnail kullan
                let highQualityImage = video.thumbnail;
                if (highQualityImage && highQualityImage.includes('i.ytimg.com')) {
                  highQualityImage = highQualityImage
                    .replace('default.jpg', 'maxresdefault.jpg')
                    .replace('mqdefault.jpg', 'maxresdefault.jpg')
                    .replace('hqdefault.jpg', 'maxresdefault.jpg')
                    .replace('sddefault.jpg', 'maxresdefault.jpg');
                }

                const newSong = {
                  id: video.id,
                  title: title,
                  artist: artist,
                  album: '',
                  duration: video.duration || '0:00',
                  imageUrl: highQualityImage,
                  audioUrl: video.id,
                  aiHint: 'song',
                  language: currentLanguage as SongLanguage
                };

                console.log(`🌍 Şarkı eklendi: "${newSong.title}" by "${newSong.artist}" (${newSong.language})`);
                return newSong;
              });

            allSongs = [...allSongs, ...newSongs];
            console.log(`✅ ${newSongs.length} şarkı eklendi, toplam: ${allSongs.length}`);
          }
        } catch (error) {
          console.error(`❌ Arama hatası (${searchQuery}):`, error);
        }

        // Kısa bekleme
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Eğer yeterli şarkı yoksa favoriler ekle
      if (allSongs.length < 5) {
        console.log('📝 Yeterli şarkı yok, favoriler ekleniyor...');
        const favorites = safeJsonParse('favorites', []);
        const sameLangFavorites = favorites
          .filter((fav: any) => fav.id !== song.id)
          .filter((fav: any) => {
            const favLang = fav.language || detectSongLanguage(fav.title, fav.artist);
            return favLang === currentLanguage;
          })
          .slice(0, 10);
        allSongs = [...allSongs, ...sameLangFavorites];
      }

      // İlk şarkı sabit, diğerleri karışık
      allSongs = sanitizeQueue(allSongs);
      const firstSong = allSongs[0];

      // İlk N parça aynı sanatçıdan gelsin (alaka artsın)
      const normalize = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '').trim();
      const targetArtist = normalize(cleanArtist);
      const sameArtist = allSongs
        .slice(1)
        .filter(s => normalize(s.artist) === targetArtist || normalize(s.artist).includes(targetArtist) || targetArtist.includes(normalize(s.artist)));

      const others = allSongs
        .slice(1)
        .filter(s => !sameArtist.some(sa => sa.id === s.id));

      const artistFirstCount = Math.min(15, sameArtist.length);
      const restShuffled = others.sort(() => Math.random() - 0.5);
      const finalPlaylist = [firstSong, ...sameArtist.slice(0, artistFirstCount), ...restShuffled]
        .slice(0, 50);

      console.log(`🎵 PLAYLIST OLUŞTURULDU: ${finalPlaylist.length} şarkı (${currentLanguage})`);
      finalPlaylist.forEach((s, i) => {
        console.log(`${i + 1}. ${s.title} - ${s.artist} (${s.language})`);
      });

      // Queue'yu güncelle
      setQueue(finalPlaylist);
      setCurrentIndex(0);
      localStorage.setItem('current-queue', JSON.stringify(finalPlaylist));
      localStorage.setItem('current-index', '0');

    } catch (error) {
      console.error('❌ Playlist oluşturma hatası:', error);

      // Hata durumunda basit fallback
      const favorites = safeJsonParse('favorites', []);
      const fallbackQueue = [song, ...favorites.slice(0, 9)];
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

      // Gelişmiş dil tespiti sistemi - utils'tan kullan
      const detectedLanguage = detectSongLanguage(cleanTitle, cleanArtist);
      console.log(`🌍 Tespit edilen dil: ${detectedLanguage} - "${cleanTitle}" by "${cleanArtist}"`);

      let searchQuery = '';
      let response, data;

      if (detectedLanguage === 'turkish') {
        // Türkçe müzik için arama
        const turkishKeywords = [
          `${cleanArtist} ${cleanTitle}`,
          `${cleanArtist} - ${cleanTitle}`,
          `${cleanArtist} resmi klip`,
          `${cleanArtist} resmi audio`,
          `${cleanArtist} mix`,
          'türkçe rap hip hop',
          'türkçe pop',
          'türkçe rock',
          'türkçe müzik',
          cleanArtist
        ];
        searchQuery = turkishKeywords[Math.floor(Math.random() * turkishKeywords.length)];
      } else {
        // İngilizce müzik için arama
        const englishKeywords = [
          `${cleanArtist} ${cleanTitle}`,
          `${cleanArtist} - ${cleanTitle}`,
          `${cleanArtist} official audio`,
          `${cleanArtist} official video`,
          `${cleanArtist} mix`,
          'english pop hits',
          'rock classics',
          'hip hop hits',
          cleanArtist
        ];
        searchQuery = englishKeywords[Math.floor(Math.random() * englishKeywords.length)];
      }

      console.log(`🔍 Dil bazlı arama (${detectedLanguage}):`, searchQuery);

      // Normal API çağrısı (dil parametresi olmadan)
      response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(searchQuery)}`);
      data = await response.json();

      // Eğer yeterli sonuç yoksa alternatif arama
      if (!data.videos || data.videos.length < 5) {
        const fallbackQuery = detectedLanguage === 'turkish' ? 'türkçe müzik hit' : 'english music hits';
        console.log('🔍 Alternatif arama:', fallbackQuery);
        response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(fallbackQuery)}`);
        data = await response.json();
      }

      if (data.videos && data.videos.length > 0) {
        console.log(`📺 ${data.videos.length} video bulundu, dil filtresi uygulanıyor...`);

        // Mevcut şarkıyı filtrele
        let filteredVideos = data.videos
          .filter((v: any) => v.id !== currentSong.id)
          .filter((v: any) => {
            const t = (v?.title || '').toLowerCase();
            // mix/playlist gibi çöp içerik azalt
            if (t.includes('mix') || t.includes('playlist') || t.includes('compilation') || t.includes('full album')) return false;
            return true;
          });

        // Dil bazlı filtreleme
        const languageFilteredVideos = filteredVideos.filter((video: any) => {
          const videoLanguage = detectSongLanguage(video.title, video.channelTitle || '');
          return videoLanguage === detectedLanguage;
        });

        // Eğer aynı dilde yeterli şarkı yoksa, tüm sonuçları kullan
        const finalVideos = languageFilteredVideos.length >= 3 ? languageFilteredVideos : filteredVideos;

        console.log(`🎵 ${languageFilteredVideos.length} aynı dilde şarkı bulundu (${detectedLanguage})`);
        console.log(`📝 Kullanılacak şarkı sayısı: ${finalVideos.length}`);

        const newSongs = finalVideos.slice(0, 20)
          .map((video: any) => {
            // Yüksek kaliteli thumbnail kullan
            let highQualityImage = video.thumbnail;
            if (highQualityImage && highQualityImage.includes('i.ytimg.com')) {
              highQualityImage = highQualityImage
                .replace('default.jpg', 'maxresdefault.jpg')
                .replace('mqdefault.jpg', 'maxresdefault.jpg')
                .replace('hqdefault.jpg', 'maxresdefault.jpg')
                .replace('sddefault.jpg', 'maxresdefault.jpg');
            }

            return {
              id: video.id,
              title: video.title,
              artist: video.channelTitle || currentArtist,
              album: '',
              duration: video.duration || '0:00',
              imageUrl: highQualityImage,
              audioUrl: video.id,
              language: detectSongLanguage(video.title, video.channelTitle || '') as SongLanguage // Her şarkının dilini tespit et
            };
          });

        if (newSongs.length > 0) {
          console.log(`✅ ${newSongs.length} yeni şarkı eklendi`);
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
    if (!mounted) return;
    const now = Date.now();
    if (transitionLockRef.current || isTransitioning) return;
    if (now - lastNavActionAtRef.current < 250) return; // debounce
    lastNavActionAtRef.current = now;
    transitionLockRef.current = true;

    console.log('⏭️ Sonraki şarkı');
    console.log('📊 Queue:', queue.length, 'Index:', currentIndex);
    console.log('🌍 Dil tercihleri:', languagePreferences);

    setIsTransitioning(true);

    try {
      // Mevcut şarkının dilini tespit et
      const currentSong = queue[currentIndex];
      let targetLanguage: SongLanguage = 'auto';

      if (currentSong) {
        const currentLanguage = currentSong.language || detectSongLanguage(currentSong.title, currentSong.artist);

        // Dil tercihlerine göre hedef dili belirle
        if (languagePreferences.mixLanguages) {
          targetLanguage = 'auto'; // Karışık mod
        } else if (languagePreferences.smartLanguageMode) {
          targetLanguage = currentLanguage; // Akıllı mod - mevcut şarkının dili
        } else {
          targetLanguage = languagePreferences.preferredLanguage; // Sabit tercih
        }

        console.log(`🎯 Hedef dil: ${targetLanguage} (mevcut: ${currentLanguage})`);
      }

      // Dil bazlı sonraki şarkı seçimi
      if (currentIndex < queue.length - 1) {
        const remainingSongs = queue.slice(currentIndex + 1);

        if (targetLanguage === 'auto' || languagePreferences.mixLanguages) {
          // Karışık mod - sıradaki şarkıyı çal
          const nextIndex = currentIndex + 1;
          const nextSong = queue[nextIndex];
          console.log('🎵 Sonraki şarkı (karışık mod):', nextSong.title);

          await changeSongSafely(nextSong, nextIndex);
          return;
        } else {
          // Dil filtrelemesi yap
          console.log(`🔍 Kalan ${remainingSongs.length} şarkı arasından ${targetLanguage} dili aranıyor...`);

          // Her şarkının dilini kontrol et
          remainingSongs.forEach((song, idx) => {
            const songLang = song.language || detectSongLanguage(song.title, song.artist);
            console.log(`${idx + 1}. "${song.title}" - "${song.artist}" -> ${songLang}`);
          });

          const sameLangSongs = filterSongsByLanguage(remainingSongs, targetLanguage);
          console.log(`✅ ${targetLanguage} dilinde ${sameLangSongs.length} şarkı bulundu`);

          if (sameLangSongs.length > 0) {
            // Aynı dilde şarkı bulundu
            const nextSong = sameLangSongs[0];
            const nextIndex = queue.findIndex((song, idx) => idx > currentIndex && song.id === nextSong.id);
            console.log(`🎵 Aynı dilde sonraki şarkı (${targetLanguage}):`, nextSong.title);

            await changeSongSafely(nextSong, nextIndex);
            return;
          } else {
            // Aynı dilde şarkı yok, sıradaki şarkıyı çal
            const nextIndex = currentIndex + 1;
            const nextSong = queue[nextIndex];
            console.log('🎵 Sonraki şarkı (farklı dil):', nextSong.title);

            await changeSongSafely(nextSong, nextIndex);
            return;
          }
        }
      }

      // Queue bittiyse başa dön
      if (repeatMode === 'all' && queue.length > 0) {
        if (targetLanguage === 'auto' || languagePreferences.mixLanguages) {
          // Karışık mod - ilk şarkıyı çal
          const firstSong = queue[0];
          console.log('🔄 Başa dön (karışık mod):', firstSong.title);

          await changeSongSafely(firstSong, 0);
          return;
        } else {
          // Aynı dilde şarkı ara
          const sameLangSongs = filterSongsByLanguage(queue, targetLanguage);

          if (sameLangSongs.length > 0) {
            const firstSameLangSong = sameLangSongs[0];
            const firstIndex = queue.findIndex(song => song.id === firstSameLangSong.id);
            console.log(`🔄 Başa dön (aynı dil - ${targetLanguage}):`, firstSameLangSong.title);

            await changeSongSafely(firstSameLangSong, firstIndex);
            return;
          } else {
            // Aynı dilde şarkı yok, ilk şarkıyı çal
            const firstSong = queue[0];
            console.log('🔄 Başa dön (playlist):', firstSong.title);

            await changeSongSafely(firstSong, 0);
            return;
          }
        }
      }

      console.log('❌ Sonraki şarkı yok');
      setIsPlaying(false);

    } catch (error) {
      console.error('❌ playNext hatası:', error);
      setIsPlaying(false);
    } finally {
      setIsTransitioning(false);
      transitionLockRef.current = false;
    }
  };

  // Güvenli şarkı değiştirme fonksiyonu
  const changeSongSafely = async (song: Song, index: number) => {
    console.log('🔄 Şarkı değiştiriliyor:', song.title);

    // Fade out ile mevcut şarkıyı durdur
    fadeOut(() => {
      // Mevcut player'ı güvenli şekilde durdur
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (error) {
          console.warn('Audio durdurma hatası:', error);
        }
      }

      if (playerRef.current) {
        try {
          if (typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
          }
          if (typeof playerRef.current.clearVideo === 'function') {
            playerRef.current.clearVideo();
          }
        } catch (error) {
          console.warn('YouTube durdurma hatası:', error);
        }
      }

      // State'leri güncelle
      setProgress(0);
      setDuration(0);

      // Şarkının dil bilgisini tespit et ve ekle
      if (!song.language || song.language === 'auto') {
        song.language = detectSongLanguage(song.title, song.artist);
        console.log(`🌍 Dil tespit edildi: ${song.language} - "${song.title}"`);
      }

      setCurrentSong(song);
      setCurrentIndex(index);

      // YouTube video ID'sini audioUrl olarak ayarla
      const isYouTubeVideo = Boolean(song.id && !song.id.startsWith('http'));
      setIsYouTube(isYouTubeVideo);

      // Eğer YouTube video ise audioUrl'i video ID olarak ayarla
      if (isYouTubeVideo) {
        song.audioUrl = song.id;
      }

      console.log('🎬 YouTube video çalınacak:', song.id, 'Title:', song.title);

      // LocalStorage'ı güncelle
      localStorage.setItem('current-song', JSON.stringify(song));
      localStorage.setItem('current-song-id', song.id);
      localStorage.setItem('current-index', index.toString());
      localStorage.setItem('is-playing', 'true');

      // Playlist sayfasına şarkı değişikliğini bildir - ORİJİNAL ID ile
      window.dispatchEvent(new CustomEvent('songChanged', {
        detail: {
          ...song,
          // Playlist'te vurgulanması için orijinal bilgileri gönder
          originalId: song.id, // Orijinal playlist ID'si
          playlistTitle: song.title, // Orijinal playlist başlığı
          playlistArtist: song.artist // Orijinal playlist sanatçısı
        }
      }));

      // Recently played garanti: next/prev ile değişince de yaz
      try {
        libraryManager.addToRecentlyPlayed(song.id);
      } catch {}

      // Kısa bir gecikme sonra çalmaya başla
      setTimeout(() => {
        setIsPlaying(true);

        // Play state değişikliğini bildir
        window.dispatchEvent(new CustomEvent('playStateChanged', {
          detail: { isPlaying: true }
        }));

        console.log('✅ Şarkı değiştirildi:', song.title);
        console.log('🎬 AudioURL:', song.audioUrl, 'IsYouTube:', isYouTubeVideo);
      }, 100);
    });
  };


  const playPrevious = async () => {
    if (!mounted) return;
    const now = Date.now();
    if (transitionLockRef.current || isTransitioning) return;
    if (now - lastNavActionAtRef.current < 250) return; // debounce
    lastNavActionAtRef.current = now;
    transitionLockRef.current = true;

    console.log('⏮️ Önceki şarkı');
    console.log('📊 Queue:', queue.length, 'Index:', currentIndex);
    console.log('🌍 Dil tercihleri:', languagePreferences);

    try {
      // Mevcut şarkının dilini tespit et
      const currentSong = queue[currentIndex];
      let targetLanguage: SongLanguage = 'auto';

      if (currentSong) {
        const currentLanguage = currentSong.language || detectSongLanguage(currentSong.title, currentSong.artist);

        // Dil tercihlerine göre hedef dili belirle
        if (languagePreferences.mixLanguages) {
          targetLanguage = 'auto'; // Karışık mod
        } else if (languagePreferences.smartLanguageMode) {
          targetLanguage = currentLanguage; // Akıllı mod - mevcut şarkının dili
        } else {
          targetLanguage = languagePreferences.preferredLanguage; // Sabit tercih
        }

        console.log(`🎯 Hedef dil: ${targetLanguage} (mevcut: ${currentLanguage})`);
      }

      if (currentIndex > 0) {
        const previousSongs = queue.slice(0, currentIndex);

        if (targetLanguage === 'auto' || languagePreferences.mixLanguages) {
          // Karışık mod - önceki şarkıyı çal
          const prevIndex = currentIndex - 1;
          const prevSong = queue[prevIndex];
          console.log('🎵 Önceki şarkı (karışık mod):', prevSong.title);

          await changeSongSafely(prevSong, prevIndex);
          return;
        } else {
          // Dil filtrelemesi yap
          const sameLangSongs = filterSongsByLanguage(previousSongs, targetLanguage);

          if (sameLangSongs.length > 0) {
            // Aynı dilde en son şarkıyı bul
            const prevSong = sameLangSongs[sameLangSongs.length - 1];
            const prevIndex = queue.findIndex((song, idx) => idx < currentIndex && song.id === prevSong.id);
            console.log(`🎵 Aynı dilde önceki şarkı (${targetLanguage}):`, prevSong.title);

            await changeSongSafely(prevSong, prevIndex);
            return;
          } else {
            // Aynı dilde şarkı yok, bir önceki şarkıyı çal
            const prevIndex = currentIndex - 1;
            const prevSong = queue[prevIndex];
            console.log('🎵 Önceki şarkı (farklı dil):', prevSong.title);

            await changeSongSafely(prevSong, prevIndex);
            return;
          }
        }
      } else if (repeatMode === 'all' && queue.length > 0) {
        if (targetLanguage === 'auto' || languagePreferences.mixLanguages) {
          // Karışık mod - son şarkıyı çal
          const lastIndex = queue.length - 1;
          const lastSong = queue[lastIndex];
          console.log('🔄 Son şarkı (karışık mod):', lastSong.title);

          await changeSongSafely(lastSong, lastIndex);
          return;
        } else {
          // Aynı dilde son şarkıyı ara
          const sameLangSongs = filterSongsByLanguage(queue, targetLanguage);

          if (sameLangSongs.length > 0) {
            const lastSameLangSong = sameLangSongs[sameLangSongs.length - 1];
            const lastIndex = queue.findIndex(song => song.id === lastSameLangSong.id);
            console.log(`🔄 Son şarkı (aynı dil - ${targetLanguage}):`, lastSameLangSong.title);

            await changeSongSafely(lastSameLangSong, lastIndex);
            return;
          } else {
            // Aynı dilde şarkı yok, son şarkıyı çal
            const lastIndex = queue.length - 1;
            const lastSong = queue[lastIndex];
            console.log('🔄 Son şarkı (playlist):', lastSong.title);

            await changeSongSafely(lastSong, lastIndex);
            return;
          }
        }
      }
    } catch (error) {
      console.error('❌ playPrevious hatası:', error);
      setIsPlaying(false);
    } finally {
      transitionLockRef.current = false;
    }
  };

  const togglePlay = () => {
    if (!mounted || !currentSong.audioUrl) return;

    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    console.log('⏯️ Toggle play:', newIsPlaying);

    if (isYouTube && playerRef.current) {
      try {
        if (newIsPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.warn('YouTube toggle hatası:', error);
      }
    }

    // Play state değişikliğini bildir
    window.dispatchEvent(new CustomEvent('playStateChanged', {
      detail: { isPlaying: newIsPlaying }
    }));

    // Now playing güncelle
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        if (newIsPlaying) {
          updateNowPlaying(userData.id, currentSong, progress, duration, true);
        } else {
          // Pause durumunda da güncelle ama isPlaying false
          updateNowPlaying(userData.id, currentSong, progress, duration, false);
        }
      }
    } catch (error) {
      console.error('Now playing toggle error:', error);
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
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />

      {isYouTube && mounted && (
        <YouTubePlayer
          key={currentSong.audioUrl} // Video ID değiştiğinde yeni player oluştur
          videoId={currentSong.audioUrl}
          isPlaying={isPlaying}
          volume={volume}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          isDataSaver={isDataSaver}
        />
      )}

      {/* Full Screen Player Overlay */}
      <FullScreenPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        volume={volume}
        queue={queue}
        currentIndex={currentIndex}
        isShuffling={isShuffling}
        repeatMode={repeatMode}
        isFavorite={isFavorite}
        onPlayPause={togglePlay}
        onNext={playNext}
        onPrevious={playPrevious}
        onSeek={handleProgressChange}
        onVolumeChange={handleVolumeChange}
        onToggleShuffle={toggleShuffle}
        onToggleRepeat={toggleRepeat}
        onToggleFavorite={toggleFavorite}
        onClose={() => setIsFullScreen(false)}
        onPlayQueueItem={(index) => {
          changeSongSafely(queue[index], index);
        }}
        isVisible={isFullScreen}
      />

      {/* Desktop Player */}
      <footer className="hidden lg:flex items-center justify-between glass-card border-t border-white/10 px-4 py-3 backdrop-blur-xl bg-black/90 z-40">
        {/* Sol: Playback Kontrolleri */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            className="h-9 w-9 text-gray-400 hover:text-white transition-colors"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-10 w-10 text-white hover:text-purple-400 transition-colors"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            className="h-9 w-9 text-gray-400 hover:text-white transition-colors"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
          <span className="text-xs text-gray-400 ml-2 min-w-[80px]">{formatTime(progress)} / {formatTime(duration)}</span>
        </div>

        {/* Orta: Şarkı Bilgisi ve Progress Bar */}
        <div className="flex-1 mx-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={() => setIsFullScreen(true)}>
            {currentSong.imageUrl ? (
              <Image
                src={imgSrc || currentSong.imageUrl}
                alt={currentSong.title}
                width={48}
                height={48}
                className="rounded"
                onError={handleImageError}
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">
                <Music className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">{currentSong.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
          </div>
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={duration || 100}
            step={1}
            className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-white"
          />
        </div>

        {/* Sağ: Diğer Kontroller */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn("h-9 w-9 text-gray-400 hover:text-white transition-colors", isFavorite && "text-red-500")}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={cn("h-9 w-9 text-gray-400 hover:text-white transition-colors", isShuffling && "text-purple-400")}
          >
            <Shuffle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={cn("h-9 w-9 text-gray-400 hover:text-white transition-colors relative", repeatMode !== 'off' && "text-purple-400")}
          >
            <Repeat className="h-5 w-5" />
            {repeatMode === 'one' && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-purple-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center font-bold">1</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDataSaver}
            className={cn("h-9 w-9 text-gray-400 hover:text-white transition-colors", isDataSaver && "text-green-400")}
          >
            {isDataSaver ? <SignalLow className="h-5 w-5" /> : <Signal className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 ml-2 w-[110px]">
            <Volume2 className="h-5 w-5 text-gray-400" />
            <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} className="[&>span:first-child]:h-1.5" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(true)}
            className="h-9 w-9 text-gray-400 hover:text-white transition-colors"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-400 hover:text-white transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </footer>

      {/* Mobile Player & Nav */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 bg-black/90 backdrop-blur-xl z-30">
        <div className="flex items-center justify-between w-full px-4 py-3">
          {/* Tıklanabilir Alan - Albüm Kapağı ve Şarkı Bilgisi */}
          <div 
            className="flex items-center flex-1 min-w-0 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setIsFullScreen(true)}
          >
            {currentSong.imageUrl ? (
              <Image
                src={imgSrc || currentSong.imageUrl}
                alt={currentSong.title}
                width={56}
                height={56}
                className="rounded-lg"
                onError={handleImageError}
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div className="flex-1 mx-4 min-w-0">
              <p className="font-semibold text-base truncate text-white">{currentSong.title}</p>
              <p className="text-sm text-gray-400 truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Şarkı Kontrolleri - Sadece Play ve Next */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:text-purple-400 transition-colors w-12 h-12"
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              className="text-white hover:text-purple-400 transition-colors w-12 h-12"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
}
