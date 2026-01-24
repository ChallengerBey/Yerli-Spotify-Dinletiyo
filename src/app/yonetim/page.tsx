'use client';

import { useState, useEffect } from 'react';
import { Trash2, Shield, Mic2, AlertTriangle, Lock, Upload, Users, Music, BarChart3, Ban, Activity, Radio, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration_ms: number;
  uploaded_by: string;
  play_count: number;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  user_metadata: { full_name?: string };
  created_at: string;
}

interface Ban {
  id: string;
  user_id: string;
  ban_reason: string;
  ban_type: 'temporary' | 'permanent';
  expires_at?: string;
  is_active: boolean;
}

interface AdminStats {
  total_users: number;
  total_songs: number;
  total_plays: number;
  active_bans: number;
  recent_signups: number;
}

interface Podcast {
  id: string;
  title: string;
  creator_id: string;
  description?: string;
  cover_url?: string;
  created_at: string;
}

interface ListeningRoom {
  id: string;
  room_name: string;
  created_by: string;
  is_active: boolean;
  current_song?: string;
  participant_count: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [rooms, setRooms] = useState<ListeningRoom[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_songs: 0,
    total_plays: 0,
    active_bans: 0,
    recent_signups: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [banDays, setBanDays] = useState('30');

  const { toast } = useToast();

  const checkAuth = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin-auth', 'true');
      toast({
        title: 'Başarılı',
        description: 'Admin paneline giriş yaptınız.',
      });
    } else {
      toast({
        title: 'Hata',
        description: 'Yanlış şifre!',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin-auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [songsRes, usersRes, bansRes, statsRes, podcastsRes, roomsRes] = await Promise.all([
        fetch('/api/admin/songs'),
        fetch('/api/admin/users'),
        fetch('/api/admin/bans'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/podcasts'),
        fetch('/api/admin/rooms'),
      ]);

      if (songsRes.ok) setSongs(await songsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (bansRes.ok) setBans(await bansRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (podcastsRes.ok) setPodcasts(await podcastsRes.json());
      if (roomsRes.ok) setRooms(await roomsRes.json());
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Hata',
        description: 'Veriler yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSong = async () => {
    if (!selectedFile || !songTitle || !songArtist) {
      toast({
        title: 'Hata',
        description: 'Tüm alanları doldurunuz.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', songTitle);
    formData.append('artist', songArtist);

    try {
      const response = await fetch('/api/admin/songs/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Şarkı yüklenesi başarıyla tamamlandı.',
        });
        setSongTitle('');
        setSongArtist('');
        setSelectedFile(null);
        loadAdminData();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Şarkı yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const handleBanUser = async () => {
    if (!banUserId || !banReason) {
      toast({
        title: 'Hata',
        description: 'Tüm alanları doldurunuz.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const expiresAt = banType === 'temporary' 
        ? new Date(Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const response = await fetch('/api/admin/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: banUserId,
          ban_reason: banReason,
          ban_type: banType,
          expires_at: expiresAt,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Kullanıcı başarıyla banlandı.',
        });
        setBanUserId('');
        setBanReason('');
        setBanType('temporary');
        setBanDays('30');
        loadAdminData();
      } else {
        throw new Error('Ban failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Kullanıcı banlanırken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      const response = await fetch(`/api/admin/songs/${songId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Şarkı silindi.',
        });
        loadAdminData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Şarkı silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const handleUnbanUser = async (banId: string) => {
    try {
      const response = await fetch(`/api/admin/bans/${banId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Yasaklama kaldırıldı.',
        });
        loadAdminData();
      } else {
        throw new Error('Unban failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Yasaklama kaldırılırken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePodcast = async (podcastId: string) => {
    try {
      const response = await fetch(`/api/admin/podcasts/${podcastId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Podcast silindi.',
        });
        loadAdminData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Podcast silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Dinleme odası silindi.',
        });
        loadAdminData();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dinleme odası silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Admin Girişi</CardTitle>
            <CardDescription>Admin paneline erişmek için şifre girin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Şifresi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAuth()}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button 
              onClick={checkAuth} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Yönetim Paneli</h1>
          <p className="text-gray-400">Yerli Spotify - Sistem Yönetimi</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Toplam Kullanıcı</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total_users}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Toplam Şarkı</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total_songs}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Toplam Dinlenme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{(stats.total_plays / 1000).toFixed(1)}K</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Aktif Banlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">{stats.active_bans}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Yeni Kayıtlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{stats.recent_signups}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="songs" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="songs" className="text-white">
              <Music className="w-4 h-4 mr-2" />
              Şarkılar
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white">
              <Users className="w-4 h-4 mr-2" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="bans" className="text-white">
              <Ban className="w-4 h-4 mr-2" />
              Banlar
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="text-white">
              <Mic2 className="w-4 h-4 mr-2" />
              Podcastlar
            </TabsTrigger>
            <TabsTrigger value="rooms" className="text-white">
              <Headphones className="w-4 h-4 mr-2" />
              Odalar
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-white">
              <Activity className="w-4 h-4 mr-2" />
              Loglar
            </TabsTrigger>
          </TabsList>

          {/* Songs Tab */}
          <TabsContent value="songs" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Şarkı Yükle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="Şarkı Başlığı"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  type="text"
                  placeholder="Sanatçı Adı"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button 
                  onClick={handleUploadSong}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Şarkıyı Yükle
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Şarkı Listesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {songs.map((song) => (
                    <div key={song.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{song.title}</p>
                        <p className="text-gray-400 text-sm">{song.artist}</p>
                        <p className="text-gray-500 text-xs mt-1">Dinlenme: {song.play_count}</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Şarkıyı Sil?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">İptal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteSong(song.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Kullanıcı Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{user.user_metadata?.full_name || 'Adsız'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Aktif
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bans Tab */}
          <TabsContent value="bans" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ban className="w-5 h-5" />
                  Kullanıcı Banla
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="Kullanıcı ID"
                  value={banUserId}
                  onChange={(e) => setBanUserId(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  type="text"
                  placeholder="Ban Nedeni"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={banType}
                    onChange={(e) => setBanType(e.target.value as 'temporary' | 'permanent')}
                    className="flex-1 bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                  >
                    <option value="temporary">Geçici</option>
                    <option value="permanent">Kalıcı</option>
                  </select>
                  {banType === 'temporary' && (
                    <Input
                      type="number"
                      placeholder="Gün Sayısı"
                      value={banDays}
                      onChange={(e) => setBanDays(e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                    />
                  )}
                </div>
                <Button 
                  onClick={handleBanUser}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Kullanıcıyı Banla
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Aktif Banlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bans.filter(b => b.is_active).map((ban) => (
                    <div key={ban.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{ban.user_id}</p>
                        <p className="text-gray-400 text-sm">{ban.ban_reason}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={ban.ban_type === 'permanent' ? 'destructive' : 'secondary'}>
                            {ban.ban_type === 'permanent' ? 'Kalıcı' : 'Geçici'}
                          </Badge>
                          {ban.expires_at && (
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                              {new Date(ban.expires_at).toLocaleDateString('tr-TR')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleUnbanUser(ban.id)}
                        variant="outline"
                        size="sm"
                        className="text-green-400 border-green-400"
                      >
                        Kaldır
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Aktivite Logları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center py-8">
                  Henüz aktivite kaydı yok.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Podcasts Tab */}
          <TabsContent value="podcasts" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mic2 className="w-5 h-5" />
                  Podcast Yönetimi
                </CardTitle>
                <CardDescription>Tüm podcastları görüntüle ve yönet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {podcasts && podcasts.length > 0 ? (
                    podcasts.map((podcast) => (
                      <div key={podcast.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">{podcast.title}</p>
                          <p className="text-gray-400 text-sm">Oluşturan: {podcast.creator_id}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Oluşturuldu: {new Date(podcast.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Podcast Sil?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. Podcast ve tüm bölümleri silinecektir.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeletePodcast(podcast.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Henüz podcast yok.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  Dinleme Odaları Yönetimi
                </CardTitle>
                <CardDescription>Aktif dinleme odalarını görüntüle ve yönet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {rooms && rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">{room.room_name}</p>
                          <p className="text-gray-400 text-sm">Sahibi: {room.created_by}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={room.is_active ? 'default' : 'secondary'} className={room.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                              {room.is_active ? 'Aktif' : 'Pasif'}
                            </Badge>
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {room.participant_count} Katılımcı
                            </Badge>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            Oluşturuldu: {new Date(room.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Dinleme Odası Sil?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. Oda ve tüm katılımcılar çıkarılacaktır.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteRoom(room.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Henüz dinleme odası yok.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}