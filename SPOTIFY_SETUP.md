# Spotify API Entegrasyonu - Kurulum Rehberi

## 🎵 Özellik
Player'da çalan şarkının gerçek albüm kapağını Spotify'dan otomatik olarak çeker ve gösterir.

## 📋 Nasıl Çalışır?

1. **Şarkı Değiştiğinde:**
   - Şarkı adı ve sanatçı bilgisi alınır
   - Başlık normalize edilir (feat, ft, video version vb. temizlenir)
   - Spotify Web API'de şarkı aranır
   - Bulunan ilk sonuçtan 640x640px albüm kapağı alınır

2. **Görsel Güncelleme:**
   - Ana player ekranında büyük görsel olarak gösterilir
   - Arka planda blur/gradient efekti ile kullanılır
   - Şarkı değiştiğinde otomatik güncellenir

3. **Fallback Mekanizması:**
   - Spotify'da bulunamazsa mevcut görsel (YouTube thumbnail) kullanılır
   - API hatası olursa sessizce mevcut görsele geri döner

## 🔧 Kurulum Adımları

### 1. Spotify Developer Hesabı Oluştur

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)'a git
2. Spotify hesabınla giriş yap (yoksa ücretsiz oluştur)
3. "Create an App" butonuna tıkla

### 2. Uygulama Oluştur

1. **App Name:** Dinletiyo (veya istediğin isim)
2. **App Description:** Music streaming app with album art integration
3. **Redirect URIs:** `http://localhost:3000` (geliştirme için)
4. **API/SDKs:** Web API seçeneğini işaretle
5. "Save" butonuna tıkla

### 3. Credentials'ları Al

1. Oluşturduğun uygulamaya tıkla
2. "Settings" butonuna tıkla
3. **Client ID** ve **Client Secret** değerlerini kopyala

### 4. Environment Variables Ekle

Proje kök dizininde `.env.local` dosyası oluştur (veya mevcut olanı düzenle):

```env
# Spotify API Configuration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**ÖNEMLİ:** 
- `.env.local` dosyası `.gitignore`'da olmalı (zaten var)
- Client Secret'ı asla public repository'e commit etme!

### 5. Uygulamayı Yeniden Başlat

```bash
npm run dev
```

## ✅ Test Etme

1. Uygulamayı aç
2. Bir şarkı çal
3. Full-screen player'ı aç
4. Console'da şu mesajları göreceksin:
   - `✅ Spotify'dan albüm kapağı bulundu: [Artist] - [Title]`
   - veya `❌ Spotify'da bulunamadı: [Artist] - [Title]`

## 🔒 Güvenlik

- Client credentials backend'de (API route) saklanır
- Token'lar server-side cache'lenir
- Client-side'da sadece API route'u çağrılır
- Rate limiting Spotify tarafından otomatik yapılır

## 🚀 Production Deployment

Vercel/Netlify gibi platformlarda:

1. Environment Variables bölümüne git
2. Aynı değişkenleri ekle:
   - `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`
   - `NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET`
3. Uygulamayı yeniden deploy et

## 📊 Rate Limits

Spotify API limitleri:
- **Client Credentials Flow:** ~100 request/saniye
- **Search Endpoint:** Rate limit yok (normal kullanım için)

Uygulama token'ları cache'lediği için çok az request yapar.

## 🐛 Sorun Giderme

### Albüm kapağı gelmiyor
- Console'da hata mesajlarını kontrol et
- `.env.local` dosyasının doğru konumda olduğundan emin ol
- Client ID ve Secret'ın doğru kopyalandığını kontrol et
- Uygulamayı yeniden başlat

### "Failed to get Spotify token" hatası
- Spotify credentials'larını kontrol et
- Spotify Developer Dashboard'da uygulamanın aktif olduğunu doğrula
- Internet bağlantını kontrol et

### Yanlış şarkı bulunuyor
- Şarkı başlığı ve sanatçı bilgisinin doğru olduğunu kontrol et
- `normalizeSongTitle` fonksiyonu otomatik temizlik yapar
- Bazı şarkılar Spotify'da farklı isimlerle olabilir

## 📝 Notlar

- Spotify API ücretsizdir (Client Credentials Flow)
- Sadece public data (albüm kapakları) çekilir
- Kullanıcı authentication'ı gerekmez
- Offline çalışmaz (API gerektirir)

## 🎨 Özelleştirme

Albüm kapağı boyutunu değiştirmek için `src/app/api/spotify/search/route.ts`:

```typescript
// 640x640 yerine farklı boyut
const albumArt = track.album.images[1]?.url; // 300x300
const albumArt = track.album.images[2]?.url; // 64x64
```

## 📚 Kaynaklar

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Client Credentials Flow](https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/)
- [Search API](https://developer.spotify.com/documentation/web-api/reference/search)
