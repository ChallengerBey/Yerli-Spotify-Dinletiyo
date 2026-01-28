import { Logo } from '@/components/logo';

export default function BanTestPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-white">
            <Logo />
          </div>
        </div>
        
        <div className="bg-black border-2 border-red-500 rounded-2xl p-8 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🚫</div>
            
            <h1 className="text-5xl font-bold text-red-500 mb-4">
              ERİŞİM ENGELLENDİ
            </h1>
            
            <div className="bg-black border border-red-500 rounded-lg p-6 space-y-4">
              <p className="text-xl text-red-400">
                IP adresiniz site yönetim kurallarına göre <strong className="text-red-500">kalıcı olarak engellenmiştir.</strong>
              </p>
              
              <div className="bg-black border border-red-600 rounded p-3">
                <p className="font-mono text-red-400 text-lg">
                  IP: <span className="text-red-500 font-bold">127.0.0.1</span>
                </p>
                <p className="font-mono text-red-400 text-lg">
                  Tarih: <span className="text-red-500">{new Date().toLocaleString('tr-TR')}</span>
                </p>
              </div>
              
              <div className="border-t border-red-500 pt-4">
                <p className="text-red-400 font-semibold text-lg">
                  ⚠️ Bu ağdan hiçbir cihaz siteye erişemez.
                </p>
                <p className="text-red-500 text-lg mt-2 font-bold">
                  Giriş denemesi tespit edilirse IP adresi <strong>Jandarma Siber</strong> ile paylaşılacaktır.
                </p>
              </div>
            </div>
            
            <div className="bg-black border border-red-600 rounded-lg p-4">
              <p className="text-red-400 text-lg">
                📞 <strong>Destek:</strong> Bu kararın yanlış olduğunu düşünüyorsanız sistem yöneticisi ile iletişime geçin.
              </p>
            </div>
            
            <div className="pt-6 border-t border-red-500">
              <p className="text-red-500 text-sm">
                Dinletiyo Company Semih Ergili 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}