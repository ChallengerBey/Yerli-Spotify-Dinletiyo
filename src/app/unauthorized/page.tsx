'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();

  // Sayfa yüklendiğinde tüm kullanıcı verilerini temizle
  useEffect(() => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('current-song');
    localStorage.removeItem('is-playing');
    localStorage.removeItem('volume');
    console.log('🧹 Unauthorized page: Tüm kullanıcı verileri temizlendi');
  }, []);

  const clearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 Tüm localStorage ve sessionStorage temizlendi');
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-red-600">
          Heyy Yetkisiz Giriş
        </h1>
        <p className="text-3xl text-red-500">
          Lütfen kayıt ol ya da giriş yap
        </p>
        <div className="flex justify-center py-8">
            <Logo />
        </div>
        <div className="flex flex-col gap-4 justify-center items-center">
          <div className="flex gap-4">
            <Button asChild size="lg" className="bg-red-600 text-white hover:bg-red-700 px-8 py-6 text-lg">
              <Link href="/login">Giriş Yap</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-8 py-6 text-lg">
              <Link href="/signup">Kayıt Ol</Link>
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mt-4 max-w-md text-center">
            Dinletiyo'ya giriş yaparak milyonlarca şarkıya ücretsiz erişim sağlayabilirsiniz.
          </p>
          
          {/* Debug butonu - localStorage temizleme */}
          
        </div>
      </div>
    </div>
  );
}
