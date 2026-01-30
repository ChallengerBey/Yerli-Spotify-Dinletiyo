# Playlist Sistemi Kurulum Rehberi

## Sorun
Playlist ekleme kısmında gerçek veriler çekilmiyor, boş veriler gösteriliyor.

## Çözüm
Playlist sistemi için gerekli veritabanı tabloları ve API entegrasyonu tamamlandı.

## Yapılan Değişiklikler

### 1. Veritabanı Tabloları
Aşağıdaki SQL dosyaları oluşturuldu:
- `sql/playlists.sql` - Playlist ve playlist_songs tabloları
- `sql/friendships.sql` - Arkadaşlık sistemi
- `sql/favorites.sql` - Favoriler
- `sql/complete_setup.sql` - Tüm kurulum

### 2. Frontend Güncellemeleri
- `src/app/home/create-playlist/page.tsx` - Gerçek API çağrısı eklendi
- `src/app/home/playlists/page.tsx` - Gerçek veri çekme ve gösterme

### 3. API Endpoint'leri
Mevcut API endpoint'leri kullanılıyor:
- `POST /api/playlists` - Playlist oluşturma
- `GET /api/playlists` - Playlist'leri listeleme
- `POST /api/playlists/songs` - Playlist'e şarkı ekleme
- `DELETE /api/playlists/songs` - Playlist'ten şarkı çıkarma

## Kurulum Adımları

### 1. Veritabanı Kurulumu
Supabase dashboard'unda SQL Editor'de şu dosyaları sırayla çalıştırın:

```sql
-- 1. Önce temel tabloları oluşturun
\i sql/playlists.sql
\i sql/friendships.sql
\i sql/favorites.sql

-- 2. Sonra ana veritabanı şemasını çalıştırın
\i sql/veritabanı.sql
```

Veya tek seferde:
```sql
\i sql/complete_setup.sql
```

### 2. Ortam Değişkenleri
`.env.local` dosyanızda şunların olduğundan emin olun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Kullanıcı Kimlik Doğrulama
Playlist oluşturmak için kullanıcının giriş yapmış olması gerekir. Auth token localStorage'da `auth_token` anahtarıyla saklanmalı.

## Özellikler

### ✅ Tamamlanan
- Playlist oluşturma (gerçek API)
- Playlist listeleme (veritabanından)
- Playlist silme
- Şarkı ekleme/çıkarma
- Public/private playlist desteği
- Playlist istatistikleri (şarkı sayısı, süre)

### 🔄 Geliştirilebilir
- Playlist kapak resmi yükleme
- Playlist paylaşma
- Collaborative playlist'ler
- Playlist sıralama/filtreleme

## Kullanım

### Playlist Oluşturma
1. `/home/create-playlist` sayfasına gidin
2. Playlist adı girin (zorunlu)
3. Açıklama ekleyin (opsiyonel)
4. Public/private seçin
5. "Playlist Oluştur" butonuna tıklayın

### Playlist Görüntüleme
1. `/home/playlists` sayfasına gidin
2. "Playlistlerim" bölümünde kendi playlist'lerinizi görün
3. "İçe Aktarılan Playlistler" bölümünde YouTube'dan import edilenleri görün
4. "Önerilen Playlistler" bölümünde varsayılan playlist'leri görün

### Şarkı Ekleme
1. Bir playlist'e tıklayın
2. Şarkıların üzerine hover yapın
3. Yeşil "+" butonuna tıklayarak playlist'e ekleyin

## Sorun Giderme

### Playlist Oluşturulamıyor
- Kullanıcının giriş yapmış olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin
- Supabase RLS policy'lerinin doğru kurulduğunu kontrol edin

### Playlist'ler Görünmüyor
- Veritabanı tablolarının oluşturulduğunu kontrol edin
- API endpoint'lerinin çalıştığını test edin
- Network tab'ında API çağrılarını kontrol edin

### Şarkı Eklenmiyor
- Playlist'in kullanıcıya ait olduğundan emin olun
- Şarkı verilerinin doğru format'ta olduğunu kontrol edin
- playlist_songs tablosunun constraint'lerini kontrol edin

## Test

Sistemi test etmek için:
1. Giriş yapın
2. Yeni bir playlist oluşturun
3. Playlist'e şarkı eklemeyi deneyin
4. Playlist'i silin

Tüm işlemler başarılı olursa sistem doğru çalışıyor demektir.