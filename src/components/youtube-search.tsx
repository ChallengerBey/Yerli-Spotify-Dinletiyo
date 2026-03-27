'use client';

import { useState } from 'react';
import { Search, Music, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export function YoutubeSearch() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchVideos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Arama sırasında bir hata oluştu');
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Arama hatası:', err);
      setError('Müzik aranırken bir hata oluştu');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const playVideo = (video: Video) => {
    // Direkt video ID'sini player'a gönder
    const songData = {
      id: video.id,
      title: video.title,
      artist: video.channelTitle,
      album: '',
      duration: '0:00',
      imageUrl: video.thumbnail,
      audioUrl: video.id, // Sadece video ID'sini gönder
      aiHint: 'youtube'
    };
    
    window.dispatchEvent(new CustomEvent('playSong', { detail: songData }));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={searchVideos} className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Müzik ara..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aranıyor...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Ara
            </>
          )}
        </Button>
      </form>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => playVideo(video)}>
            <div className="relative h-40">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white/90 rounded-full p-3">
                    <Play className="h-6 w-6 text-black fill-black" />
                  </div>
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">{video.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-xs text-muted-foreground">
                <Music className="mr-1 h-3 w-3" />
                Müzik
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
