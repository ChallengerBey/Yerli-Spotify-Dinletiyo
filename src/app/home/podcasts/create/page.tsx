'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Episode {
  episode_id: string;
  title: string;
  description: string;
  audio_url: string;
  audio_file?: File;
  duration_ms: number;
  episode_number: number;
  season_number: number;
  publish_date: string;
  image_url: string;
  upload_progress?: number;
  uploading?: boolean;
}

export default function CreatePodcastPage() {
  const [formData, setFormData] = useState({
    podcast_id: '',
    title: '',
    author: '',
    description: '',
    image_url: '',
    rss_feed_url: '',
    category: '',
    language: 'tr'
  });

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addEpisode = () => {
    const newEpisode: Episode = {
      episode_id: `episode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      description: '',
      audio_url: '',
      duration_ms: 0,
      episode_number: episodes.length + 1,
      season_number: 1,
      publish_date: new Date().toISOString(),
      image_url: ''
    };
    setEpisodes(prev => [...prev, newEpisode]);
  };

  const updateEpisode = (index: number, field: keyof Episode, value: string | number) => {
    setEpisodes(prev => prev.map((episode, i) =>
      i === index ? { ...episode, [field]: value } : episode
    ));
  };

  const removeEpisode = (index: number) => {
    setEpisodes(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (index: number, file: File) => {
    // Update episode with file
    setEpisodes(prev => prev.map((ep, i) =>
      i === index ? { ...ep, audio_file: file, uploading: true } : ep
    ));

    try {
      const formData = new FormData();
      formData.append('audio', file);

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/podcasts/upload', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEpisodes(prev => prev.map((ep, i) =>
          i === index ? {
            ...ep,
            audio_url: data.url,
            uploading: false,
            upload_progress: 100
          } : ep
        ));
        toast({
          title: 'Başarılı',
          description: 'Ses dosyası yüklendi!',
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setEpisodes(prev => prev.map((ep, i) =>
        i === index ? { ...ep, uploading: false } : ep
      ));
      toast({
        title: 'Hata',
        description: 'Ses dosyası yüklenirken hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.podcast_id || !formData.title || !formData.author) {
        toast({
          title: 'Hata',
          description: 'Podcast ID, başlık ve yazar alanları zorunludur.',
          variant: 'destructive',
        });
        return;
      }

      // Filter out empty episodes
      const validEpisodes = episodes.filter(episode =>
        episode.title.trim() && episode.audio_url.trim()
      );

      const payload = {
        ...formData,
        episodes: validEpisodes
      };

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/podcasts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      console.log('Create response status:', response.status);
      console.log('Create response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Create response data:', data);
        toast({
          title: 'Başarılı',
          description: 'Podcast başarıyla oluşturuldu!',
        });
        router.push('/home/podcasts');
      } else {
        try {
          const error = await response.json();
          console.log('Create error response:', error);
          toast({
            title: 'Hata',
            description: error.error || 'Podcast oluşturma başarısız.',
            variant: 'destructive',
          });
        } catch (parseError) {
          console.log('Error parsing response:', parseError);
          toast({
            title: 'Hata',
            description: 'Podcast oluşturma başarısız.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error creating podcast:', error);
      toast({
        title: 'Hata',
        description: 'Podcast oluşturma sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div>
          <h1 className="text-3xl font-bold">Yeni Podcast Ekle</h1>
          <p className="text-muted-foreground">
            Podcast bilgilerini ve bölümlerini ekleyin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Podcast Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="podcast_id">Podcast ID *</Label>
                <Input
                  id="podcast_id"
                  value={formData.podcast_id}
                  onChange={(e) => handleInputChange('podcast_id', e.target.value)}
                  placeholder="benzersiz-podcast-id"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Benzersiz bir ID girin (sadece harf, rakam ve tire)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Teknoloji, Müzik, vb."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Podcast başlığı"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Yazar/Podcast Sahibi *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Podcast sahibi veya kanal adı"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Podcast hakkında kısa açıklama"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Kapak Resmi URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rss_feed_url">RSS Feed URL</Label>
                <Input
                  id="rss_feed_url"
                  value={formData.rss_feed_url}
                  onChange={(e) => handleInputChange('rss_feed_url', e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  type="url"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bölümler</CardTitle>
            <Button type="button" variant="outline" onClick={addEpisode}>
              <Plus className="h-4 w-4 mr-2" />
              Bölüm Ekle
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {episodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Henüz bölüm eklenmemiş</p>
                <p className="text-sm">Bölüm eklemek için yukarıdaki butona tıklayın</p>
              </div>
            ) : (
              <div className="space-y-4">
                {episodes.map((episode, index) => (
                  <Card key={episode.episode_id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Bölüm {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEpisode(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Başlık *</Label>
                          <Input
                            value={episode.title}
                            onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                            placeholder="Bölüm başlığı"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Süre (saniye)</Label>
                          <Input
                            type="number"
                            value={episode.duration_ms ? Math.floor(episode.duration_ms / 1000) : ''}
                            onChange={(e) => updateEpisode(index, 'duration_ms', parseInt(e.target.value) * 1000 || 0)}
                            placeholder="1800"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Açıklama</Label>
                        <Textarea
                          value={episode.description}
                          onChange={(e) => updateEpisode(index, 'description', e.target.value)}
                          placeholder="Bölüm açıklaması"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ses Dosyası *</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(index, file);
                              }
                            }}
                            className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                          {episode.uploading && (
                            <div className="text-sm text-muted-foreground">Yükleniyor...</div>
                          )}
                          {episode.audio_url && !episode.uploading && (
                            <div className="text-sm text-green-600">✓ Yüklendi</div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          MP3, WAV, M4A vb. formatlar desteklenir (max 100MB)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Kapak Resmi URL</Label>
                        <Input
                          value={episode.image_url}
                          onChange={(e) => updateEpisode(index, 'image_url', e.target.value)}
                          placeholder="https://example.com/episode-image.jpg"
                          type="url"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Bölüm Numarası</Label>
                          <Input
                            type="number"
                            value={episode.episode_number}
                            onChange={(e) => updateEpisode(index, 'episode_number', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sezon Numarası</Label>
                          <Input
                            type="number"
                            value={episode.season_number}
                            onChange={(e) => updateEpisode(index, 'season_number', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Yayın Tarihi</Label>
                          <Input
                            type="datetime-local"
                            value={episode.publish_date ? new Date(episode.publish_date).toISOString().slice(0, 16) : ''}
                            onChange={(e) => updateEpisode(index, 'publish_date', new Date(e.target.value).toISOString())}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Oluşturuluyor...' : 'Podcast Oluştur'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}
