# ⚡ Hızlı Başlangıç - Podcast & Oda Yönetimi

## 🚀 30 Saniye Özet

Admin paneline **2 yeni sekme** eklendi:
- 🎙️ **Podcastlar:** Podcastları listele ve sil
- 🎧 **Dinleme Odaları:** Odaları listele ve sil

Hepsi **koyu tema** uyumlu ve **türkçe**.

---

## 🎯 Hızlı Kullanım

### Admin Paneline Giriş
```
URL: https://dinletiyo.com/yonetim
Şifra: admin123
```

### Podcast Silme (3 adım)
1. "Podcastlar" sekmesine tıkla
2. Silmek istediğin podcast'in çöp kutusuna tıkla
3. "Sil" butonuna tıkla ✓

### Oda Silme (3 adım)
1. "Dinleme Odaları" sekmesine tıkla
2. Silmek istediğin odanın çöp kutusuna tıkla
3. "Sil" butonuna tıkla ✓

---

## 📦 Neler Eklendi?

| Item | Dosya | Tür | Durum |
|------|-------|-----|-------|
| Podcast Silme | `/api/admin/podcasts/[id]/route.ts` | Mevcut | ✅ |
| Podcast Listesi | `/api/admin/podcasts/route.ts` | Mevcut | ✅ |
| Oda Silme | `/api/admin/rooms/[id]/route.ts` | YENİ | ✅ |
| Oda Listesi | `/api/admin/rooms/route.ts` | Mevcut | ✅ |
| Admin UI | `/app/yonetim/page.tsx` | GÜNCELLENDI | ✅ |

---

## 🎨 Görünüm

```
Admin Paneli
├── İstatistikler (5 kart)
└── Sekmeler (6 adet)
    ├── Şarkılar (var olan)
    ├── Kullanıcılar (var olan)
    ├── Banlar (var olan)
    ├── 🎙️ Podcastlar (YENİ)
    │   ├── Podcast Listesi
    │   │   ├── Başlık
    │   │   ├── Oluşturucu
    │   │   ├── Tarih
    │   │   └── 🗑️ Sil Butonu
    ├── 🎧 Dinleme Odaları (YENİ)
    │   ├── Oda Listesi
    │   │   ├── Oda Adı
    │   │   ├── Sahibi
    │   │   ├── Durum (Aktif/Pasif)
    │   │   ├── Katılımcı Sayısı
    │   │   ├── Tarih
    │   │   └── 🗑️ Sil Butonu
    └── Loglar (var olan)
```

---

## 🔧 Teknik Detaylar

### State (Yeni)
```typescript
const [podcasts, setPodcasts] = useState<Podcast[]>([]);
const [rooms, setRooms] = useState<ListeningRoom[]>([]);
```

### Handlers (Yeni)
```typescript
const handleDeletePodcast = async (podcastId: string) => { ... }
const handleDeleteRoom = async (roomId: string) => { ... }
```

### API Çağrıları
```javascript
// Podcast silme
DELETE /api/admin/podcasts/:id

// Oda silme
DELETE /api/admin/rooms/:id
```

---

## 📊 Sorular & Cevaplar

### S: Podcast silinince ne olur?
**C:** Podcast, tüm bölümleri ve storage dosyası silinir. Admin log kaydı oluşturulur.

### S: Oda silinince katılımcılara ne olur?
**C:** Oda silinir, katılımcılar otomatik çıkarılır.

### S: Silme işlemi geri alınabilir mi?
**C:** Hayır. AlertDialog'da uyarı gösterilir.

### S: Tüm işlemler loglanıyor mu?
**C:** Evet. Her silme işlemi admin_logs tablosuna kaydedilir.

### S: Tema nedir?
**C:** Koyu tema (Dark Mode). Tüm renkler optimize edildi.

---

## ⚙️ Ayarlar

### Admin Şifrası
Değiştirmek istersen: `/app/yonetim/page.tsx` line ~108
```typescript
const checkAuth = () => {
  if (password === 'admin123') {  // ← Burayı değiştir
```

---

## 🐛 Sorun Gidericiler

### Sekmeler görünmüyor
✓ Sayfayı yenile (F5)
✓ Cache temizle

### Silme çalışmıyor
✓ Konsolu aç (F12)
✓ Network tabını kontrol et
✓ Hata mesajını oku

### Liste güncellenmiyor
✓ Sayfayı yenile
✓ localStorage temizle
✓ Cache temizle

---

## 📞 Destek

Hata bulursan:
1. Konsolu aç: **F12** → Console
2. Hata mesajını oku
3. Database bağlantısını kontrol et
4. Şifrayı kontrol et

---

## ✅ Kontrol Listesi

- [x] Sekmeleri görebiliyorum
- [x] Podcast listesi yükleniyor
- [x] Oda listesi yükleniyor
- [x] Silme butonları çalışıyor
- [x] Onay dialog'u gösterileriyor
- [x] Toast mesajları alıyorum
- [x] Liste otomatik güncelleniyor
- [x] Tema uyumlu görünüyor

---

## 🎉 Tamamlandı!

Admin paneli artık **tam işlevsel**. Tüm podcastları ve dinleme odalarını yönetebilirsiniz.

**Happy Managing! 🚀**

---

*Son Güncelleme: 2024*
*Proje: Yerli Spotify*
