# Dinletiyo Android Uygulaması

## Arka planda ve ekran kapalıyken müzik

- Müzik çalmaya başladığında **ön planda medya servisi** başlar; bildirimde şarkı adı ve sanatçı gösterilir.
- Ekran kapalıyken veya uygulama alttayken müziğin kesilmemesi için servis süreç canlı tutar (WakeLock).
- Bildirime tıklayınca uygulama açılır.

**Not:** Ses aslında WebView içinde (web sayfasında) çalıyor. Servis sadece uygulamanın arka planda öldürülmesini engeller. Bazı cihazlarda çok agresif pil tasarrufu varsa ses yine durabilir; tam garanti için ileride native ses çalıcı (ExoPlayer) eklenebilir.

## Ana ekran widget’ı

1. Ana ekranda boş bir alana **uzun bas**.
2. **Widget’lar** / **Widgets** seçeneğine gir.
3. **Dinletiyo** widget’ını bulup ekrana sürükleyip bırak.
4. Widget’ta çalan şarkı bilgisi görünür; tıklayınca uygulama açılır.

Widget verisi, medya servisi çalışırken güncellenir (şarkı değişince veya play/pause’da).

## Gerekli izinler

- **İnternet** – Müzik akışı
- **Bildirimler** (Android 13+) – Medya bildirimi
- **Ön planda hizmet (medya)** – Arka planda çalma
