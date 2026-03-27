# Playlist Migration Guide

## Sorun
YouTube'dan içeri aktarılan playlistler localStorage'da saklanıyordu, bu yüzden başka cihazdan girince kayboluyordu.

## Çözüm
Artık tüm playlistler Supabase veritabanında (`user_playlists` tablosu) saklanıyor ve tüm cihazlarda senkronize oluyor.

## Yapılan Değişiklikler

### 1. Playlist Detail Page (`src/app/home/playlist/[id]/page.tsx`)
- ✅ `imported_` prefix kontrolü kaldırıldı
- ✅ Tüm playlistler veritabanından okunuyor
- ✅ Edit/Delete işlemleri veritabanı üzerinden çalışıyor
- ✅ localStorage bağımlılığı kaldırıldı

### 2. Playlists Page (`src/app/home/playlists/page.tsx`)
- ✅ Zaten veritabanına kaydediyordu
- ✅ Import işlemi `/api/playlists` üzerinden çalışıyor

### 3. API Routes
- ✅ `/api/playlists` - Playlist CRUD işlemleri
- ✅ `/api/youtube/playlist` - YouTube'dan playlist çekme

## Kullanıcılar İçin Not

Eğer daha önce localStorage'a kaydedilmiş playlistleriniz varsa:
1. Tarayıcı console'unu açın (F12)
2. Şu komutu çalıştırın:
```javascript
localStorage.removeItem('my_imported_playlists');
```
3. Playlistleri tekrar YouTube'dan import edin - bu sefer veritabanına kaydedilecek ve tüm cihazlarda görünecek.

## Test Edilmesi Gerekenler
- [ ] YouTube'dan playlist import etme
- [ ] Başka cihazdan giriş yapınca playlist'in görünmesi
- [ ] Playlist düzenleme
- [ ] Playlist silme
- [ ] Playlist'e şarkı ekleme/çıkarma
