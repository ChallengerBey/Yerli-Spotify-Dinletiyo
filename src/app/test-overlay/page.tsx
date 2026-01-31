'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestOverlayPage() {
  const [userId, setUserId] = useState('test-user-123');
  const [isPlaying, setIsPlaying] = useState(false);

  const testSong = {
    id: 'test-song',
    title: 'Test Şarkısı - Overlay Testi',
    artist: 'Test Sanatçısı',
    album: 'Test Albümü',
    duration: '3:45',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    audioUrl: 'test-audio-url',
    aiHint: 'test'
  };

  const sendNowPlaying = async () => {
    try {
      const response = await fetch('/api/now-playing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          song: testSong,
          progress: 45,
          duration: 225,
          isPlaying: true
        }),
      });

      if (response.ok) {
        setIsPlaying(true);
        alert('Now playing güncellendi! Overlay sayfasını kontrol edin.');
      } else {
        const error = await response.json();
        alert('Hata: ' + error.error);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('Bağlantı hatası');
    }
  };

  const stopNowPlaying = async () => {
    try {
      const response = await fetch(`/api/now-playing?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsPlaying(false);
        alert('Now playing temizlendi!');
      }
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const openOverlay = () => {
    const overlayUrl = `/overlay/${userId}?theme=modern&position=bottom-left&size=medium&opacity=95&progress=true&artwork=true&branding=true`;
    window.open(overlayUrl, '_blank', 'width=1200,height=800');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overlay Test Sayfası</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">User ID:</label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Kullanıcı ID'si girin"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={sendNowPlaying} disabled={isPlaying}>
              Now Playing Başlat
            </Button>
            <Button onClick={stopNowPlaying} variant="outline" disabled={!isPlaying}>
              Now Playing Durdur
            </Button>
            <Button onClick={openOverlay} variant="secondary">
              Overlay'i Aç
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Test Şarkısı:</h3>
            <p><strong>Başlık:</strong> {testSong.title}</p>
            <p><strong>Sanatçı:</strong> {testSong.artist}</p>
            <p><strong>Durum:</strong> {isPlaying ? '▶️ Çalıyor' : '⏸️ Durdu'}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Nasıl Test Edilir:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>User ID'yi ayarlayın (varsayılan: test-user-123)</li>
              <li>"Overlay'i Aç" butonuna tıklayın</li>
              <li>"Now Playing Başlat" butonuna tıklayın</li>
              <li>Overlay penceresinde şarkının görünmesini bekleyin</li>
              <li>"Now Playing Durdur" ile testi sonlandırın</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}