# Dinletiyo APK Nasıl Alınır?

## Seçenek 1: Android Studio (en kolay)

1. **Android Studio** indir ve kur: https://developer.android.com/studio  
2. Android Studio’yu aç → **File → Open** → bu projedeki **`android`** klasörünü seç.  
3. Gradle sync bitsin.  
4. **Build → Build Bundle(s) / APK(s) → Build APK(s)**  
5. APK şurada oluşur:  
   `android/app/build/outputs/apk/debug/app-debug.apk`  
   Bitince Android Studio “Locate” diyerek klasörü açar.

---

## Seçenek 2: Komut satırı (JDK gerekli)

1. **JDK 17** kur (ör. https://adoptium.net/) → **JAVA_HOME** ayarla.  
2. **Android SDK** kur (Android Studio ile gelir; veya [command line tools](https://developer.android.com/studio#command-tools)).  
   **ANDROID_HOME** ortam değişkenini SDK klasörüne ayarla (ör. `C:\Users\Kullanici\AppData\Local\Android\Sdk`).  
3. Bu klasörde (android içinde) şunu çalıştır:
   ```bat
   build-apk.bat
   ```
   veya:
   ```bat
   gradlew.bat assembleDebug
   ```
4. APK: `app\build\outputs\apk\debug\app-debug.apk`

---

## Release APK (Play Store / dağıtım)

Release imzalı APK için keystore gerekir. Android Studio’da:  
**Build → Generate Signed Bundle / APK** → APK seç → keystore oluştur veya seç.

Komut satırından:
```bat
gradlew.bat assembleRelease
```
(Önce `app/build.gradle` içinde `signingConfigs` tanımlanmalı.)

---

**Özet:** JDK yoksa **Android Studio** ile açıp **Build → Build APK(s)** yapman yeterli; APK `app/build/outputs/apk/debug/` içinde olur.
