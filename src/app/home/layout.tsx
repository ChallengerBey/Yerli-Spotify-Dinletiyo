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

interface LoggedInUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState('1');
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
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
            {!isFullscreen && <Player />}
          </div>
          {!isFullscreen && <BottomNav />}
          <NotificationListener currentUserId={userId} />
          <Toaster position="top-right" richColors theme="dark" />
        </div>
      </ThemeProvider>
    </AuthGuard>
  );
}
