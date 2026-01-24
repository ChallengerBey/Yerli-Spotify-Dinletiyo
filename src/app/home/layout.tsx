"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Player } from '@/components/layout/player';
import { ThemeProvider } from '@/components/theme/theme-provider';

import AuthGuard from '@/components/auth-guard';
import { useEffect, useState } from 'react';
import { NotificationListener } from '@/components/social/notification-listener';
import { Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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
      } catch (e) {
        console.error('User parse error in Layout:', e);
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
        
        if (savedSong) {
          const song = JSON.parse(savedSong);
          setCurrentSong(song);
        }
        
        setIsPlaying(savedIsPlaying === 'true');
      } catch (e) {
        console.error('Player state sync error:', e);
      }
    };

    updatePlayerState();
    
    // Storage değişikliklerini dinle
    window.addEventListener('storage', updatePlayerState);
    
    // Custom event'leri dinle
    const handlePlaySong = (event: any) => {
      const song = event.detail;
      setCurrentSong(song);
      setIsPlaying(true);
    };

    window.addEventListener('playSong', handlePlaySong);
    
    return () => {
      window.removeEventListener('storage', updatePlayerState);
      window.removeEventListener('playSong', handlePlaySong);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  const toggleMiniPlayer = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
      localStorage.setItem('is-playing', (!isPlaying).toString());
      
      // Player'a play/pause sinyali gönder
      const event = new CustomEvent('togglePlay');
      window.dispatchEvent(event);
    }
  };

  return (
    <AuthGuard>
      <ThemeProvider>
        <div className="flex h-screen w-full flex-col lg:flex-row">
          {/* Sidebar - Tam ekranda gizle */}
          {!isFullscreen && <Sidebar />}
          {!isFullscreen && <MobileNav user={user} onLogout={handleLogout} />}
          <div className={`flex flex-col flex-1 min-h-0 ${isFullscreen ? '' : 'pt-16 lg:pt-0 pb-20 lg:pb-0'}`}>
            <main className={`flex-1 overflow-y-auto ${isFullscreen ? 'p-0' : 'p-4 sm:p-6 lg:p-8 lg:p-10 lg:pb-28'}`}>
              {children}
            </main>
            {/* Player - Her zaman render et ama tam ekranda gizle */}
            <div className={isFullscreen ? 'hidden' : ''}>
              <Player />
            </div>
            
            {/* Mini Player - Sadece tam ekranda göster */}
            {isFullscreen && currentSong && (
              <div className="fixed bottom-4 right-4 z-50">
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
                    <button 
                      onClick={toggleMiniPlayer}
                      className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
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
              </div>
            )}
          </div>
          {!isFullscreen && <BottomNav />}
          <NotificationListener currentUserId={userId} />
          <Toaster position="top-right" richColors theme="dark" />
        </div>
      </ThemeProvider>
    </AuthGuard>
  );
}
