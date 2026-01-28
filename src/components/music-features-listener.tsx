'use client';

import { useEffect } from 'react';
import { Song } from '@/lib/data';

export function MusicFeaturesListener() {
  useEffect(() => {
    // Radyo başlatma
    const handleStartRadio = (event: any) => {
      const baseSong: Song = event.detail;
      
      // Benzer şarkılar oluştur (demo için)
      const radioSongs: Song[] = [
        baseSong,
        {
          id: 'radio-1',
          title: 'Benzer Şarkı 1',
          artist: 'Benzer Sanatçı 1',
          audioUrl: 'demo-audio-1',
          imageUrl: baseSong.imageUrl,
          duration: '3:22',
          album: 'Radyo Albümü'
        },
        {
          id: 'radio-2',
          title: 'Benzer Şarkı 2',
          artist: 'Benzer Sanatçı 2',
          audioUrl: 'demo-audio-2',
          imageUrl: baseSong.imageUrl,
          duration: '4:15',
          album: 'Radyo Albümü'
        },
        {
          id: 'radio-3',
          title: 'Benzer Şarkı 3',
          artist: 'Benzer Sanatçı 3',
          audioUrl: 'demo-audio-3',
          imageUrl: baseSong.imageUrl,
          duration: '3:48',
          album: 'Radyo Albümü'
        }
      ];
      
      // Radyo listesini kuyruğa ekle
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        // Kuyruğu temizle ve radyo şarkılarını ekle
        radioSongs.forEach((song, index) => {
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
      window.dispatchEvent(new CustomEvent('playSong', { detail: baseSong }));
    };

    // Şarkı indirme
    const handleDownloadSong = (event: any) => {
      const song: Song = event.detail;
      
      // Demo indirme işlemi
      const downloadData = {
        songId: song.id,
        title: song.title,
        artist: song.artist,
        downloadedAt: new Date().toISOString()
      };
      
      // Offline downloads listesine ekle
      const downloads = JSON.parse(localStorage.getItem('offline-downloads') || '[]');
      downloads.push(downloadData);
      localStorage.setItem('offline-downloads', JSON.stringify(downloads));
      
      // Simüle edilmiş indirme progress'i
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          const completeEvent = new CustomEvent('showToast', { 
            detail: { message: `"${song.title}" başarıyla indirildi! 📱`, type: 'success' }
          });
          window.dispatchEvent(completeEvent);
        } else {
          const progressEvent = new CustomEvent('showToast', { 
            detail: { message: `İndiriliyor... %${Math.floor(progress)}`, type: 'info' }
          });
          window.dispatchEvent(progressEvent);
        }
      }, 500);
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