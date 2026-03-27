package com.dinletiyo.app

import android.content.Intent
import android.webkit.JavascriptInterface
import android.webkit.WebView

/**
 * WebView'dan (Dinletiyo web uygulaması) çağrılır.
 * Arka plan medya servisini başlatır/günceller/durdurur — ekran kapalıyken ve uygulama alttayken müzik çalsın diye.
 */
class AndroidBridge(private val activity: MainActivity) {

    @JavascriptInterface
    fun startMediaService(title: String?, artist: String?) {
        activity.runOnUiThread {
            val intent = Intent(activity, MediaPlaybackService::class.java).apply {
                action = MediaPlaybackService.ACTION_START
                putExtra(MediaPlaybackService.EXTRA_TITLE, title ?: "Dinletiyo")
                putExtra(MediaPlaybackService.EXTRA_ARTIST, artist ?: "")
                putExtra(MediaPlaybackService.EXTRA_PLAYING, true)
            }
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                activity.startForegroundService(intent)
            } else {
                activity.startService(intent)
            }
        }
    }

    @JavascriptInterface
    fun updateNowPlaying(title: String?, artist: String?, playing: Boolean) {
        activity.runOnUiThread {
            val intent = Intent(activity, MediaPlaybackService::class.java).apply {
                action = MediaPlaybackService.ACTION_UPDATE
                putExtra(MediaPlaybackService.EXTRA_TITLE, title ?: "")
                putExtra(MediaPlaybackService.EXTRA_ARTIST, artist ?: "")
                putExtra(MediaPlaybackService.EXTRA_PLAYING, playing)
            }
            activity.startService(intent)
        }
    }

    @JavascriptInterface
    fun stopMediaService() {
        activity.runOnUiThread {
            val intent = Intent(activity, MediaPlaybackService::class.java).apply {
                action = MediaPlaybackService.ACTION_STOP
            }
            activity.startService(intent)
        }
    }
}
