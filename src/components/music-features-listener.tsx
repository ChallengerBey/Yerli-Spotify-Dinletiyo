'use client';

import { useEffect } from 'react';
import { Song } from '@/lib/data';

export function MusicFeaturesListener() {
  useEffect(() => {
    // Radyo başlatma
    const handleStartRadio = (event: any) => {
      // Radyo/benzer şarkılar üretimi Player içinde gerçek akışla yapılıyor.
      // Bu listener sadece geriye dönük uyumluluk için var.
      const baseSong: Song = event.detail;
      window.dispatchEvent(new CustomEvent('startRadio', { detail: baseSong }));
    };

    // Şarkı indirme
    const handleDownloadSong = (event: any) => {
      const song: Song = event.detail;
      const toastEvent = new CustomEvent('showToast', {
        detail: { message: `"${song.title}" indirilebilir değil (yakında).`, type: 'info' }
      });
      window.dispatchEvent(toastEvent);
    };

    // Shuffle playlist
    const handleShufflePlaylist = (event: any) => {
      const songs: Song[] = event.detail;
      
      // Şarkıları karıştır
      const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      
      // Karışık listeyi kuyruğa ekle
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        shuffledSongs.forEach((song, index) => {
          fetch('/api/user-data/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id,
              song: song,
              playNext: index === 0
            }),
          }).catch(console.error);
        });
      }
      
      // İlk şarkıyı çal
      if (shuffledSongs.length > 0) {
        window.dispatchEvent(new CustomEvent('playSong', { detail: shuffledSongs[0] }));
      }
      
      const toastEvent = new CustomEvent('showToast', { 
        detail: { message: `${shuffledSongs.length} şarkı karıştırıldı! 🔀`, type: 'success' }
      });
      window.dispatchEvent(toastEvent);
    };

    // Repeat song
    const handleRepeatSong = (event: any) => {
      const song: Song = event.detail;
      
      // Repeat mode'u localStorage'a kaydet
      localStorage.setItem('repeat-mode', 'single');
      localStorage.setItem('repeat-song', JSON.stringify(song));
      
      const toastEvent = new CustomEvent('showToast', { 
        detail: { message: `"${song.title}" tekrar modunda! 🔁`, type: 'info' }
      });
      window.dispatchEvent(toastEvent);
    };

    // Event listener'ları ekle
    window.addEventListener('startRadio', handleStartRadio);
    window.addEventListener('downloadSong', handleDownloadSong);
    window.addEventListener('shufflePlaylist', handleShufflePlaylist);
    window.addEventListener('repeatSong', handleRepeatSong);
    
    return () => {
      window.removeEventListener('startRadio', handleStartRadio);
      window.removeEventListener('downloadSong', handleDownloadSong);
      window.removeEventListener('shufflePlaylist', handleShufflePlaylist);
      window.removeEventListener('repeatSong', handleRepeatSong);
    };
  }, []);

  return null;
}