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
    // Önce localStorage'dan kontrol et (Beni Hatırla için)
    let currentUser = localStorage.getItem('currentUser');
    
    // Eğer localStorage'da yoksa sessionStorage'dan kontrol et
    if (!currentUser) {
      currentUser = sessionStorage.getItem('currentUser');
    }
    
    if (currentUser) {
      setIsAuth(true);
      // Eğer localStorage'da varsa, sessionStorage'a da kopyala (aktif oturum için)
      if (localStorage.getItem('currentUser')) {
        sessionStorage.setItem('currentUser', currentUser);
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
