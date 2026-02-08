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
    console.log('🔐 AuthGuard: Kullanıcı kontrolü başlıyor...');
    
    // Tüm localStorage ve sessionStorage'ı kontrol et
    const localUser = localStorage.getItem('currentUser');
    const sessionUser = sessionStorage.getItem('currentUser');
    
    console.log('👤 AuthGuard: localStorage currentUser:', localUser ? 'VAR' : 'YOK');
    console.log('👤 AuthGuard: sessionStorage currentUser:', sessionUser ? 'VAR' : 'YOK');
    
    let currentUser = localUser || sessionUser;
    
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        console.log('✅ AuthGuard: Kullanıcı doğrulandı:', userData);
        
        // Demo kullanıcı kontrolü - demo kullanıcıları reddet
        if (userData.isDemo || userData.email === 'demo@dinletiyo.com' || userData.id?.includes('demo-user')) {
          console.log('🚫 AuthGuard: Demo kullanıcı tespit edildi, temizleniyor...');
          localStorage.removeItem('currentUser');
          sessionStorage.removeItem('currentUser');
          router.replace('/unauthorized');
          setLoading(false);
          return;
        }
        
        setIsAuth(true);
        // Eğer localStorage'da varsa, sessionStorage'a da kopyala (aktif oturum için)
        if (localStorage.getItem('currentUser')) {
          sessionStorage.setItem('currentUser', currentUser);
        }
      } catch (error) {
        console.error('❌ AuthGuard: Kullanıcı parse hatası:', error);
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        router.replace('/unauthorized');
      }
    } else {
      console.log('🚫 AuthGuard: Kullanıcı bulunamadı, unauthorized\'a yönlendiriliyor...');
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
