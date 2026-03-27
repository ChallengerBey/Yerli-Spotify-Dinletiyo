package com.dinletiyo.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class DinletiyoWidgetProvider extends AppWidgetProvider {

    private static final String PREFS = "HomeWidgetPreferences";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            update(context, appWidgetManager, appWidgetId);
        }
    }

    private void update(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String title = prefs.getString("title", context.getString(R.string.app_name));
        String artist = prefs.getString("artist", "");
        boolean playing = prefs.getBoolean("playing", false);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_now_playing);
        views.setTextViewText(R.id.widget_title, title == null || title.isEmpty() ? context.getString(R.string.app_name) : title);
        views.setTextViewText(R.id.widget_artist, artist == null ? "" : artist);
        views.setTextViewText(R.id.widget_hint, playing ? "▶ Çalıyor" : "Dinletiyo'yu aç");

        Intent openIntent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                0,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}

