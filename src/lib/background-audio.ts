// Background Audio Helper - PWA için arka plan müzik çalma desteği

let wakeLock: any = null;

export async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return false;
  try {
    // @ts-ignore
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('[BG Audio] Wake Lock aktif');
    return true;
  } catch (err) {
    return false;
  }
}

export async function releaseWakeLock() {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
      wakeLock = null;
    } catch (err) {
      console.error('Wake Lock release error:', err);
    }
  }
}

export function setupMediaSession(
  title: string,
  artist: string,
  artwork: string,
  onPlay: () => void,
  onPause: () => void,
  onPrevious: () => void,
  onNext: () => void
) {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    artwork: [
      { src: artwork, sizes: '96x96', type: 'image/png' },
      { src: artwork, sizes: '128x128', type: 'image/png' },
      { src: artwork, sizes: '192x192', type: 'image/png' },
      { src: artwork, sizes: '256x256', type: 'image/png' },
      { src: artwork, sizes: '384x384', type: 'image/png' },
      { src: artwork, sizes: '512x512', type: 'image/png' },
    ],
  });

  navigator.mediaSession.setActionHandler('play', onPlay);
  navigator.mediaSession.setActionHandler('pause', onPause);
  navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
  navigator.mediaSession.setActionHandler('nexttrack', onNext);
}

export function updateMediaSessionPosition(duration: number, position: number) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.setPositionState({ duration, position, playbackRate: 1.0 });
  } catch (err) {}
}

export function updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none') {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.playbackState = state;
  } catch (err) {}
}

export async function requestPersistentStorage() {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) return false;
  try {
    const isPersisted = await navigator.storage.persist();
    console.log(`[BG Audio] Persistent Storage: ${isPersisted}`);
    return isPersisted;
  } catch (err) {
    return false;
  }
}

export async function initializeBackgroundAudio() {
  console.log('[BG Audio] Başlatılıyor...');
  await requestPersistentStorage();
  
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        try {
          // @ts-ignore
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {}
      }
    });
  }
}
