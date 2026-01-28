"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Player } from '@/components/layout/player';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { analytics } from '@/lib/analytics';
import { GlobalContextMenu } from '@/components/global-context-menu';

import AuthGuard from '@/components/auth-guard';
import { useEffect, useState } from 'react';
import { NotificationListener } from '@/components/social/notification-listener';
import { ToastListener } from '@/components/toast-listener';
import { SongInfoListener } from '@/components/song-info-listener';
import { MusicFeaturesListener } from '@/components/music-features-listener';
import { FilterNotification } from '@/components/filter-notification';
import { Toaster } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

interface LoggedInUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface CurrentSong {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  audioUrl?: string;
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState('1');
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const [miniPlayerRef, setMiniPlayerRef] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // User state'ini yükle ve analytics tracking başlat
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUserId(userData.id);
        setUser({
          id: userData.id,
          username: userData.username || 'Kullanıcı',
          email: userData.email || '',
          avatar: userData.avatar
        });
        
        // Analytics: Sayfa görüntüleme
        analytics.trackPageView(pathname, userData.id);
        
        // Analytics: Kullanıcı aktifliği (her 5 dakikada bir)
        const activityInterval = setInterval(() => {
          analytics.track({
            event: 'user_activity',
            userId: userData.id,
            data: { page: pathname }
          });
        }, 300000); // 5 dakika
        
        return () => clearInterval(activityInterval);
      } catch (e) {
        console.error('User parse error in Layout:', e);
      }
    } else {
      // Anonim kullanıcı için sayfa görüntüleme
      analytics.trackPageView(pathname);
      
      // Anonim kullanıcı aktivitesi
      const anonActivityInterval = setInterval(() => {
        analytics.track({
          event: 'anonymous_activity',
          data: { page: pathname }
        });
      }, 300000);
      
      return () => clearInterval(anonActivityInterval);
    }
  }, [pathname]);

  // Volume state'ini localStorage'dan yükle
  useEffect(() => {
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) {
      const vol = parseInt(savedVolume);
      if (!isNaN(vol) && vol >= 0 && vol <= 100) {
        setVolume(vol);
        setIsMuted(vol === 0);
      }
    }
  }, []);

  // Fullscreen değişikliklerini dinle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Player durumunu dinle
  useEffect(() => {
    const updatePlayerState = () => {
      try {
        const savedSong = localStorage.getItem('current-song');
        const savedIsPlaying = localStorage.getItem('is-playing');
        const savedProgress = localStorage.getItem('current-progress');
        const savedDuration = localStorage.getItem('current-duration');
        const savedIsYouTube = localStorage.getItem('is-youtube');
        
        if (savedSong) {
          const song = JSON.parse(savedSong);
          setCurrentSong(song);
          setIsYouTube(savedIsYouTube === 'true');
        }
        
        setIsPlaying(savedIsPlaying === 'true');
        
        if (savedProgress) {
          const prog = parseFloat(savedProgress);
          if (!isNaN(prog)) setProgress(prog);
        }
        
        if (savedDuration) {
          const dur = parseFloat(savedDuration);
          if (!isNaN(dur)) setDuration(dur);
        }
      } catch (e) {
        console.error('Player state sync error:', e);
      }
    };

    updatePlayerState();
    
    // Storage değişikliklerini dinle
    window.addEventListener('storage', updatePlayerState);
    
    // Progress güncellemelerini dinle
    const handleProgressUpdate = (event: any) => {
      const { progress: newProgress, duration: newDuration } = event.detail;
      if (!isNaN(newProgress)) setProgress(newProgress);
      if (!isNaN(newDuration)) setDuration(newDuration);
    };
    
    // Custom event'leri dinle
    const handlePlaySong = (event: any) => {
      const song = event.detail;
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
      setDuration(0);
      setIsYouTube(Boolean(song.audioUrl && !song.audioUrl.startsWith('http')));
    };

    const handleTogglePlayEvent = () => {
      setIsPlaying(prev => {
        const newState = !prev;
        localStorage.setItem('is-playing', newState.toString());
        return newState;
      });
    };

    const handleSetVolumeEvent = (event: any) => {
      const newVolume = Math.max(0, Math.min(100, Math.round(event.detail * 100)));
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    };

    const handleToggleMuteEvent = () => {
      handleToggleMute();
    };

    window.addEventListener('playSong', handlePlaySong);
    window.addEventListener('togglePlay', handleTogglePlayEvent);
    window.addEventListener('setVolume', handleSetVolumeEvent);
    window.addEventListener('toggleMute', handleToggleMuteEvent);
    window.addEventListener('progressUpdate', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('storage', updatePlayerState);
      window.removeEventListener('playSong', handlePlaySong);
      window.removeEventListener('togglePlay', handleTogglePlayEvent);
      window.removeEventListener('setVolume', handleSetVolumeEvent);
      window.removeEventListener('toggleMute', handleToggleMuteEvent);
      window.removeEventListener('progressUpdate', handleProgressUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  const handleSetVolume = (newVolume: number) => {
    const volumeValue = Math.max(0, Math.min(100, Math.round(newVolume)));
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
    
    // Volume event'ini player'a ilet (0-1 arası değer)
    const volumeEvent = new CustomEvent('playerSetVolume', { detail: volumeValue / 100 });
    window.dispatchEvent(volumeEvent);
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      setVolume(0);
    } else {
      setVolume(50); // Unmute olduğunda %50'ye ayarla
    }
    
    // Mute event'ini player'a ilet
    const muteEvent = new CustomEvent('playerToggleMute');
    window.dispatchEvent(muteEvent);
  };

  const toggleMiniPlayer = () => {
    if (!currentSong || !currentSong.audioUrl) return;
    
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem('is-playing', newState.toString());
    
    // Tam ekrandayken direkt kontrol et
    if (isFullscreen) {
      if (isYouTube) {
        // YouTube için iframe API kullan
        const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          if (newState) {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } else {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        }
      } else {
        // Normal audio için
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          if (newState) {
            audio.play().catch(e => console.warn('Audio play failed:', e));
          } else {
            audio.pause();
          }
        });
      }
    }
    
    // Ana player'a da sinyal gönder
    const event = new CustomEvent('togglePlay');
    window.dispatchEvent(event);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newProgress = (clickX / rect.width) * duration;
      
      // Player'a seek sinyali gönder
      const seekEvent = new CustomEvent('seekTo', { detail: newProgress });
      window.dispatchEvent(seekEvent);
    }
  };

  // Mini player için audio/video kontrolü
  useEffect(() => {
    if (isFullscreen && miniPlayerRef && currentSong && currentSong.audioUrl) {
      if (miniPlayerRef.tagName === 'AUDIO') {
        // Audio element için
        miniPlayerRef.volume = volume / 100;
        
        if (isPlaying) {
          miniPlayerRef.play().catch((e: any) => console.warn('Mini audio play failed:', e));
        } else {
          miniPlayerRef.pause();
        }
      }
    }
  }, [isFullscreen, miniPlayerRef, currentSong, isPlaying, volume]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <AuthGuard>
      <ThemeProvider>
        <div className="flex h-screen w-full flex-col lg:flex-row">
          {/* Sidebar - Tam ekranda gizle */}
          {!isFullscreen && <Sidebar />}
          {!isFullscreen && <MobileNav user={user} onLogout={handleLogout} />}
          <div className={`flex flex-col flex-1 min-h-0 ${isFullscreen ? '' : 'pt-16 lg:pt-0 pb-20 lg:pb-0'}`}>
            <main className={`flex-1 overflow-y-auto ${isFullscreen ? 'p-0' : 'p-4 sm:p-6 lg:p-8 lg:p-10 lg:pb-28'} ${!isFullscreen ? 'pt-0' : ''}`}>
              {children}
            </main>
            
            {/* Player - Her zaman render et ama tam ekranda gizle */}
            <div className={isFullscreen ? 'hidden' : ''}>
              <Player />
            </div>
            
            {/* Mini Player - Sadece tam ekranda göster */}
            {isFullscreen && currentSong && (
              <div className="fixed bottom-4 right-4 z-50">
                {/* Gizli Audio/Video Element - Mini Player için */}
                {isYouTube ? (
                  <iframe
                    ref={(ref) => setMiniPlayerRef(ref)}
                    src={`https://www.youtube.com/embed/${currentSong.audioUrl}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&cc_load_policy=0&iv_load_policy=3&autohide=1&loop=1&playlist=${currentSong.audioUrl}`}
                    style={{ display: 'none' }}
                    allow="autoplay; encrypted-media"
                  />
                ) : currentSong.audioUrl && currentSong.audioUrl.startsWith('http') ? (
                  <audio
                    ref={(ref) => setMiniPlayerRef(ref)}
                    src={currentSong.audioUrl || ''}
                    style={{ display: 'none' }}
                    onTimeUpdate={(e: React.SyntheticEvent<HTMLAudioElement>) => {
                      const audio = e.target as HTMLAudioElement;
                      setProgress(audio.currentTime);
                      setDuration(audio.duration || 0);
                    }}
                    onLoadedMetadata={(e: React.SyntheticEvent<HTMLAudioElement>) => {
                      const audio = e.target as HTMLAudioElement;
                      setDuration(audio.duration || 0);
                    }}
                  />
                ) : null}
                
                <div className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 w-80">
                  <div className="flex items-center gap-3">
                    {currentSong.imageUrl ? (
                      <Image
                        src={currentSong.imageUrl}
                        alt={currentSong.title}
                        width={48}
                        height={48}
                        className="rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{currentSong.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
                    </div>
                    
                    {/* Ses Kontrolü */}
                    <div className="flex items-center gap-2">
                      {/* Volume Slider */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleToggleMute}
                          className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
                          title="Ses aç/kapat"
                        >
                          {isMuted || volume === 0 ? (
                            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isNaN(volume) ? 50 : volume}
                          className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          onChange={(e) => {
                            const newVolume = parseInt(e.target.value);
                            handleSetVolume(newVolume);
                            
                            // Mini player'ın ses seviyesini ayarla
                            if (miniPlayerRef) {
                              if (miniPlayerRef.tagName === 'AUDIO') {
                                miniPlayerRef.volume = newVolume / 100;
                              }
                            }
                          }}
                          title="Ses seviyesi"
                        />
                      </div>
                      
                      {/* Play/Pause Button */}
                      <button 
                        onClick={() => {
                          const newState = !isPlaying;
                          setIsPlaying(newState);
                          localStorage.setItem('is-playing', newState.toString());
                          
                          // Mini player'ı kontrol et
                          if (miniPlayerRef) {
                            if (miniPlayerRef.tagName === 'AUDIO') {
                              if (newState) {
                                miniPlayerRef.play().catch((e: any) => console.warn('Mini audio play failed:', e));
                              } else {
                                miniPlayerRef.pause();
                              }
                            } else if (miniPlayerRef.tagName === 'IFRAME') {
                              // YouTube iframe kontrolü
                              if (newState) {
                                miniPlayerRef.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                              } else {
                                miniPlayerRef.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                              }
                            }
                          }
                          
                          // Ana player'a da sinyal gönder
                          const event = new CustomEvent('togglePlay');
                          window.dispatchEvent(event);
                        }}
                        className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
                        title={isPlaying ? "Duraklat" : "Oynat"}
                      >
                        {isPlaying ? (
                          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div 
                      className="w-full bg-gray-200 rounded-full h-1 cursor-pointer"
                      onClick={handleProgressClick}
                    >
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {!isFullscreen && <BottomNav />}
          <NotificationListener currentUserId={userId} />
          <ToastListener />
          <SongInfoListener />
          <MusicFeaturesListener />
          <FilterNotification />
          <Toaster position="top-right" richColors theme="dark" />
          <GlobalContextMenu />
        </div>
      </ThemeProvider>
    </AuthGuard>
  );
}
