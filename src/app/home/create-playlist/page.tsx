'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, Music, Save, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreatePlaylistPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    imageUrl: '',
    youtubePlaylistUrl: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [fetchedSongs, setFetchedSongs] = useState<any[]>([]);
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean | null;
    type: 'PL' | 'RD' | 'UU' | 'OL' | 'invalid' | null;
    message: string;
  }>({
    isValid: null,
    type: null,
    message: ''
  });

  // Real-time URL validation
  const validatePlaylistUrl = (url: string) => {
    if (!url.trim()) {
      setUrlValidation({ isValid: null, type: null, message: '' });
      return;
    }

    try {
      const urlObj = new URL(url);
      const listParam = urlObj.searchParams.get('list');
      
      if (!listParam) {
        setUrlValidation({
          isValid: false,
          type: 'invalid',
          message: 'Geçersiz playlist linki. "list=" parametresi bulunamadı.'
        });
        return;
      }

      // Check playlist type
      if (listParam.startsWith('PL')) {
        setUrlValidation({
          isValid: true,
          type: 'PL',
          message: '✓ Normal playlist - Destekleniyor!'
        });
      } else if (listParam.startsWith('UU')) {
        setUrlValidation({
          isValid: true,
          type: 'UU',
          message: '✓ Kanal playlist - Destekleniyor!'
        });
      } else if (listParam.startsWith('OL')) {
        setUrlValidation({
          isValid: true,
          type: 'OL',
          message: '✓ Resmi playlist - Destekleniyor!'
        });
      } else if (listParam.startsWith('RD')) {
        setUrlValidation({
          isValid: false,
          type: 'RD',
          message: '⚠️ Bu bir Radio/Mix playlist! Bu tür playlist\'ler desteklenmiyor.'
        });
      } else {
        setUrlValidation({
          isValid: false,
          type: 'invalid',
          message: 'Bilinmeyen playlist türü. Lütfen normal bir playlist linki kullanın.'
        });
      }
    } catch (error) {
      setUrlValidation({
        isValid: false,
        type: 'invalid',
        message: 'Geçersiz URL formatı.'
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation for YouTube URL
    if (field === 'youtubePlaylistUrl' && typeof value === 'string') {
      validatePlaylistUrl(value);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  // YouTube playlist'inden şarkıları çek
  const fetchPlaylistSongs = async () => {
    if (!formData.youtubePlaylistUrl.trim()) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir YouTube playlist linki girin.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingSongs(true);

    try {
      console.log('🔍 Playlist çekiliyor:', formData.youtubePlaylistUrl);
      
      const response = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistUrl: formData.youtubePlaylistUrl
        }),
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Playlist şarkıları yüklenemedi');
      }

      if (data.songs && data.songs.length > 0) {
        console.log('✅ Şarkılar yüklendi:', data.songs.length);
        setFetchedSongs(data.songs);
        
        // Eğer playlist adı boşsa, YouTube playlist adını kullan
        if (!formData.name.trim() && data.title) {
          setFormData(prev => ({ ...prev, name: data.title }));
        }

        toast({
          title: 'Başarılı!',
          description: `${data.songs.length} şarkı yüklendi.`,
        });
      } else {
        console.log('⚠️ Şarkı bulunamadı');
        toast({
          title: 'Uyarı',
          description: 'Playlist\'te şarkı bulunamadı. Lütfen farklı bir link deneyin.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching playlist:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Playlist şarkıları yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSongs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Hata',
        description: 'Playlist adı zorunludur.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Önce playlist'i oluştur
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic,
          imageUrl: imagePreview || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Playlist oluşturulamadı');
      }

      const playlistId = data.playlist.id;

      // Eğer şarkılar varsa, onları da ekle
      if (fetchedSongs.length > 0) {
        for (const song of fetchedSongs) {
          // API'den gelen şarkı formatı zaten doğru
          await fetch(`/api/playlists/${playlistId}/songs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ song }),
          });
        }
      }

      toast({
        title: 'Başarılı!',
        description: `"${formData.name}" playlist'i ${fetchedSongs.length} şarkı ile oluşturuldu.`,
      });

      // Redirect to playlist detail page
      router.push(`/home/playlist/${playlistId}`);
      
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Playlist oluşturulurken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold">Yeni Playlist Oluştur</h1>
          <p className="text-muted-foreground">
            Kendi müzik koleksiyonunu oluştur
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* YouTube Playlist Import Card */}
        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Music className="h-5 w-5 animate-pulse" />
              YouTube & YouTube Music Playlist Aktar
            </CardTitle>
            <CardDescription>
              YouTube veya YouTube Music playlist bağlantısını yapıştırarak müziklerini buraya aktarabilirsin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubePlaylistUrl}
                    onChange={(e) => handleInputChange('youtubePlaylistUrl', e.target.value)}
                    placeholder="https://youtube.com/playlist?list=PLxxx..."
                    disabled={loadingSongs}
                    className={`pr-10 transition-all duration-300 ${
                      urlValidation.isValid === true 
                        ? 'border-green-500 focus-visible:ring-green-500 shadow-green-500/20 shadow-lg' 
                        : urlValidation.isValid === false 
                        ? 'border-red-500 focus-visible:ring-red-500 shadow-red-500/20 shadow-lg' 
                        : ''
                    }`}
                  />
                  {/* Validation Icon */}
                  {urlValidation.isValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-300">
                      {urlValidation.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 animate-pulse" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={fetchPlaylistSongs}
                  disabled={loadingSongs || !formData.youtubePlaylistUrl.trim() || urlValidation.isValid === false}
                  variant="outline"
                  className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                >
                  {loadingSongs ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Music className="h-4 w-4 mr-2" />
                      Şarkıları Çek
                    </>
                  )}
                </Button>
              </div>
              
              {/* Validation Message */}
              {urlValidation.message && (
                <div className={`flex items-start gap-2 p-4 rounded-lg animate-in slide-in-from-top-2 duration-300 ${
                  urlValidation.isValid 
                    ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800'
                }`}>
                  {urlValidation.isValid ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 animate-bounce" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 animate-bounce" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className={`text-base font-bold ${
                      urlValidation.isValid 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {urlValidation.message}
                    </p>
                    {urlValidation.type === 'RD' && (
                      <div className="space-y-2 text-sm text-red-800 dark:text-red-200">
                        <p className="font-semibold">
                          🚫 Neden çalışmıyor?
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Radio/Mix playlist'leri YouTube'un özel algoritması ile oluşturulur</li>
                          <li>Bu playlist'ler dinamiktir ve her kullanıcı için farklı şarkılar içerir</li>
                          <li>YouTube API bu tür playlist'lere erişim izni vermiyor</li>
                        </ul>
                        
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-700 rounded-md">
                          <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                            💡 Çözüm:
                          </p>
                          <p className="text-yellow-800 dark:text-yellow-200">
                            Lütfen <strong>normal bir YouTube playlist</strong> kullanın. YouTube'da kendi oluşturduğunuz veya başkalarının paylaştığı <strong>PL</strong> ile başlayan playlist'leri kullanabilirsiniz.
                          </p>
                        </div>
                        
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 rounded-md">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            <strong>Nasıl bulabilirim?</strong> YouTube'da "Kitaplık" → "Playlist'ler" bölümünden kendi playlist'lerinizi veya beğendiğiniz playlist'leri kullanabilirsiniz.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Info Box */}
              <div className="p-4 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">Desteklenen Playlist Türleri:</p>
                    </div>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Normal Playlist'ler (list=<strong>PL</strong>xxx)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Kanal Playlist'leri (list=<strong>UU</strong>xxx)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Resmi Playlist'ler (list=<strong>OL</strong>xxx)
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400">Desteklenmeyen:</p>
                    </div>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                      <li className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Radio/Mix (list=<strong>RD</strong>xxx)
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Özel/Private Playlist'ler
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {fetchedSongs.length > 0 && (
                <div className="mt-2 p-4 bg-green-500/10 border-2 border-green-500/30 rounded-lg animate-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 animate-bounce" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-bold">
                        🎉 {fetchedSongs.length} şarkı başarıyla yüklendi!
                      </p>
                      <p className="text-xs text-green-600/80 dark:text-green-400/80">
                        Playlist oluşturduğunuzda bu şarkılar eklenecek.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Playlist Bilgileri</CardTitle>
            <CardDescription>
              Playlist'inin temel bilgilerini gir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Kapak Resmi</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-32 w-32 rounded-lg">
                  <AvatarImage 
                    src={imagePreview} 
                    alt="Playlist kapağı"
                    className="object-cover"
                  />
                  <AvatarFallback className="h-32 w-32 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Music className="h-8 w-8 text-white" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Resim Yükle
                    </Button>
                    
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG veya GIF (max 5MB)
                  </p>
                  
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Playlist Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Playlist Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Playlist'ine bir ad ver"
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.name.length}/100 karakter
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Playlist'in hakkında kısa bir açıklama yaz (isteğe bağlı)"
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/300 karakter
              </p>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="public">Herkese Açık Playlist</Label>
                <p className="text-sm text-muted-foreground">
                  Diğer kullanıcılar bu playlist'i görebilir ve dinleyebilir
                </p>
              </div>
              <Switch
                id="public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={loading || !formData.name.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Playlist Oluştur
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
          >
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}