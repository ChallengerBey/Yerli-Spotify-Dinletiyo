@echo off
title Dinletiyo Baslatici (Web surumu - v2)
echo ==========================================
echo Cihaz baglantisi bekleniyor...
echo Lutfen telefonunuzu USB ile baglayin ve ekrani acik tutun.

:wait_device
:: "List of devices attached" satirini haric tutarak "device" kelimesini ara
.\adb.exe devices | findstr /v "List" | findstr "device" >nul
if %errorlevel% neq 0 (
    timeout /t 1 >nul
    goto wait_device
)

echo.
echo [BASARILI] Cihaz bulundu!
adb devices
echo.

echo 2. Eski Uygulama Kaldiriliyor (Varsa)...
adb uninstall com.dinletiyo.app

echo.
echo 3. Yeni APK Yukleniyor (Dinletiyo2)...
adb install -r Dinletiyo2.apk
if %errorlevel% neq 0 (
    echo [HATA] APK yuklenirken hata olustu.
    pause
    goto wait_device
)

echo.
echo 4. Dosya Olarak da Kopyalaniyor...
adb push Dinletiyo2.apk /sdcard/Download/Dinletiyo2.apk

echo.
echo 5. Ekran Yansitiliyor (Kasa Kasa Degil, Yag Gibi)...
scrcpy.exe --max-size 1024 --video-bit-rate 4M --max-fps 60 --stay-awake --turn-screen-off
pause
