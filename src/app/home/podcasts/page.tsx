'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Play, Clock, Users, Mic2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Podcast {
  id: string;
  podcast_id: string;
  title: string;
  author: string;
  description: string;
  image_url: string;
  category: string;
  language: string;
  total_episodes: number;
  created_at: string;
}

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/podcasts');
      if (response.ok) {
        const data = await response.json();
        setPodcasts(data);
      } else {
        // Mock data if API fails
        const mockPodcasts: Podcast[] = [
          {
            id: '1',
            podcast_id: 'teknoloji-sohbetleri',
            title: 'Teknoloji Sohbetleri',
            author: 'Tech Guru',
            description: 'Teknoloji dünyasından son gelişmeler ve derinlemesine analizler',
            image_url: 'https://picsum.photos/300/300?random=1',
            category: 'Teknoloji',
            language: 'tr',
            total_episodes: 25,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            podcast_id: 'muzik-hikayeleri',
            title: 'Müzik Hikayeleri',
            author: 'Müzik Aşığı',
            description: 'Ünlü şarkıların ve sanatçıların hikayelerini keşfedin',
            image_url: 'https://picsum.photos/300/300?random=2',
            category: 'Müzik',
            language: 'tr',
            total_episodes: 18,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            podcast_id: 'gunluk-sohbet',
            title: 'Günlük Sohbet',
            author: 'Sohbet Ustası',
            description: 'Güncel olaylar ve yaşamdan kesitler üzerine samimi sohbetler',
            image_url: 'https://picsum.photos/300/300?random=3',
            category: 'Genel',
            language: 'tr',
            total_episodes: 42,
            created_at: new Date().toISOString()
          }
        ];
        setPodcasts(mockPodcasts);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast({
        title: 'Hata',
        description: 'Podcast\'ler yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePodcastClick = (podcastId: string) => {
    router.push(`/home/podcasts/${podcastId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Podcast'ler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Podcast'ler</h1>
          <p className="text-muted-foreground">
            Favori podcast'lerinizi keşfedin ve dinleyin
          </p>
        </div>
        <Button onClick={() => router.push('/home/podcasts/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Podcast
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Podcast ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPodcasts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mic2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz podcast yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              İlk podcast'inizi oluşturun veya mevcut podcast'leri keşfedin
            </p>
            <Button onClick={() => router.push('/home/podcasts/create')}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Podcast'inizi Oluşturun
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPodcasts.map((podcast) => (
            <Card
              key={podcast.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePodcastClick(podcast.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={podcast.image_url} alt={podcast.title} />
                    <AvatarFallback>
                      {podcast.title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{podcast.title}</CardTitle>
                    <CardDescription className="truncate">
                      {podcast.author}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {podcast.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{podcast.category}</Badge>
                  <Badge variant="outline">{podcast.language.toUpperCase()}</Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{podcast.total_episodes} bölüm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>0 takipçi</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePodcastClick(podcast.id);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Dinle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}