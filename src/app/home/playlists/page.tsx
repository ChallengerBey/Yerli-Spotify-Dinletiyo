'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Play, Clock, Music, Heart, MoreHorizontal, Shuffle } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  songCount: number;
  duration: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  isLiked?: boolean;
}

export default function PlaylistsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - gerçek uygulamada API'den gelecek
  const mockPlaylists: Playlist[] = [
    {
      id: '2',
      name: 'Türkçe Pop Hits',
      description: 'En popüler Türkçe şarkılar',
      imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
      songCount: 30,
      duration: '1s 58dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Odaklanma Zamanı',
      description: 'Çalışma ve odaklanma için sakin müzikler',
      imageUrl: '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png',
      songCount: 28,
      duration: '1s 52dk',
      isPublic: false,
      createdBy: 'Sen',
      createdAt: '2024-01-08'
    },
    {
      id: '4',
      name: 'Antrenman Modu',
      description: 'Spor yaparken dinlenecek enerjik şarkılar',
      imageUrl: '/Fotoğraflar/ANTREMANMODU.333Z.png',
      songCount: 25,
      duration: '1s 23dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2024-01-05'
    },
    {
      id: '5',
      name: '90\'lar Nostalji',
      description: '90\'ların unutulmaz şarkıları',
      imageUrl: '/Fotoğraflar/90lar.973Z.png',
      songCount: 40,
      duration: '2s 15dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2024-01-01'
    },
    {
      id: '6',
      name: 'Akustik Akşamlar',
      description: 'Sakin akşamlar için akustik şarkılar',
      imageUrl: '/Fotoğraflar/akustik akşamlar.911Z.png',
      songCount: 18,
      duration: '1s 8dk',
      isPublic: false,
      createdBy: 'Sen',
      createdAt: '2023-12-28'
    },
    {
      id: '7',
      name: 'Türkçe Rock',
      description: 'Türk rock müziğinin en iyileri',
      imageUrl: '/Fotoğraflar/TÜKRÇE ROCK.037Z.png',
      songCount: 35,
      duration: '2s 8dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2023-12-25'
    },
    {
      id: '8',
      name: 'Damar Şarkılar',
      description: 'Kalbe dokunan damar şarkılar',
      imageUrl: '/Fotoğraflar/damarşarkılar.917Z.png',
      songCount: 22,
      duration: '1s 34dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2023-12-20'
    },
    {
      id: '9',
      name: 'Elektronik Dans',
      description: 'Dans etmek için elektronik müzikler',
      imageUrl: '/Fotoğraflar/elektronik dans.885Z.png',
      songCount: 30,
      duration: '1s 58dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2023-12-18'
    },
    {
      id: '10',
      name: 'Yeni Nesil Rap',
      description: 'Türkiye\'nin yeni nesil rap sanatçıları',
      imageUrl: '/Fotoğraflar/YENİNESİLRAP.797Z.png',
      songCount: 26,
      duration: '1s 42dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2023-12-15'
    },
    {
      id: '11',
      name: 'Yolculuk Şarkıları',
      description: 'Uzun yolculuklar için keyifli şarkılar',
      imageUrl: '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
      songCount: 33,
      duration: '2s 12dk',
      isPublic: false,
      createdBy: 'Sen',
      createdAt: '2023-12-12'
    },
    {
      id: '12',
      name: 'Efsane Şarkılar',
      description: 'Hiç eskimeyen efsane şarkılar',
      imageUrl: '/Fotoğraflar/Efsaneşarkılar.885Z.png',
      songCount: 45,
      duration: '2s 38dk',
      isPublic: true,
      createdBy: 'Sen',
      createdAt: '2023-12-10'
    },
    {
      id: '13',
      name: 'Haftanın Keşifleri',
      description: 'Bu hafta keşfettiğin yeni şarkılar',
      imageUrl: '/Fotoğraflar/haftanın keşifleri.341Z.png',
      songCount: 15,
      duration: '52dk',
      isPublic: false,
      createdBy: 'Sen',
      createdAt: '2023-12-08'
    }
  ];

  const filteredPlaylists = mockPlaylists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/home/playlist/${playlistId}`);
  };

  const handleCreatePlaylist = () => {
    router.push('/home/create-playlist');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Playlistlerin</h1>
          <p className="text-muted-foreground">
            Kendi müzik koleksiyonunu oluştur ve yönet
          </p>
        </div>
        <Button onClick={handleCreatePlaylist}>
          <Plus className="h-4 w-4 mr-2" />
          Playlist Oluştur
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Playlist ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPlaylists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz playlist yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              İlk playlist'ini oluştur ve favori şarkılarını topla
            </p>
            <Button onClick={handleCreatePlaylist}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Playlist'ini Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaylists.map((playlist) => (
            <Card
              key={playlist.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => handlePlaylistClick(playlist.id)}
            >
              <CardHeader className="pb-3">
                <div className="relative">
                  <Avatar className="h-48 w-full rounded-lg">
                    <AvatarImage 
                      src={playlist.imageUrl} 
                      alt={playlist.name}
                      className="object-cover w-full h-full"
                    />
                    <AvatarFallback className="h-48 w-full rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Music className="h-12 w-12 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <Button
                      size="lg"
                      className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Play playlist logic
                      }}
                    >
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>

                  {/* Like badge */}
                  {playlist.isLiked && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 hover:bg-red-600">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Beğenilen
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <CardTitle className="text-lg truncate">{playlist.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {playlist.description}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Music className="h-3 w-3" />
                    <span>{playlist.songCount} şarkı</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{playlist.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={playlist.isPublic ? "default" : "secondary"}>
                      {playlist.isPublic ? "Herkese Açık" : "Özel"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Shuffle play logic
                      }}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // More options logic
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {playlist.createdBy} tarafından oluşturuldu
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}