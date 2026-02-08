# 🎵 Yerli Spotify - Yeni Özellikler Rehberi

Bu belge, son eklenen üç ana özelliğin nasıl kullanılacağını açıklar.

---

## 🔧 Admin Panel İyileştirmesi

### Erişim
- URL: `/yonetim`
- Şifre: `admin123`

### Özellikler

#### 1. **Şarkı Yönetimi**
- **Şarkı Yükle**: Yeni şarkıları sisteme ekleyebilirsiniz
  - Başlık ve sanatçı adı girin
  - Ses dosyasını seçin
  - Yükleme tamamlanır

- **Şarkı Listesi**: Yüklenen tüm şarkıları görüntüleyin
  - Dinlenme sayılarını takip edin
  - Seçili şarkıları silebilirsiniz

#### 2. **Kullanıcı Yönetimi**
- Tüm kayıtlı kullanıcıları görüntüleyin
- Kullanıcı bilgilerini (ad, email, kayıt tarihi) kontrol edin

#### 3. **Ban Sistemi**
- Kötü davranan kullanıcıları banlamak
  - **Geçici Ban**: Belirli gün sayısı için (varsayılan 30 gün)
  - **Kalıcı Ban**: Süresiz yasaklama

- Ban nedenini belirtin
- Aktif banları yönetin ve dilerse kaldırın

#### 4. **İstatistik Dashboard**
Ana sayfada gerçek zamanlı istatistikler:
- **Toplam Kullanıcı**: Sistemdeki tüm kullanıcı sayısı
- **Toplam Şarkı**: Veritabanında olan şarkı sayısı
- **Toplam Dinlenme**: Tüm şarkıların oynatılma sayılarının toplamı
- **Aktif Banlar**: Şu anda yürürlükte olan yasaklamalar
- **Yeni Kayıtlar**: Son 7 günde kaydolan yeni kullanıcılar

---

## 🔔 Bildirim Sistemi

### Bildirim Türleri

1. **Yeni Şarkı (🎵)**
   - Yeni şarkı eklendiğinde otomatik bildirim
   - Şarkı başlığı ve sanatçısı gösterilir

2. **Arkadaş Aktiviteleri (👥)**
   - Arkadaşların dinleme aktiviteleri
   - Arkadaş istekleri ve kabul durumları

3. **Playlist Güncellemeleri (📝)**
   - Paylaşılan playlist değişiklikleri
   - Yeni şarkı eklemesi, silme vb.

4. **Başarılar (🏆)**
   - Başarı kazandığında otomatik bildirim
   - Başarı adı ve açıklaması

5. **Sistem Bildirimleri (📢)**
   - Bakım çalışmaları
   - Önemli duyurular

### Bildirim Merkezi Kullanımı

#### Bildirim Panelini Açma
- Üst navigasyonda **Bell İkonuna** tıklayın
- Okunmamış bildirimlerin sayısı gösterilir

#### Bildirimleri Yönetme
- **Tümünü Okundu İşaretle**: Hızlı erişim butonu
- **Okundu İşaretle** (✓): Tekil bildirimi okundu işaretle
- **Sil** (🗑️): Bildirimi kaldır

#### Bildirim Filtreleri
```typescript
// API'den belirli bildirimleri al
const unread = await fetch('/api/notifications?unread=true');
const limited = await fetch('/api/notifications?limit=10');
```

### Bildirim Gönderme (Kodda)

```typescript
import { notifyNewSong, notifyFriendActivity } from '@/lib/notifications';

// Yeni şarkı bildirimi gönder
await notifyNewSong(userId, 'Şarkı Adı', songId, 'Sanatçı');

// Arkadaş aktivitesi bildirimi
await notifyFriendActivity(userId, 'Ahmet', friendId, 'seni takip etti');

// Playlist güncellemesi
await notifyPlaylistUpdate(userId, 'Favorilerim', playlistId, userId, 'şarkı ekledi');

// Başarı bildirimi
await notifyAchievement(userId, 'Müzik Bağımlısı', '🎵', '1000 şarkı dinledin!');
```

---

## 📥 Offline İndirme Sistemi

### Özellikler

1. **İçerik İndirme**
   - Şarkıları, podcast bölümlerini ve playlist'leri indirin
   - Kalite seçimi: Düşük, Normal, Yüksek
   - Otomatik 30 gün expiration

2. **Depolama Yönetimi**
   - **Varsayılan Kota**: 5 GB
   - Gerçek zamanlı kullanım takibi
   - Uyarı ve sınır sistemi

3. **Offline Oynatma**
   - İndirilmiş içerikleri internetsiz oynatın
   - Hız kontrolü ve atla özellikleri

### İndirme Panelini Kullanma

#### Floating Button
- Sağ alt köşede **İndirme Butonu** (💾)
- Paneli açmak için tıklayın

#### Depolama Bilgisi
```
Kullanıldı: 2.5 GB / 5 GB
Yüzde: 50%
```

- Renk kodlama:
  - 🟢 Yeşil: %0-50 (İyi)
  - 🟡 Sarı: %50-80 (Uyarı)
  - 🔴 Kırmızı: %80-100 (Kritik)

#### İndirmeleri Yönetme
- **İndir** (▶️): Oynat
- **Sil** (🗑️): Depolamadan kaldır
- Dosya boyutu ve kalite gösterilir

### Offline İndirme API'si

```typescript
import {
  downloadContent,
  getStorageQuota,
  deleteDownload,
  isContentOffline,
} from '@/lib/offline-downloads';

// İçerik indir
const download = await downloadContent('song', songData, 'high');

// Depolama bilgisi al
const quota = await getStorageQuota();
console.log(`${quota.used_quota_bytes} / ${quota.total_quota_bytes}`);

// İndirme sil
await deleteDownload(downloadId);

// Offline durumunu kontrol et
const isOffline = await isContentOffline('song', songId);
```

### Depolama Yönetimi Rehberi

#### Depolama Taklası Yapılacak Şey
- Yüksek kalitede indirme yapmadan önce kvota kontrol edin
- Eski indirmeleri silin (30 gün sonra otomatik silinir)
- Düşük kaliteyi seçerek yer tasarrufu yapın

#### Hata Durumları
- **Storage quota exceeded**: Depolama dolu, yer boşaltın
- **Download failed**: Dosya erişimi sorunsu, yeniden deneyin
- **Expired content**: İçerik süresi dolmuş, yeniden indirin

---

## 📊 Veritabanı Tabloları

### Admin Paneli İçin
- `admin_logs`: Admin işlemlerinin kaydı
- `user_bans`: Kullanıcı yasaklamaları
- `songs`: Şarkı metadata'sı
- `admin_roles`: Admin izinleri

### Bildirim Sistemi İçin
- `notifications`: Tüm bildirimleri depola

### Offline İndirme İçin
- `offline_downloads`: İndirilmiş içerik listesi
- `user_storage_quota`: Kullanıcı depolama kota bilgisi

---

## 🔐 Güvenlik Notları

### Admin Paneli
- ⚠️ **Şifre değiştirin**: `admin123` varsayılan şifre
- ⚠️ **HTTPS kullanın**: Üretim ortamında güvenli bağlantı
- ⚠️ **Logu takip edin**: Admin işlemlerinin kaydı tutulur

### Bildirimler
- Kullanıcılar kendi bildirimleriyle sınırlı (RLS aktif)
- Bildirimleri silme/güncelleme kendi verilerinden

### Offline İndirme
- Depolama kota sistem tarafından doğrulanır
- İndirilmiş içerik otomatik silinir (30 gün)
- Kullanıcılar sadece kendi indirmelerine erişebilir

---

## 🚀 Deployment Kontrol Listesi

1. **Veritabanı Migrasyonları**
   ```bash
   # admin_features.sql dosyasını Supabase SQL editöründe çalıştırın
   ```

2. **Environment Variables** (varsa yeni eklenenler)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key  # Admin işlemleri için
   ```

3. **Storage Bucket Oluştur** (Supabase)
   - `songs` bucket'ı oluşturun
   - Public access'i ayarlayın

4. **RLS Politikalarını Kontrol Et**
   - Admin tabloları sadece admin'lerin erişebilsin
   - Kullanıcı tabloları kendileriyle sınırlı

5. **Test Etme**
   ```bash
   npm run dev
   # /yonetim → Admin Panel
   # Bildirim ikonu → Bildirim merkezi
   # İndirme butonu → Offline panel
   ```

---

## 📞 Destek ve İletişim

### Sorunlar
- API hataları `console.error()` ile loglanır
- Database hataları Supabase dashboard'da görülebilir

### İyileştirmeler
- Bildirim türleri kolayca eklenebilir
- Depolama kota'sı ayarlanabilir
- Admin işlemleri genişletilebilir

---

**Sürüm**: 1.0.0  
**Son Güncelleme**: Ocak 2026  
**Muhabir**: GitHub Copilot
