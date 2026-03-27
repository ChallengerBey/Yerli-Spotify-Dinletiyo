'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function OverlaySettingsPage() {
  const [userId, setUserId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Overlay ayarları
  const [settings, setSettings] = useState({
    theme: 'modern', // Tema: modern, minimal, gaming, neon, classic, transparent
    position: 'bottom-left', // Pozisyon
    size: 'medium', // Boyut: small, medium, large
    opacity: 95, // Şeffaflık
    progress: true, // İlerleme çubuğu
    artwork: true, // Albüm kapağı
    branding: true, // Dinletiyo logosu
  });
  
  const [overlayUrl, setOverlayUrl] = useState('');
  const [showUrl, setShowUrl] = useState(false);

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
    }
  }, [mounted]);

  const generateOverlayUrl = () => {
    if (!userId) return;
    
    // Ayarları URL parametrelerine çevir
    const params = new URLSearchParams({
      theme: settings.theme,
      position: settings.position,
      size: settings.size,
      opacity: settings.opacity.toString(),
      progress: settings.progress.toString(),
      artwork: settings.artwork.toString(),
      branding: settings.branding.toString(),
    });
    
    const url = `${window.location.origin}/overlay/${userId}?${params.toString()}`;
    setOverlayUrl(url);
    setShowUrl(true);
  };

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

      {/* Ayarlar */}
      <div className="bg-card border border-white/10 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Overlay Ayarları</h2>
        </div>
        
        {/* Tema */}
        <div className="space-y-3">
          <Label>Tema</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'modern', label: 'Modern (Beyaz)' },
              { value: 'minimal', label: 'Minimal (Siyah)' },
              { value: 'gaming', label: 'Gaming (Yeşil)' },
              { value: 'neon', label: 'Neon (Pembe)' },
              { value: 'classic', label: 'Klasik (Sarı)' },
              { value: 'transparent', label: 'Şeffaf' },
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => setSettings({ ...settings, theme: theme.value })}
                className={`p-3 rounded-lg border transition-all text-sm ${
                  settings.theme === theme.value
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Boyut */}
        <div className="space-y-3">
          <Label>Boyut</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'small', label: 'Küçük' },
              { value: 'medium', label: 'Orta' },
              { value: 'large', label: 'Büyük' },
            ].map((size) => (
              <button
                key={size.value}
                onClick={() => setSettings({ ...settings, size: size.value })}
                className={`p-3 rounded-lg border transition-all ${
                  settings.size === size.value
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Şeffaflık */}
        <div className="space-y-3">
          <Label>Şeffaflık: %{settings.opacity}</Label>
          <Slider
            value={[settings.opacity]}
            onValueChange={(value) => setSettings({ ...settings, opacity: value[0] })}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Overlay'in şeffaflık seviyesini ayarla</p>
        </div>

        {/* Pozisyon */}
        <div className="space-y-3">
          <Label>Pozisyon</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'top-left', label: 'Sol Üst' },
              { value: 'top-right', label: 'Sağ Üst' },
              { value: 'bottom-left', label: 'Sol Alt' },
              { value: 'bottom-right', label: 'Sağ Alt' },
              { value: 'center', label: 'Merkez' },
            ].map((pos) => (
              <button
                key={pos.value}
                onClick={() => setSettings({ ...settings, position: pos.value })}
                className={`p-3 rounded-lg border transition-all ${
                  settings.position === pos.value
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seçenekler */}
        <div className="space-y-3">
          <Label>Görünüm Seçenekleri</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={settings.progress}
                onChange={(e) => setSettings({ ...settings, progress: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">İlerleme çubuğunu göster</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={settings.artwork}
                onChange={(e) => setSettings({ ...settings, artwork: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Albüm kapağını göster</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={settings.branding}
                onChange={(e) => setSettings({ ...settings, branding: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Dinletiyo logosu göster</span>
            </label>
          </div>
        </div>

        {/* Çıktı Al Butonu */}
        <Button 
          onClick={generateOverlayUrl} 
          className="w-full"
          size="lg"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Çıktı Al
        </Button>
      </div>

      {/* Overlay URL - Sadece çıktı alındıktan sonra göster */}
      {showUrl && overlayUrl && (
        <div className="bg-card border border-white/10 rounded-xl p-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
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
      )}

      {/* Preview */}
      <div className="bg-card border border-white/10 rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-4">Önizleme</h2>
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-8 border border-white/5 overflow-x-auto">
          <div 
            className={`backdrop-blur-xl rounded-3xl shadow-2xl p-6 flex items-center gap-6 border-4 ${
              settings.theme === 'modern' ? 'bg-white/95 border-black/10' :
              settings.theme === 'minimal' ? 'bg-black/80 border-white/20' :
              settings.theme === 'gaming' ? 'bg-gradient-to-r from-green-900/90 to-blue-900/90 border-green-400/50' :
              settings.theme === 'neon' ? 'bg-black/90 border-pink-500/50' :
              settings.theme === 'classic' ? 'bg-amber-50/95 border-amber-200' :
              'bg-black/20 border-white/10'
            } ${
              settings.size === 'small' ? 'max-w-[400px]' :
              settings.size === 'large' ? 'max-w-[800px]' :
              'max-w-[600px]'
            }`}
            style={{ opacity: settings.opacity / 100 }}
          >
            {settings.artwork && (
              <div className={`rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 ${
                settings.size === 'small' ? 'w-16 h-16' :
                settings.size === 'large' ? 'w-40 h-40' :
                'w-24 h-24'
              }`}>
                <svg className={`text-white ${
                  settings.size === 'small' ? 'w-8 h-8' :
                  settings.size === 'large' ? 'w-20 h-20' :
                  'w-12 h-12'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {settings.branding && (
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                  settings.theme === 'modern' ? 'text-gray-500' :
                  settings.theme === 'minimal' ? 'text-gray-400' :
                  settings.theme === 'gaming' ? 'text-green-400' :
                  settings.theme === 'neon' ? 'text-pink-400' :
                  settings.theme === 'classic' ? 'text-amber-600' :
                  'text-white/60'
                }`}>
                  🎵 DİNLETİYO.COM
                </p>
              )}
              <h3 className={`font-bold mb-1 truncate ${
                settings.size === 'small' ? 'text-xl' :
                settings.size === 'large' ? 'text-4xl' :
                'text-2xl'
              } ${
                settings.theme === 'modern' ? 'text-black' :
                settings.theme === 'minimal' ? 'text-white' :
                settings.theme === 'gaming' ? 'text-green-100' :
                settings.theme === 'neon' ? 'text-pink-100' :
                settings.theme === 'classic' ? 'text-amber-900' :
                'text-white'
              }`}>
                Şarkı Adı
              </h3>
              <p className={`truncate ${
                settings.size === 'small' ? 'text-sm' :
                settings.size === 'large' ? 'text-2xl' :
                'text-lg'
              } ${
                settings.theme === 'modern' ? 'text-gray-600' :
                settings.theme === 'minimal' ? 'text-gray-300' :
                settings.theme === 'gaming' ? 'text-green-200' :
                settings.theme === 'neon' ? 'text-pink-200' :
                settings.theme === 'classic' ? 'text-amber-700' :
                'text-white/80'
              }`}>
                Sanatçı İsmi
              </p>
              {settings.progress && (
                <div className={`mt-3 w-full rounded-full h-2 ${
                  settings.theme === 'modern' ? 'bg-gray-200' :
                  settings.theme === 'minimal' ? 'bg-white/20' :
                  settings.theme === 'gaming' ? 'bg-green-900/50' :
                  settings.theme === 'neon' ? 'bg-pink-900/30' :
                  settings.theme === 'classic' ? 'bg-amber-200' :
                  'bg-white/20'
                }`}>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-1/2" />
                </div>
              )}
            </div>
          </div>
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
                Yukarıdaki "Çıktı Al" butonuna tıklayıp oluşan linki URL alanına yapıştır
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
                Overlay'i seçtiğin pozisyona göre yerleştir
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
            Özelleştirilebilir boyut ve pozisyon
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Açık/Koyu tema seçenekleri
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
