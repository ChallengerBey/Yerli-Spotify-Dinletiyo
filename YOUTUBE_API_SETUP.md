# YouTube API Kurulum Rehberi

## Sorun
YouTube Playlist İçe Aktarma özelliğinde kalitesiz şarkılar çıkıyor.

## Çözüm
YouTube Data API key'i ekleyerek ve kalite filtreleme sistemi ile düzeltildi.

## Yapılan İyileştirmeler

### 1. Kalite Filtreleme
Şu tür içerikler otomatik olarak filtrelenir:
- ❌ Remix, nightcore, slowed versiyonlar
- ❌ Bass boosted, 8D audio gibi efektli versiyonlar
- ❌ TikTok, shorts, meme içerikleri
- ❌ Parody, cover, karaoke versiyonlar
- ❌ Tutorial, reaction, review videoları
- ❌ Çok kısa başlıklar (5 karakterden az)
- ❌ Sadece sayı/sembol içeren başlıklar

### 2. Gelişmiş Veri Çıkarma
- ✅ JSON-LD verilerinden daha güvenilir bilgi çıkarma
- ✅ ytInitialData'dan video bilgilerini alma
- ✅ Kanal adlarından gereksiz kısımları temizleme (VEVO, Official, etc.)
- ✅ Başlıklardan sanatçı adını daha iyi ayırma

### 3. Temizlik İşlemleri
Başlıklardan şu kısımlar otomatik temizlenir:
- (Official Video), (Official Music Video)
- (Official Audio), (Lyric Video)
- [Official Video], [Lyrics] gibi etiketler

## YouTube API Key Alma

### 1. Google Cloud Console'a Git
1. [Google Cloud Console](https://console.cloud.google.com/) adresine git
2. Google hesabınla giriş yap

### 2. Yeni Proje Oluştur
1. Sol üstteki proje seçiciye tıkla
2. "New Project" butonuna tıkla
3. Proje adı gir (örn: "Yerli Spotify")
4. "Create" butonuna tıkla

### 3. YouTube Data API'yi Etkinleştir
1. Sol menüden "APIs & Services" > "Library" seç
2. "YouTube Data API v3" ara
3. API'ye tıkla ve "Enable" butonuna bas

### 4. API Key Oluştur
1. Sol menüden "APIs & Services" > "Credentials" seç
2. "Create Credentials" > "API Key" seç
3. API key'i kopyala

### 5. API Key'i Kısıtla (Güvenlik)
1. Oluşturulan API key'e tıkla
2. "Application restrictions" bölümünde "HTTP referrers" seç
3. Domain'ini ekle (örn: `localhost:3000/*`, `yourdomain.com/*`)
4. "API restrictions" bölümünde "Restrict key" seç
5. "YouTube Data API v3" seç
6. "Save" butonuna tıkla

### 6. Environment Variable Ekle
`.env.local` dosyasına ekle:
```env
YOUTUBE_API_KEY=your_actual_api_key_here
```

## Kullanım Limitleri

YouTube Data API günlük limitleri:
- **Ücretsiz**: 10,000 quota/gün
- **Playlist import**: ~3-5 quota per playlist
- **Yaklaşık**: 2000-3000 playlist import/gün

## Test Etme

1. API key'i ekledikten sonra uygulamayı yeniden başlat
2. Kaliteli bir YouTube playlist URL'si dene:
   - Resmi sanatçı kanallarından playlist'ler
   - Müzik şirketlerinin (Universal, Sony, etc.) playlist'leri
   - Spotify'ın YouTube kanalındaki playlist'ler

## Sorun Giderme

### API Key Çalışmıyor
- API key'in doğru kopyalandığından emin ol
- YouTube Data API v3'ün etkinleştirildiğini kontrol et
- Domain kısıtlamalarını kontrol et
- Browser console'da hata mesajlarını incele

### Hala Kalitesiz Şarkılar Çıkıyor
- Farklı bir playlist dene (resmi kanallardan)
- Playlist'in herkese açık olduğundan emin ol
- Çok eski playlist'ler yerine güncel olanları dene

### Quota Aşıldı Hatası
- Günlük limit aşıldı, yarın tekrar dene
- Veya Google Cloud'da ödeme yöntemi ekleyerek limiti artır

## Alternatif Çözümler

API key olmadan da sistem çalışır ama:
- Demo içerik gösterir
- Scraping yapar (daha az güvenilir)
- Kalite daha düşük olabilir

En iyi deneyim için YouTube API key'i şiddetle önerilir.