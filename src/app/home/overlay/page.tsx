'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OverlaySettingsPage() {
  const [userId, setUserId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [overlayUrl, setOverlayUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Kullanıcı ID'sini al
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUserId(userData.id);
      
      // Overlay URL'ini oluştur
      const url = `${window.location.origin}/overlay/${userData.id}`;
      setOverlayUrl(url);
    }
  }, [mounted]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPreview = () => {
    window.open(overlayUrl, '_blank', 'width=600,height=200');
  };

  if (!mounted) {
    return (
      <div className="container max-w-4xl py-8" suppressHydrationWarning>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-64 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8" suppressHydrationWarning>
      <div>
        <h1 className="text-3xl font-bold mb-2">Yayın Overlay'i</h1>
        <p className="text-muted-foreground">
          OBS Studio veya diğer yayın yazılımlarında kullanabileceğin şarkı overlay'i
        </p>
      </div>

      {/* Preview */}
      <div className="bg-card border border-white/10 rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-4">Önizleme</h2>
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-8 border border-white/5">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 flex items-center gap-6 max-w-[500px] border-4 border-black/10">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">ÇALIYOR</p>
              <h3 className="text-2xl font-bold text-black mb-1">Şarkı Adı</h3>
              <p className="text-lg text-gray-600">Sanatçı İsmi</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-1/2" />
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay URL */}
      <div className="bg-card border border-white/10 rounded-xl p-8 space-y-4">
        <h2 className="text-xl font-semibold">Overlay Linki</h2>
        <p className="text-sm text-muted-foreground">
          Bu linki OBS Studio'da Browser Source olarak ekle
        </p>
        
        <div className="flex gap-2">
          <Input
            value={overlayUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button onClick={copyToClipboard} variant="secondary">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button onClick={openPreview} variant="secondary">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* OBS Kurulum Talimatları */}
      <div className="bg-card border border-white/10 rounded-xl p-8 space-y-6">
        <h2 className="text-xl font-semibold">OBS Studio Kurulumu</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Browser Source Ekle</h3>
              <p className="text-sm text-muted-foreground">
                OBS Studio'da Sources panelinde + butonuna tıkla ve "Browser" seç
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">URL'yi Yapıştır</h3>
              <p className="text-sm text-muted-foreground">
                Yukarıdaki overlay linkini URL alanına yapıştır
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Boyutları Ayarla</h3>
              <p className="text-sm text-muted-foreground">
                Width: 1920, Height: 1080 (veya yayın çözünürlüğün)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-1">Konumlandır</h3>
              <p className="text-sm text-muted-foreground">
                Overlay'i istediğin yere sürükle (genelde sol alt köşe)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Özellikler */}
      <div className="bg-card border border-white/10 rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-4">Özellikler</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Otomatik güncelleme (2 saniyede bir)
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Şarkı değiştiğinde animasyonlu geçiş
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            İlerleme çubuğu
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Şeffaf arka plan (OBS için optimize)
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Şarkı yoksa otomatik gizlenir
          </li>
        </ul>
      </div>
    </div>
  );
}
