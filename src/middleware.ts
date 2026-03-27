import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // IP adresini al
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || '127.0.0.1';
  
  try {
    // Test için localhost IP'sini de kontrol et
    let checkIP = ip;
    if (ip === '127.0.0.1' || ip === '::1') {
      checkIP = '127.0.0.1'; // Localhost için sabit IP
    }
    
    // IP ban kontrolü yap
    const response = await fetch(`${request.nextUrl.origin}/api/ip-ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', ip: checkIP })
    });
    
    const data = await response.json();
    console.log('IP ban kontrol:', { originalIP: ip, checkIP, banned: data.banned });
    
    if (data.banned) {
      // IP banlıysa erişimi engelle - yeni tasarım
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Erişim Engellendi</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="min-h-screen bg-black flex items-center justify-center p-4">
          <div class="max-w-2xl w-full">
            <div class="text-center mb-8">
              <h1 class="text-4xl font-bold text-white">Dinletiyo</h1>
            </div>
            
            <div class="bg-black border-2 border-red-500 rounded-2xl p-8 shadow-2xl">
              <div class="text-center space-y-6">
                <div class="text-6xl mb-4">🚫</div>
                
                <h1 class="text-5xl font-bold text-red-500 mb-4">
                  ERİŞİM ENGELLENDİ
                </h1>
                
                <div class="bg-black border border-red-500 rounded-lg p-6 space-y-4">
                  <p class="text-xl text-red-400">
                    IP adresiniz site yönetim kurallarına göre <strong class="text-red-500">kalıcı olarak engellenmiştir.</strong>
                  </p>
                  
                  <div class="bg-black border border-red-600 rounded p-3">
                    <p class="font-mono text-red-400 text-lg">
                      IP: <span class="text-red-500 font-bold">${ip}</span>
                    </p>
                    <p class="font-mono text-red-400 text-lg">
                      Tarih: <span class="text-red-500">${new Date().toLocaleString('tr-TR')}</span>
                    </p>
                  </div>
                  
                  <div class="border-t border-red-500 pt-4">
                    <p class="text-red-400 font-semibold text-lg">
                      ⚠️ Bu ağdan hiçbir cihaz siteye erişemez.
                    </p>
                    <p class="text-red-500 text-lg mt-2 font-bold">
                      Giriş denemesi tespit edilirse IP adresi <strong>Jandarma Siber</strong> ile paylaşılacaktır.
                    </p>
                  </div>
                </div>
                
                <div class="bg-black border border-red-600 rounded-lg p-4">
                  <p class="text-red-400 text-lg">
                    📞 <strong>Destek:</strong> Bu kararın yanlış olduğunu düşünüyorsanız sistem yöneticisi ile iletişime geçin.
                  </p>
                </div>
                
                <div class="pt-6 border-t border-red-500">
                  <p class="text-red-500 text-sm">
                    Dinletiyo Company Semih Ergili 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
        `,
        { 
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }
  } catch (error) {
    // Hata durumunda devam et
    console.error('IP ban kontrolü hatası:', error);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Tüm route'ları kontrol et, API, static dosyalar ve dev panelini hariç tut
     */
    '/((?!api|_next/static|_next/image|favicon.ico|dev).*)',
  ],
}