"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function CreatePlaylistPage() {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast({
        title: "Hata",
        description: "Playlist adı gerekli!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Hata",
          description: "Giriş yapmanız gerekiyor",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: playlistName.trim(),
          description: playlistDescription.trim() || null,
          is_public: isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Playlist oluşturulamadı');
      }

      toast({
        title: "Başarılı",
        description: "Playlist başarıyla oluşturuldu!",
      });

      setPlaylistName('');
      setPlaylistDescription('');
      setIsPublic(false);
      
      // Playlists sayfasına yönlendir
      router.push('/home/playlists');
    } catch (error: any) {
      console.error('Playlist creation error:', error);
      toast({
        title: "Hata",
        description: error.message || "Playlist oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Yeni Playlist Oluştur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Playlist Adı</label>
            <Input 
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Playlist adını girin"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Açıklama</label>
            <Input 
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              placeholder="Playlist açıklaması (opsiyonel)"
              disabled={loading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm font-medium">
              Herkese açık playlist
            </label>
          </div>
          <Button 
            onClick={handleCreatePlaylist}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              'Playlist Oluştur'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}