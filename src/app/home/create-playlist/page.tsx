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
import { ArrowLeft, Upload, Music, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreatePlaylistPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    imageUrl: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

      toast({
        title: 'Başarılı!',
        description: `"${formData.name}" playlist'i oluşturuldu.`,
      });

      // Redirect to playlists page
      router.push('/home/playlists');
      
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