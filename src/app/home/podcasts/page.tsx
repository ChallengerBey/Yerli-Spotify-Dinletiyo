'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic2, Plus, Play, Pause, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Podcast {
  id: string;
  podcast_id: string;
  title: string;
  author: string;
  description: string;
  image_url: string;
  category: string;
  total_episodes: number;
  created_at: string;
}

interface Subscription {
  id: string;
  podcasts: Podcast;
}

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPodcasts();
    fetchSubscriptions();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/podcasts');
      if (response.ok) {
        const data = await response.json();
        setPodcasts(data);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast({
        title: 'Hata',
        description: 'Podcastler yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/podcasts/subscribe');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleSubscribe = async (podcastId: string) => {
    setSubscribing(podcastId);
    try {
      const response = await fetch('/api/podcasts/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ podcast_id: podcastId }),
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Podcast\'e abone oldunuz.',
        });
        fetchSubscriptions();
      } else {
        const error = await response.json();
        toast({
          title: 'Hata',
          description: error.error || 'Abonelik işlemi başarısız.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Hata',
        description: 'Abonelik işlemi sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(null);
    }
  };

  const handleUnsubscribe = async (podcastId: string) => {
    setSubscribing(podcastId);
    try {
      const response = await fetch(`/api/podcasts/subscribe?podcast_id=${podcastId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Podcast aboneliği iptal edildi.',
        });
        fetchSubscriptions();
      } else {
        const error = await response.json();
        toast({
          title: 'Hata',
          description: error.error || 'Abonelik iptali başarısız.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Hata',
        description: 'Abonelik iptali sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(null);
    }
  };

  const isSubscribed = (podcastId: string) => {
    return subscriptions.some(sub => sub.podcasts?.podcast_id === podcastId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic2 className="h-8 w-8" />
            Podcast'ler
          </h1>
          <p className="text-muted-foreground mt-1">
            Favori podcastlerinizi keşfedin ve takip edin
          </p>
        </div>
        <Button onClick={() => router.push('/home/podcasts/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Podcast Ekle
        </Button>
      </div>

      {podcasts.length === 0 ? (
        <div className="text-center py-12">
          <Mic2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Henüz podcast yok</h3>
          <p className="text-muted-foreground mb-4">
            İlk podcast'i siz ekleyin!
          </p>
          <Button onClick={() => router.push('/home/podcasts/create')}>
            <Plus className="h-4 w-4 mr-2" />
            İlk Podcast'i Ekle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((podcast) => (
            <Card key={podcast.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {podcast.image_url ? (
                      <img
                        src={podcast.image_url}
                        alt={podcast.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {podcast.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {podcast.author}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {podcast.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {podcast.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {podcast.category && (
                      <Badge variant="secondary" className="text-xs">
                        {podcast.category}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {podcast.total_episodes} bölüm
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/home/podcasts/${podcast.podcast_id}`)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Dinle
                    </Button>
                    <Button
                      variant={isSubscribed(podcast.podcast_id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSubscribed(podcast.podcast_id)) {
                          handleUnsubscribe(podcast.podcast_id);
                        } else {
                          handleSubscribe(podcast.podcast_id);
                        }
                      }}
                      disabled={subscribing === podcast.podcast_id}
                    >
                      <Heart className={`h-3 w-3 mr-1 ${isSubscribed(podcast.podcast_id) ? 'fill-current' : ''}`} />
                      {subscribing === podcast.podcast_id ? '...' : (isSubscribed(podcast.podcast_id) ? 'Abone' : 'Abone Ol')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
