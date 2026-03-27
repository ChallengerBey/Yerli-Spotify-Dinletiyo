// Analytics tracking utilities

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  songId?: string;
  data?: Record<string, any>;
}

class AnalyticsTracker {
  private queue: AnalyticsEvent[] = [];
  private isOnline = true;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Online/offline durumunu takip et
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flush();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Sayfa kapatılırken kuyruktaki verileri gönder
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });

      // Periyodik olarak kuyruğu temizle
      this.flushInterval = setInterval(() => {
        this.flush();
      }, 10000); // 10 saniyede bir
    }
  }

  // Event'i kuyruğa ekle
  track(event: AnalyticsEvent) {
    this.queue.push({
      ...event,
      timestamp: Date.now()
    });

    // Kritik event'ler için hemen gönder
    if (['page_view', 'user_login', 'song_play'].includes(event.event)) {
      this.flush();
    }
  }

  // Kuyruktaki event'leri sunucuya gönder
  private async flush(isBeforeUnload = false) {
    if (this.queue.length === 0 || !this.isOnline) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const method = isBeforeUnload ? 'sendBeacon' : 'fetch';
      
      if (method === 'sendBeacon' && navigator.sendBeacon) {
        // Sayfa kapatılırken güvenilir gönderim
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify({ events })
        );
      } else {
        // Normal fetch
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
        });
      }
    } catch (error) {
      console.warn('Analytics flush failed:', error);
      // Hata durumunda event'leri geri kuyruğa ekle
      this.queue.unshift(...events);
    }
  }

  // Sayfa görüntüleme
  trackPageView(page: string, userId?: string) {
    this.track({
      event: 'page_view',
      userId,
      data: { page, url: window.location.href }
    });
  }

  // Şarkı çalma
  trackSongPlay(songId: string, songTitle: string, artist: string, userId?: string) {
    this.track({
      event: 'song_play',
      userId,
      songId,
      data: { songTitle, artist }
    });
  }

  // Kullanıcı girişi
  trackUserLogin(userId: string, method: string = 'email') {
    this.track({
      event: 'user_login',
      userId,
      data: { method }
    });
  }

  // Kullanıcı kaydı
  trackUserSignup(userId: string, method: string = 'email') {
    this.track({
      event: 'user_signup',
      userId,
      data: { method }
    });
  }

  // Arama
  trackSearch(query: string, results: number, userId?: string) {
    this.track({
      event: 'search',
      userId,
      data: { query, results }
    });
  }

  // Playlist oluşturma
  trackPlaylistCreate(playlistId: string, userId?: string) {
    this.track({
      event: 'playlist_create',
      userId,
      data: { playlistId }
    });
  }

  // Favori ekleme
  trackFavoriteAdd(songId: string, userId?: string) {
    this.track({
      event: 'favorite_add',
      userId,
      songId
    });
  }

  // Sosyal etkileşim
  trackSocialInteraction(type: 'follow' | 'unfollow' | 'share', targetUserId?: string, userId?: string) {
    this.track({
      event: 'social_interaction',
      userId,
      data: { type, targetUserId }
    });
  }

  // Hata takibi
  trackError(error: string, page: string, userId?: string) {
    this.track({
      event: 'error',
      userId,
      data: { error, page, userAgent: navigator.userAgent }
    });
  }

  // Performans metrikleri
  trackPerformance(metric: string, value: number, userId?: string) {
    this.track({
      event: 'performance',
      userId,
      data: { metric, value }
    });
  }

  // Temizlik
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Global analytics instance
export const analytics = new AnalyticsTracker();

// React hook for analytics
export function useAnalytics() {
  return analytics;
}

// Utility functions
export function trackPageView(page: string, userId?: string) {
  analytics.trackPageView(page, userId);
}

export function trackSongPlay(songId: string, songTitle: string, artist: string, userId?: string) {
  analytics.trackSongPlay(songId, songTitle, artist, userId);
}

export function trackUserAction(action: string, data?: Record<string, any>, userId?: string) {
  analytics.track({
    event: action,
    userId,
    data
  });
}