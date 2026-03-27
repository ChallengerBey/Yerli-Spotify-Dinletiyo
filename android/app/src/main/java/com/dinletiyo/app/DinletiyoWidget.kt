package com.dinletiyo.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/**
 * Ana ekran widget'ı — çalan şarkı bilgisi ve "Uygulamayı Aç" butonu.
 */
class DinletiyoWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        widgetId: Int
    ) {
        val prefs = context.getSharedPreferences(MediaPlaybackService.PREFS_NAME, Context.MODE_PRIVATE)
        val title = prefs.getString(MediaPlaybackService.PREF_TITLE, "") ?: ""
        val artist = prefs.getString(MediaPlaybackService.PREF_ARTIST, "") ?: ""
        val playing = prefs.getBoolean(MediaPlaybackService.PREF_PLAYING, false)

        val views = RemoteViews(context.packageName, R.layout.widget_now_playing).apply {
            setTextViewText(R.id.widget_title, title.ifEmpty { context.getString(R.string.app_name) })
            setTextViewText(R.id.widget_artist, artist)
            setViewVisibility(R.id.widget_artist, if (artist.isEmpty()) android.view.View.GONE else android.view.View.VISIBLE)
            setTextViewText(R.id.widget_hint, if (playing) "▶ Çalıyor" else "Dinletiyo'yu aç")

            val openIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pending = PendingIntent.getActivity(
                context, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            setOnClickPendingIntent(R.id.widget_root, pending)
        }

        appWidgetManager.updateAppWidget(widgetId, views)
    }
}
