package com.dinletiyo.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

/**
 * Arka planda ve ekran kapalıyken müziğin kesilmemesi için ön planda medya servisi.
 * Bildirimde çalan şarkı bilgisi gösterilir.
 */
class MediaPlaybackService : Service() {

    private val binder = LocalBinder()
    private var wakeLock: PowerManager.WakeLock? = null

    var currentTitle: String = ""
        private set
    var currentArtist: String = ""
        private set
    var isPlaying: Boolean = false
        private set

    inner class LocalBinder : Binder() {
        fun getService(): MediaPlaybackService = this@MediaPlaybackService
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onCreate() {
        super.onCreate()
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "Dinletiyo::MediaPlayback"
        ).apply { setReferenceCounted(false) }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: "Dinletiyo"
                val artist = intent.getStringExtra(EXTRA_ARTIST) ?: ""
                startForegroundWithTrack(title, artist, intent.getBooleanExtra(EXTRA_PLAYING, true))
            }
            ACTION_UPDATE -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: currentTitle
                val artist = intent.getStringExtra(EXTRA_ARTIST) ?: currentArtist
                val playing = intent.getBooleanExtra(EXTRA_PLAYING, isPlaying)
                currentTitle = title
                currentArtist = artist
                this.isPlaying = playing
                saveToPrefs(title, artist, playing)
                updateNotification(title, artist, playing)
            }
            ACTION_STOP -> stopForegroundService()
        }
        return START_STICKY
    }

    private fun startForegroundWithTrack(title: String, artist: String, playing: Boolean) {
        currentTitle = title
        currentArtist = artist
        isPlaying = playing
        saveToPrefs(title, artist, playing)
        wakeLock?.acquire(10*60*1000L) // 10 dakika max
        createChannel()
        startForeground(NOTIFICATION_ID, buildNotification(title, artist, playing))
    }

    private fun updateNotification(title: String, artist: String, playing: Boolean) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIFICATION_ID, buildNotification(title, artist, playing))
    }

    private fun stopForegroundService() {
        wakeLock?.let { if (it.isHeld) it.release() }
        saveToPrefs("", "", false)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun saveToPrefs(title: String, artist: String, playing: Boolean) {
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
            putString(PREF_TITLE, title)
            putString(PREF_ARTIST, artist)
            putBoolean(PREF_PLAYING, playing)
            apply()
        }
        // Widget'ı güncelle
        val widgetIds = AppWidgetManager.getInstance(this)
            .getAppWidgetIds(ComponentName(this, DinletiyoWidget::class.java))
        if (widgetIds.isNotEmpty()) {
            val updateIntent = android.content.Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
            }
            sendBroadcast(updateIntent)
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_media),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                setShowBadge(false)
                description = getString(R.string.notification_channel_media_desc)
            }
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }
    }

    private fun buildNotification(title: String, artist: String, playing: Boolean): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val openPending = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val contentText = if (artist.isNotEmpty()) "$title · $artist" else title
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(if (playing) getString(R.string.now_playing) else getString(R.string.paused))
            .setContentText(if (title.isNotEmpty()) contentText else getString(R.string.app_name))
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(openPending)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        wakeLock?.let { if (it.isHeld) it.release() }
        super.onDestroy()
    }

    companion object {
        const val PREFS_NAME = "media_playback"
        const val PREF_TITLE = "now_playing_title"
        const val PREF_ARTIST = "now_playing_artist"
        const val PREF_PLAYING = "now_playing_playing"

        const val ACTION_START = "com.dinletiyo.app.MediaPlaybackService.START"
        const val ACTION_UPDATE = "com.dinletiyo.app.MediaPlaybackService.UPDATE"
        const val ACTION_STOP = "com.dinletiyo.app.MediaPlaybackService.STOP"
        const val EXTRA_TITLE = "title"
        const val EXTRA_ARTIST = "artist"
        const val EXTRA_PLAYING = "playing"
        private const val CHANNEL_ID = "dinletiyo_media"
        private const val NOTIFICATION_ID = 1001
    }
}
