# 📱 Dinletiyo APK Build Rehberi

## ✅ Hazır Dosyalar:
- ✅ Capacitor config
- ✅ Android manifest (ses izinleri)
- ✅ WebView dinletiyo.com'a yönlendirme

## 🔧 APK Build Adımları:

### 1. Java 11+ Kurulumu
```bash
# Java 11 veya üstü gerekli
java -version
```

### 2. Android Studio Kurulumu
- Android Studio indir ve kur
- SDK Manager'dan Android SDK kur

### 3. APK Build
```bash
cd android
./gradlew assembleDebug
```

### 4. APK Konumu
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 App Özellikleri:
- **App Name:** Dinletiyo
- **Package:** com.dinletiyo.app
- **WebView:** https://dinletiyo.com
- **Permissions:** Audio, Internet, Storage
- **Icon:** Mevcut logo kullanılacak

## 🚀 Alternatif: Online APK Builder
1. **APK Builder Online** kullan
2. WebView template seç
3. URL: https://dinletiyo.com
4. App name: Dinletiyo
5. Package: com.dinletiyo.app
6. Icon upload et
7. APK indir

## 📱 Test
APK'yı Android cihaza yükle ve test et.