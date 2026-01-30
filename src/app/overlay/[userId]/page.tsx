'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Settings, X, Palette, Move, Maximize2, Eye } from 'lucide-react';

interface NowPlaying {
  song_id: string;
  song_title: string;
  song_artist: string;
  song_image_url: string;
  progress: number;
  duration: number;
  is_playing: boolean;
}

type OverlayTheme = 'modern' | 'minimal' | 'gaming' | 'neon' | 'classic' | 'transparent';
type OverlayPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
type OverlaySize = 'small' | 'medium' | 'large';

export default function OverlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  
  // Ayarlar state'i
  const [theme, setTheme] = useState<OverlayTheme>((searchParams.get('theme') as OverlayTheme) || 'modern');
  const [position, setPosition] = useState<OverlayPosition>((searchParams.get('position') as OverlayPosition) || 'bottom-left');
  const [size, setSize] = useState<OverlaySize>((searchParams.get('size') as OverlaySize) || 'medium');
  const [opacity, setOpacity] = useState(Math.min(100, Math.max(10, parseInt(searchParams.get('opacity') || '95'))));
  const [showProgress, setShowProgress] = useState(searchParams.get('progress') !== 'false');
  const [showArtwork, setShowArtwork] = useState(searchParams.get('artwork') !== 'false');
  const [showBranding, setShowBranding] = useState(searchParams.get('branding') !== 'false');
  
  // Overlay state'i
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Demo mode için test şarkısı
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoSong: NowPlaying = {
    song_id: 'demo',
    song_title: 'Overlay Önizleme Şarkısı',
    song_artist: 'Dinletiyo Demo',
    song_image_url: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    progress: 45,
    duration: 180,
    is_playing: true
  };

  useEffect(() => {
    const checkNowPlaying = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.host}`
          : '';
        
        const response = await fetch(`${baseUrl}/api/now-playing?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.nowPlaying && data.nowPlaying.is_playing) {
          setNowPlaying(data.nowPlaying);
          setIsVisible(true);
          setError(null);
          setIsDemoMode(false);
        } else {
          setIsVisible(false);
          setNowPlaying(null);
        }
      } catch (error: any) {
        console.error('Now playing fetch error:', error);
        setError(error.message);
        setIsVisible(false);
        setNowPlaying(null);
      }
    };

    checkNowPlaying();
    const interval = setInterval(checkNowPlaying, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  // URL'i güncelle
  const updateURL = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams({
        theme,
        position,
        size,
        opacity: opacity.toString(),
        progress: showProgress.toString(),
        artwork: showArtwork.toString(),
        branding: showBranding.toString()
      });
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Ayar değiştiğinde URL'i güncelle
  useEffect(() => {
    updateURL();
  }, [theme, position, size, opacity, showProgress, showArtwork, showBranding]);

  if (process.env.NODE_ENV === 'development' && error && !isDemoMode) {
    return (
      <div className="fixed top-4 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
        <h3 className="font-bold mb-2">Overlay Debug</h3>
        <p className="text-sm mb-2">User ID: {userId}</p>
        <p className="text-sm mb-2">Theme: {theme}</p>
        <p className="text-sm mb-2">Position: {position}</p>
        <p className="text-sm mb-2">Error: {error}</p>
        <button 
          onClick={() => setIsDemoMode(true)}
          className="mt-2 px-3 py-1 bg-blue-500 rounded text-sm"
        >
          Demo Moduna Geç
        </button>
      </div>
    );
  }

  const currentSong = isDemoMode ? demoSong : nowPlaying;
  const shouldShow = isDemoMode || (isVisible && nowPlaying);

  if (!shouldShow) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black/20">
        <div className="text-center p-8 bg-black/50 rounded-lg backdrop-blur-sm">
          <h2 className="text-white text-xl mb-4">Overlay Hazır!</h2>
          <p className="text-white/80 mb-4">Şarkı çalmaya başladığınızda overlay görünecek.</p>
          <button 
            onClick={() => setIsDemoMode(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Demo Modunu Aç
          </button>
        </div>
      </div>
    );
  }

  // Progress hesaplama
  const progressPercentage = currentSong.duration > 0 
    ? Math.min(100, Math.max(0, (currentSong.progress / currentSong.duration) * 100))
    : 0;

  // Süre formatı
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTime = currentSong.duration > 0 
    ? (currentSong.progress / currentSong.duration) * currentSong.duration
    : 0;

  // Pozisyon sınıfları
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left': return 'bottom-8 left-8';
      case 'bottom-right': return 'bottom-8 right-8';
      case 'top-left': return 'top-8 left-8';
      case 'top-right': return 'top-8 right-8';
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default: return 'bottom-8 left-8';
    }
  };

  // Boyut sınıfları
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'min-w-[400px] max-w-[500px]';
      case 'medium': return 'min-w-[600px] max-w-[800px]';
      case 'large': return 'min-w-[800px] max-w-[1000px]';
      default: return 'min-w-[600px] max-w-[800px]';
    }
  };

  // Tema stilleri
  const getThemeStyles = () => {
    const baseOpacity = opacity / 100;
    
    switch (theme) {
      case 'modern':
        return {
          container: `bg-white backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-black/10`,
          opacity: baseOpacity,
          textPrimary: 'text-black',
          textSecondary: 'text-gray-600',
          textBrand: 'text-gray-500',
          progressBg: 'bg-gray-200',
          progressFill: 'bg-gradient-to-r from-purple-500 to-pink-500',
          iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
        };
      
      case 'minimal':
        return {
          container: `bg-black/80 backdrop-blur-sm rounded-lg border border-white/20`,
          opacity: baseOpacity,
          textPrimary: 'text-white',
          textSecondary: 'text-gray-300',
          textBrand: 'text-gray-400',
          progressBg: 'bg-white/20',
          progressFill: 'bg-white',
          iconBg: 'bg-white/20'
        };
      
      case 'gaming':
        return {
          container: `bg-gradient-to-r from-green-900/90 to-blue-900/90 backdrop-blur-xl rounded-xl border-2 border-green-400/50 shadow-lg shadow-green-400/20`,
          opacity: baseOpacity,
          textPrimary: 'text-green-100',
          textSecondary: 'text-green-200',
          textBrand: 'text-green-400',
          progressBg: 'bg-green-900/50',
          progressFill: 'bg-gradient-to-r from-green-400 to-blue-400',
          iconBg: 'bg-gradient-to-br from-green-400 to-blue-400'
        };
      
      case 'neon':
        return {
          container: `bg-black/90 backdrop-blur-xl rounded-2xl border-2 border-pink-500/50 shadow-lg shadow-pink-500/30`,
          opacity: baseOpacity,
          textPrimary: 'text-pink-100',
          textSecondary: 'text-pink-200',
          textBrand: 'text-pink-400',
          progressBg: 'bg-pink-900/30',
          progressFill: 'bg-gradient-to-r from-pink-500 to-cyan-500',
          iconBg: 'bg-gradient-to-br from-pink-500 to-cyan-500'
        };
      
      case 'classic':
        return {
          container: `bg-amber-50/95 backdrop-blur-sm rounded-lg border-2 border-amber-200`,
          opacity: baseOpacity,
          textPrimary: 'text-amber-900',
          textSecondary: 'text-amber-700',
          textBrand: 'text-amber-600',
          progressBg: 'bg-amber-200',
          progressFill: 'bg-gradient-to-r from-amber-500 to-orange-500',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500'
        };
      
      case 'transparent':
        return {
          container: `bg-black/20 backdrop-blur-md rounded-2xl border border-white/10`,
          opacity: baseOpacity,
          textPrimary: 'text-white drop-shadow-lg',
          textSecondary: 'text-white/80 drop-shadow-lg',
          textBrand: 'text-white/60 drop-shadow-lg',
          progressBg: 'bg-white/20',
          progressFill: 'bg-white/80',
          iconBg: 'bg-white/20'
        };
      
      default:
        return {
          container: `bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-black/10`,
          opacity: baseOpacity,
          textPrimary: 'text-black',
          textSecondary: 'text-gray-600',
          textBrand: 'text-gray-500',
          progressBg: 'bg-gray-200',
          progressFill: 'bg-gradient-to-r from-purple-500 to-pink-500',
          iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
        };
    }
  };

  const themeStyles = getThemeStyles();
  const artworkSize = size === 'small' ? 'w-16 h-16' : size === 'large' ? 'w-40 h-40' : 'w-32 h-32';
  const iconSize = size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-20 h-20' : 'w-16 h-16';
  const titleSize = size === 'small' ? 'text-xl' : size === 'large' ? 'text-4xl' : 'text-3xl';
  const artistSize = size === 'small' ? 'text-sm' : size === 'large' ? 'text-2xl' : 'text-xl';

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden">
      {/* Ayarlar Butonu */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 z-[10000] pointer-events-auto w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
        title="Overlay Ayarları"
      >
        <Settings className="w-5 h-5 text-white" />
      </button>

      {/* Ayarlar Paneli */}
      {showSettings && (
        <div className="fixed top-4 right-20 z-[10000] pointer-events-auto bg-black/90 backdrop-blur-xl rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Overlay Ayarları</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Tema */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm mb-2">
                <Palette className="w-4 h-4" />
                Tema
              </label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value as OverlayTheme)}
                className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-white/40"
              >
                <option value="modern" className="bg-gray-800 text-white">Modern (Beyaz)</option>
                <option value="minimal" className="bg-gray-800 text-white">Minimal (Siyah)</option>
                <option value="gaming" className="bg-gray-800 text-white">Gaming (Yeşil)</option>
                <option value="neon" className="bg-gray-800 text-white">Neon (Pembe)</option>
                <option value="classic" className="bg-gray-800 text-white">Klasik (Sarı)</option>
                <option value="transparent" className="bg-gray-800 text-white">Şeffaf</option>
              </select>
            </div>

            {/* Pozisyon */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm mb-2">
                <Move className="w-4 h-4" />
                Pozisyon
              </label>
              <select 
                value={position}
                onChange={(e) => setPosition(e.target.value as OverlayPosition)}
                className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-white/40"
              >
                <option value="bottom-left" className="bg-gray-800 text-white">Sol Alt</option>
                <option value="bottom-right" className="bg-gray-800 text-white">Sağ Alt</option>
                <option value="top-left" className="bg-gray-800 text-white">Sol Üst</option>
                <option value="top-right" className="bg-gray-800 text-white">Sağ Üst</option>
                <option value="center" className="bg-gray-800 text-white">Merkez</option>
              </select>
            </div>

            {/* Boyut */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm mb-2">
                <Maximize2 className="w-4 h-4" />
                Boyut
              </label>
              <select 
                value={size}
                onChange={(e) => setSize(e.target.value as OverlaySize)}
                className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-white/40"
              >
                <option value="small" className="bg-gray-800 text-white">Küçük</option>
                <option value="medium" className="bg-gray-800 text-white">Orta</option>
                <option value="large" className="bg-gray-800 text-white">Büyük</option>
              </select>
            </div>

            {/* Şeffaflık */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm mb-2">
                <Eye className="w-4 h-4" />
                Şeffaflık: %{opacity}
              </label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Seçenekler */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showProgress}
                  onChange={(e) => setShowProgress(e.target.checked)}
                  className="w-4 h-4 accent-purple-500" 
                />
                Progress Bar Göster
              </label>
              <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showArtwork}
                  onChange={(e) => setShowArtwork(e.target.checked)}
                  className="w-4 h-4 accent-purple-500" 
                />
                Albüm Kapağı Göster
              </label>
              <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showBranding}
                  onChange={(e) => setShowBranding(e.target.checked)}
                  className="w-4 h-4 accent-purple-500" 
                />
                Dinletiyo Logosu Göster
              </label>
            </div>

            {/* Demo Mode */}
            <div className="pt-2 border-t border-white/20">
              <button
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`w-full py-2 px-3 rounded-md text-sm transition-colors ${
                  isDemoMode 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                {isDemoMode ? '✅ Demo Modu Aktif' : '🎵 Demo Modunu Aç'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div 
        className={`absolute animate-slide-in z-50 ${getPositionClasses()}`}
        style={{ opacity: themeStyles.opacity }}
      >
        <div className={`${themeStyles.container} p-8 flex items-center gap-8 ${getSizeClasses()}`}>
          {/* Album Art */}
          {showArtwork && (
            <div className={`relative ${artworkSize} rounded-2xl overflow-hidden shadow-lg flex-shrink-0`}>
              {currentSong.song_image_url ? (
                <Image
                  src={currentSong.song_image_url}
                  alt={currentSong.song_title}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 ${themeStyles.iconBg} flex items-center justify-center`}>
                <svg className={`${size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-20 h-20' : 'w-16 h-16'} text-white`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
          )}

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            {showBranding && (
              <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${themeStyles.textBrand}`}>
                🎵 DİNLETİYO.COM
              </p>
            )}
            <h3 className={`${titleSize} font-bold truncate mb-2 leading-tight ${themeStyles.textPrimary}`}>
              {currentSong.song_title}
            </h3>
            <p className={`${artistSize} truncate mb-4 ${themeStyles.textSecondary}`}>
              {currentSong.song_artist && currentSong.song_artist !== 'YouTube' 
                ? currentSong.song_artist 
                : 'Bilinmeyen Sanatçı'}
            </p>

            {/* Progress Bar */}
            {showProgress && (
              <>
                <div className={`mt-4 w-full ${themeStyles.progressBg} rounded-full h-3 overflow-hidden shadow-inner`}>
                  <div 
                    className={`${themeStyles.progressFill} h-full rounded-full transition-all duration-300 shadow-sm`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                <div className={`flex justify-between text-sm mt-2 ${themeStyles.textSecondary}`}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentSong.duration)}</span>
                </div>
              </>
            )}
          </div>

          {/* Music Icon */}
          <div className="flex-shrink-0">
            <div className={`${iconSize} ${themeStyles.iconBg} rounded-full flex items-center justify-center animate-pulse shadow-lg`}>
              <svg className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-10 h-10' : 'w-8 h-8'} text-white`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}