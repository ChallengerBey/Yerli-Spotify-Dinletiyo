'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleProvider } from '@/lib/firebase';

interface SongInfo {
  title: string;
  artist: string;
  imageUrl?: string;
}

export function AuthPromptModal() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [song, setSong] = useState<SongInfo | null>(null);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const u = result.user;
      const userData = {
        id: u.uid,
        email: u.email || '',
        username: u.displayName || (u.email ? u.email.split('@')[0] : 'Kullanıcı'),
        avatar: u.photoURL || undefined,
        provider: 'google',
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('rememberMe', 'true');
      setVisible(false);
      router.push('/home');
    } catch {
      setVisible(false);
      router.push('/login');
    }
  };

  useEffect(() => {
    const handleShowModal = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSong({
        title: detail?.title || 'Şarkı',
        artist: detail?.artist || '',
        imageUrl: detail?.imageUrl || detail?.thumbnail || '',
      });
      setVisible(true);
    };

    window.addEventListener('showAuthModal', handleShowModal);
    return () => window.removeEventListener('showAuthModal', handleShowModal);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={() => setVisible(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col sm:flex-row"
        style={{ background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 40%, #1a1a1a 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Sol: Şarkı kapağı */}
        <div className="sm:w-56 sm:h-56 w-full h-48 flex-shrink-0 relative bg-black/40">
          {song?.imageUrl ? (
            <Image
              src={song.imageUrl}
              alt={song.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🎵</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a0000] hidden sm:block" />
        </div>

        {/* Sağ: İçerik */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 gap-4">
          <div>
            <p className="text-white/60 text-sm mb-1">Dinlemek için giriş yap</p>
            <h2 className="text-white text-2xl font-bold leading-tight">
              {song?.title}
            </h2>
            {song?.artist && (
              <p className="text-white/70 text-sm mt-1">{song.artist}</p>
            )}
          </div>

          <p className="text-white/80 text-base font-medium">
            Ücretsiz bir Dinletiyo hesabıyla dinlemeye başla
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setVisible(false); router.push('/signup'); }}
              className="w-full py-3 rounded-full font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(90deg, #dc2626, #991b1b)' }}
            >
              Ücretsiz kaydol
            </button>
            <button
              onClick={() => { setVisible(false); router.push('/login'); }}
              className="w-full py-3 rounded-full font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-all active:scale-95"
            >
              Giriş yap
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => { setVisible(false); handleGoogleLogin(); }}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-white/90 text-xs hover:bg-white/15 hover:border-white/35 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google ile giriş yap
            </button>
            <p className="text-white/40 text-xs">
              Zaten hesabın var mı?{' '}
              <button
                onClick={() => { setVisible(false); router.push('/login'); }}
                className="text-white/70 underline hover:text-white transition-colors"
              >
                Oturum aç
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
