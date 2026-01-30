# Admin Panel Güncellemeleri - Podcast ve Dinleme Odaları Yönetimi

## Yapılan Değişiklikler

### 1. Admin Panel UI Geliştirmeleri
- ✅ Şifre giriş ekranı koyu tema (dark theme) ile uyumlu
- ✅ TabsList grid'i 4 kolondan 6 kolona çıkarıldı
- ✅ Yeni sekmeler eklendi: Podcastlar ve Dinleme Odaları

### 2. Podcast Yönetimi (Yeni Sekme)
**Konum:** Admin Panel → Podcastlar sekmesi

**Özellikler:**
- Tüm podcastları listele
- Podcast başlığını ve oluşturucusunu görüntüle
- Oluşturulma tarihini göster
- Silme işlemi (AlertDialog onaylı)
- Silinen podcast, tüm bölümleri ile silinir

**API Endpoints:**
- `GET /api/admin/podcasts` - Tüm podcastları listele
- `DELETE /api/admin/podcasts/:id` - Podcast sil (bölümleri de siler, storage dosyasını temizle)

### 3. Dinleme Odaları Yönetimi (Yeni Sekme)
**Konum:** Admin Panel → Dinleme Odaları sekmesi

**Özellikler:**
- Tüm dinleme odalarını listele
- Oda adını ve sahibini göster
- Aktif/Pasif durumunu badge ile göster
- Katılımcı sayısını göster
- Oluşturulma tarihini göster
- Silme işlemi (AlertDialog onaylı)

**API Endpoints:**
- `GET /api/admin/rooms` - Tüm dinleme odalarını listele
- `DELETE /api/admin/rooms/:id` - Dinleme odasını sil

### 4. Kod Değişiklikleri

#### src/app/yonetim/page.tsx
- Yeni interface'ler eklendi: `Podcast`, `ListeningRoom`
- State'lere `podcasts` ve `rooms` eklendi
- `loadAdminData()` fonksiyonu güncellendi - podcast ve rooms API'lerini çağırır
- Yeni delete handler'lar: `handleDeletePodcast()`, `handleDeleteRoom()`
- TabsList 6 kolona çıkarıldı
- İkonlar eklendi: `Radio`, `Headphones`
- Iki yeni TabsContent bölümü eklendi

#### src/app/api/admin/podcasts/[id]/route.ts
- DELETE method mevcut
- Podcast silinir
- Podcast bölümleri silinir
- Storage dosyası temizlenir
- Admin log kaydı oluşturulur

#### src/app/api/admin/rooms/[id]/route.ts
- Yeni dosya oluşturuldu
- DELETE method eklendi
- Dinleme odasını siler
- Admin log kaydı oluşturulur

#### src/app/api/admin/podcasts/route.ts
- GET method mevcut
- Tüm podcastları listeler

#### src/app/api/admin/rooms/route.ts
- GET method mevcut
- Tüm dinleme odalarını listeler

## Kullanım

### Admin Paneline Erişim
1. `/yonetim` sayfasına git
2. Şifre gir: `admin123`
3. Yeni sekmeler görünecek

### Podcast Silme
1. **Podcastlar** sekmesine git
2. Silmek istediğin podcast'in yanındaki çöp kutusu ikonuna tıkla
3. Onay dialog'unda **Sil**'e tıkla
4. Podcast ve tüm bölümleri silinir

### Dinleme Odası Silme
1. **Dinleme Odaları** sekmesine git
2. Silmek istediğin odanın yanındaki çöp kutusu ikonuna tıkla
3. Onay dialog'unda **Sil**'e tıkla
4. Dinleme odası silinir

## Styling (Tema)
- Tüm yeni bileşenler koyu tema (dark theme) ile uyumlu
- Renk şeması:
  - Arka plan: `bg-gray-800`, `bg-gray-700`
  - Sınır: `border-gray-700`, `border-gray-600`
  - Metin: `text-white`, `text-gray-400`
  - Silme butonu: `bg-red-600`, `hover:bg-red-700`
  - Aktif badge: `bg-green-600`
  - Katılımcı badge: `text-blue-400`

## Veritabanı
Kullandığı tablolar:
- `podcasts` - Podcast bilgisi
- `podcast_episodes` - Podcast bölümleri (cascade delete)
- `listening_rooms` - Dinleme odası bilgisi
- `admin_logs` - Admin işlem kayıtları

Tüm silme işlemleri güvenli bir şekilde yapılır ve admin_logs tablosuna kaydedilir.
