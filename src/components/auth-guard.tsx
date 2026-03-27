'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-white text-lg">Yükleniyor...</p>
    </div>
  );
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tüm localStorage ve sessionStorage'ı kontrol et
    const localUser = localStorage.getItem('currentUser');
    const sessionUser = sessionStorage.getItem('currentUser');
    let currentUser = localUser || sessionUser;
    
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        
        setIsAuth(true);
        // Eğer localStorage'da varsa, sessionStorage'a da kopyala (aktif oturum için)
        if (localStorage.getItem('currentUser')) {
          sessionStorage.setItem('currentUser', currentUser);
        }
      } catch (error) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        router.replace('/unauthorized');
      }
    } else {
      router.replace('/unauthorized');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuth) {
    return <>{children}</>;
  }

  return null;
}
