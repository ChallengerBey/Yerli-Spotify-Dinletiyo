@echo off
chcp 65001 >nul
echo Dinletiyo APK derleniyor...
echo.

if not defined JAVA_HOME (
    echo [HATA] JAVA_HOME tanimli degil.
    echo.
    echo APK almak icin once JDK 17 yukle:
    echo   1. https://adoptium.net/ veya https://www.oracle.com/java/technologies/downloads/
    echo   2. JDK 17 indir ve kur
    echo   3. JAVA_HOME ortam degiskenini JDK kurulum klasorune ayarla
    echo      Ornek: JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
    echo.
    echo Veya Android Studio kullan: File - Open - android klasorunu ac, Build - Build Bundle(s) / APK(s) - Build APK(s)
    pause
    exit /b 1
)

call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo.
    echo Derleme basarisiz. Hata kodu: %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================
echo   APK olusturuldu.
echo ========================================
echo Konum: app\build\outputs\apk\debug\app-debug.apk
echo.
explorer "app\build\outputs\apk\debug"
pause
