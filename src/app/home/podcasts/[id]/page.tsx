'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Clock, Calendar, User, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Episode {
  id: string;
  episode_id: string;
  title: string;
  description: string;
  audio_url: string;
  duration_ms: number;
  episode_number: number;
  season_number: number;
  publish_date: string;
  image_url: string;
}

interface Podcast {
  id: string;
  podcast_id: string;
  title: string;
  author: string;
  description: string;
  image_url: string;
  category: string;
  total_episodes: number;
  episodes: Episode[];
}

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPodcast(params.id as string);
    }
  }, [params.id]);

  const fetchPodcast = async (podcastId: string) => {
    try {
      const response = await fetch(`/api/podcasts/${podcastId}`);
      if (response.ok) {
        const data = await response.json();
        setPodcast(data);
      } else {
        toast({
          title: 'Hata',
          description: 'Podcast bulunamadı.',
          variant: 'destructive',
        });
        router.push('/home/podcasts');
      }
    } catch (error) {
      console.error('Error fetching podcast:', error);
      toast({
        title: 'Hata',
        description: 'Podcast yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const playEpisode = (episode: Episode) => {
    const songData = {
      id: episode.id,
      title: episode.title,
      artist: podcast?.author || '',
      album: podcast?.title || '',
      duration: formatDuration(episode.duration_ms),
      imageUrl: episode.image_url || podcast?.image_url || 'https://placehold.co/64x64.png',
      audioUrl: episode.audio_url,
      aiHint: 'podcast episode'
    };
    
    window.dispatchEvent(new CustomEvent('playSong', { detail: songData }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="text-center py-12">
        <Mic2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Podcast bulunamadı</h3>
        <Button onClick={() => router.push('/home/podcasts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted flex-shrink-0 mx-auto md:mx-0">
                {podcast.image_url ? (
                  <img
                    src={podcast.image_url}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Mic2 className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{podcast.title}</h1>
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {podcast.author}
                  </p>
                </div>
                {podcast.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {podcast.description}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  {podcast.category && (
                    <Badge variant="secondary">
                      {podcast.category}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {podcast.total_episodes} bölüm
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bölümler</CardTitle>
          </CardHeader>
          <CardContent>
            {podcast.episodes && podcast.episodes.length > 0 ? (
              <div className="space-y-4">
                {podcast.episodes
                  .sort((a, b) => b.episode_number - a.episode_number)
                  .map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {episode.image_url || podcast.image_url ? (
                          <img
                            src={episode.image_url || podcast.image_url}
                            alt={episode.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Mic2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-2 mb-1">
                              {episode.title}
                            </h3>
                            {episode.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {episode.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(episode.publish_date)}
                              </span>
                              {episode.duration_ms && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(episode.duration_ms)}
                                </span>
                              )}
                              <span>Bölüm {episode.episode_number}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => playEpisode(episode)}
                            className="flex-shrink-0"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Dinle
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mic2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz bölüm yok</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}