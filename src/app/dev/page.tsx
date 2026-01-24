'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SongCard } from '@/components/song-card';
import { Song, Playlist } from '@/lib/data';

const mockSong: Song = {
  id: 'test-1',
  title: 'Test Şarkısı',
  artist: 'Test Sanatçı',
  album: 'Test Albüm',
  duration: '3:45',
  imageUrl: 'https://placehold.co/300x300.png',
  audioUrl: 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3',
  aiHint: 'test music'
};

const mockPlaylist: Playlist = {
  id: 'test-playlist-1',
  title: 'Test Çalma Listesi',
  description: 'Test çalma listesi açıklaması',
  imageUrl: 'https://placehold.co/300x300.png',
  aiHint: 'test playlist',
  songs: [mockSong]
};

export default function ContextMenuTestPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  // Kuyruğu ve favorileri yükle
  useEffect(() => {
    const loadQueueAndFavorites = async () => {
      try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          
          // Kuyruğu yükle
          const queueResponse = await fetch(`/api/user-data/queue?userId=${userData.id}`);
          if (queueResponse.ok) {
            const queueData = await queueResponse.json();
            setQueue(queueData.queue);
          }
          
          // Favorileri yükle
          const favoritesResponse = await fetch(`/api/user-data/favorites?userId=${userData.id}`);
          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json();
            setFavorites(favoritesData.favorites);
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };
    
    loadQueueAndFavorites();
  }, []);

  const clearQueue = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        // Tüm kuyruğu temizle
        for (const song of queue) {
          await fetch(`/api/user-data/queue?userId=${userData.id}&songId=${song.id}`, {
            method: 'DELETE'
          });
        }
        
        setQueue([]);
      }
    } catch (error) {
      console.error('Kuyruk temizleme hatası:', error);
    }
  };

  const clearFavorites = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        
        // Tüm favorileri temizle
        for (const song of favorites) {
          await fetch(`/api/user-data/favorites?userId=${userData.id}&songId=${song.id}`, {
            method: 'DELETE'
          });
        }
        
        setFavorites([]);
      }
    } catch (error) {
      console.error('Favori temizleme hatası:', error);
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Context Menu Test Sayfası</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Test Şarkıları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SongCard item={mockSong} />
                <SongCard item={mockPlaylist} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kuyruk</h2>
                <Button variant="destructive" onClick={clearQueue}>Kuyruğu Temizle</Button>
              </div>
              {queue.length > 0 ? (
                <div className="space-y-2">
                  {queue.map((song: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <img src={song.imageUrl} alt={song.title} className="w-10 h-10 rounded" />
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Kuyrukta şarkı yok</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Favoriler</h2>
                <Button variant="destructive" onClick={clearFavorites}>Favorileri Temizle</Button>
              </div>
              {favorites.length > 0 ? (
                <div className="space-y-2">
                  {favorites.map((song: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <img src={song.imageUrl} alt={song.title} className="w-10 h-10 rounded" />
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Favori şarkı yok</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}