"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';

export default function CreatePlaylistPage() {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      alert('Playlist adı gerekli!');
      return;
    }

    console.log('Playlist oluşturuldu:', {
      name: playlistName,
      description: playlistDescription
    });

    alert('Playlist başarıyla oluşturuldu!');
    setPlaylistName('');
    setPlaylistDescription('');
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
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Açıklama</label>
            <Input 
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              placeholder="Playlist açıklaması (opsiyonel)"
            />
          </div>
          <Button 
            onClick={handleCreatePlaylist}
            className="w-full"
          >
            Playlist Oluştur
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}