export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Request persistent storage for background audio
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersisted = await navigator.storage.persist();
        console.log(`[PWA] Persistent storage: ${isPersisted ? 'granted' : 'denied'}`);
      }

      // Request wake lock permission for background playback
      if ('wakeLock' in navigator) {
        try {
          // @ts-ignore
          const wakeLock = await navigator.wakeLock.request('screen');
          console.log('[PWA] Wake Lock acquired');
          
          // Release wake lock when page is hidden (but audio continues)
          document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
              // @ts-ignore
              const newWakeLock = await navigator.wakeLock.request('screen');
              console.log('[PWA] Wake Lock re-acquired');
            }
          });
        } catch (err) {
          console.log('[PWA] Wake Lock not available:', err);
        }
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available! Please refresh.');
              
              if (confirm('Yeni bir versiyon mevcut! Sayfayı yenilemek ister misin?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: '/icon-192x192.png',
        ...options,
      });
    }
  }
}

export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  }
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function canInstallPWA(): boolean {
  return 'beforeinstallprompt' in window;
}
