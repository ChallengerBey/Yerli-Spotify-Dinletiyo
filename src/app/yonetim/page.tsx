'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Trash2, Music, BarChart3, Ban, Activity, 
  Lock, Upload, Users, Mic2, Clock, Cpu, HardDrive, 
  Database, Eye, Terminal, TrendingUp, AlertCircle, CheckCircle,
  RefreshCw, Monitor, Network, Settings, Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  active_connections: number;
  response_time: number;
  uptime: number;
}

interface RequestLog {
  id: string;
  method: string;
  url: string;
  status: number;
  response_time: number;
  ip: string;
  user_agent: string;
  timestamp: string;
}

interface RealTimeStats {
  active_users: number;
  requests_per_minute: number;
  error_rate: number;
  avg_response_time: number;
  total_requests_today: number;
  unique_visitors_today: number;
}

interface FilterStats {
  total_searches: number;
  total_videos_found: number;
  advertisements_filtered: number;
  child_content_filtered: number;
  suspicious_channels_blocked: number;
  filter_success_rate: number;
  top_filtered_keywords: Array<{ keyword: string; count: number }>;
  daily_filter_activity: Array<{ date: string; filtered: number }>;
}

export default function DinletiyoAdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_songs: 0,
    total_plays: 0,
    active_bans: 0,
    recent_signups: 0,
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_in: 0,
    network_out: 0,
    active_connections: 0,
    response_time: 0,
    uptime: 0,
  });
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats>({
    active_users: 0,
    requests_per_minute: 0,
    error_rate: 0,
    avg_response_time: 0,
    total_requests_today: 0,
    unique_visitors_today: 0,
  });
  const [filterStats, setFilterStats] = useState<FilterStats>({
    total_searches: 0,
    total_videos_found: 0,
    advertisements_filtered: 0,
    child_content_filtered: 0,
    suspicious_channels_blocked: 0,
    filter_success_rate: 0,
    top_filtered_keywords: [],
    daily_filter_activity: []
  });
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin-auth', 'true');
        toast({
          title: 'Başarılı',
          description: 'Dinletiyo yönetim paneline giriş yaptınız.',
        });
      } else {
        toast({
          title: 'Hata',
          description: 'Yanlış şifre!',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Giriş yapılırken bir hata oluştu.',
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
      loadSystemMetrics();
      loadRequestLogs();
      loadRealTimeStats();
      loadFilterStats();
      
      if (autoRefresh) {
        intervalRef.current = setInterval(() => {
          loadSystemMetrics();
          loadRequestLogs();
          loadRealTimeStats();
          loadFilterStats();
        }, 5000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, autoRefresh]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [songsRes, usersRes, bansRes, statsRes, podcastsRes] = await Promise.all([
        fetch('/api/admin/songs'),
        fetch('/api/admin/users'),
        fetch('/api/admin/bans'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/podcasts'),
      ]);

      if (songsRes.ok) setSongs(await songsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (bansRes.ok) setBans(await bansRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (podcastsRes.ok) setPodcasts(await podcastsRes.json());
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const response = await fetch('/api/admin/system-metrics');
      if (response.ok) {
        const metrics = await response.json();
        setSystemMetrics(metrics);
      }
    } catch (error) {
      console.error('Error loading system metrics:', error);
    }
  };

  const loadRequestLogs = async () => {
    try {
      const response = await fetch('/api/admin/request-logs');
      if (response.ok) {
        const logs = await response.json();
        setRequestLogs(logs);
      }
    } catch (error) {
      console.error('Error loading request logs:', error);
    }
  };

  const loadRealTimeStats = async () => {
    try {
      const response = await fetch('/api/admin/realtime-stats');
      if (response.ok) {
        const stats = await response.json();
        setRealTimeStats(stats);
      }
    } catch (error) {
      console.error('Error loading real-time stats:', error);
    }
  };

  const loadFilterStats = async () => {
    try {
      const response = await fetch('/api/admin/filter-stats');
      if (response.ok) {
        const stats = await response.json();
        setFilterStats(stats);
      }
    } catch (error) {
      console.error('Error loading filter stats:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 300 && status < 400) return 'text-yellow-400';
    if (status >= 400 && status < 500) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Dinletiyo</CardTitle>
            <CardDescription className="text-gray-400">Yönetim paneline erişmek için şifre girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAuth()}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <Button 
              onClick={checkAuth} 
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold"
            >
              <Lock className="w-4 h-4 mr-2" />
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              Dinletiyo Yönetim
            </h1>
            <p className="text-gray-400">Sistem Yönetimi & Monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Activity className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Aktif Kullanıcı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">{realTimeStats.active_users}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                İstek/Dakika
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-400">{realTimeStats.requests_per_minute}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Hata Oranı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">{realTimeStats.error_rate.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Yanıt Süresi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-400">{realTimeStats.avg_response_time}ms</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Günlük İstek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-400">{(realTimeStats.total_requests_today / 1000).toFixed(1)}K</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Benzersiz Ziyaret
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cyan-400">{(realTimeStats.unique_visitors_today / 1000).toFixed(1)}K</p>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                CPU Kullanımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">{systemMetrics.cpu_usage.toFixed(1)}%</span>
                </div>
                <Progress value={systemMetrics.cpu_usage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Bellek Kullanımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">{systemMetrics.memory_usage.toFixed(1)}%</span>
                </div>
                <Progress value={systemMetrics.memory_usage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Disk Kullanımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">{systemMetrics.disk_usage.toFixed(1)}%</span>
                </div>
                <Progress value={systemMetrics.disk_usage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Network className="w-4 h-4" />
                Aktif Bağlantı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white text-2xl font-bold">{systemMetrics.active_connections}</span>
                </div>
                <div className="text-xs text-gray-400">
                  ↑ {formatBytes(systemMetrics.network_in)}/s ↓ {formatBytes(systemMetrics.network_out)}/s
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="monitoring" className="text-white">
              <Monitor className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-white">
              <Terminal className="w-4 h-4 mr-2" />
              Request Logs
            </TabsTrigger>
            <TabsTrigger value="management" className="text-white">
              <Settings className="w-4 h-4 mr-2" />
              Yönetim
            </TabsTrigger>
            <TabsTrigger value="system" className="text-white">
              <Server className="w-4 h-4 mr-2" />
              Sistem
            </TabsTrigger>
            <TabsTrigger value="filter" className="text-white">
              <Activity className="w-4 h-4 mr-2" />
              Reklam Filtresi
            </TabsTrigger>
          </TabsList>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Sistem Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-green-400 font-mono">{formatUptime(systemMetrics.uptime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Ortalama Yanıt Süresi</span>
                    <span className="text-blue-400 font-mono">{systemMetrics.response_time}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sistem Durumu</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Sağlıklı
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Genel İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Toplam Kullanıcı</span>
                    <span className="text-white font-bold">{stats.total_users}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Toplam Şarkı</span>
                    <span className="text-white font-bold">{stats.total_songs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Toplam Dinlenme</span>
                    <span className="text-white font-bold">{(stats.total_plays / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Aktif Banlar</span>
                    <span className="text-red-400 font-bold">{stats.active_bans}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Request Logs Tab */}
          <TabsContent value="logs">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Canlı Request Logları
                </CardTitle>
                <CardDescription>Son 100 HTTP isteği (5 saniyede bir güncellenir)</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-1 font-mono text-sm">
                    {requestLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-4 p-2 bg-gray-700 rounded text-xs">
                        <span className="text-gray-400 w-20">
                          {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`w-12 text-center ${
                            log.method === 'GET' ? 'text-blue-400 border-blue-400' :
                            log.method === 'POST' ? 'text-green-400 border-green-400' :
                            log.method === 'PUT' ? 'text-yellow-400 border-yellow-400' :
                            log.method === 'DELETE' ? 'text-red-400 border-red-400' :
                            'text-gray-400 border-gray-400'
                          }`}
                        >
                          {log.method}
                        </Badge>
                        <span className={`w-12 text-center font-bold ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                        <span className="text-white flex-1 truncate">{log.url}</span>
                        <span className="text-gray-400 w-16 text-right">{log.response_time}ms</span>
                        <span className="text-gray-500 w-32 truncate">{log.ip}</span>
                      </div>
                    ))}
                    {requestLogs.length === 0 && (
                      <p className="text-gray-400 text-center py-8">Henüz log kaydı yok.</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Şarkılar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white mb-2">{songs.length}</p>
                  <p className="text-gray-400 text-sm">Toplam şarkı sayısı</p>
                  <ScrollArea className="h-64 mt-4">
                    <div className="space-y-2">
                      {songs.map((song) => (
                        <div 
                          key={song.id} 
                          className="flex items-center justify-between p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                          onContextMenu={(e) => {
                            e.preventDefault();
                            // Trigger our custom context menu
                            const contextMenuEvent = new CustomEvent('songContextMenu', {
                              detail: {
                                song: {
                                  id: song.id,
                                  title: song.title,
                                  artist: song.artist,
                                  youtube_url: `https://youtube.com/watch?v=${song.id}` // Mock URL
                                },
                                x: e.clientX,
                                y: e.clientY
                              }
                            });
                            window.dispatchEvent(contextMenuEvent);
                          }}
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{song.title}</p>
                            <p className="text-gray-400 text-xs">{song.artist}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs">{song.play_count} dinlenme</p>
                          </div>
                        </div>
                      ))}
                      {songs.length === 0 && (
                        <p className="text-gray-400 text-center py-4 text-sm">Henüz şarkı yok.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Kullanıcılar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white mb-2">{users.length}</p>
                  <p className="text-gray-400 text-sm">Kayıtlı kullanıcı</p>
                  <ScrollArea className="h-64 mt-4">
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{user.user_metadata?.full_name || 'Adsız'}</p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                            Aktif
                          </Badge>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <p className="text-gray-400 text-center py-4 text-sm">Henüz kullanıcı yok.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Sistem Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Sunucu Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform:</span>
                        <span className="text-white">Vercel</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Node.js:</span>
                        <span className="text-white">v18.x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next.js:</span>
                        <span className="text-white">15.1.11</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deployment:</span>
                        <span className="text-green-400">Production</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Veritabanı</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Provider:</span>
                        <span className="text-white">Supabase</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">PostgreSQL:</span>
                        <span className="text-white">v15.x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bağlantı:</span>
                        <span className="text-green-400">Aktif</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pool Size:</span>
                        <span className="text-white">20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filter Tab */}
          <TabsContent value="filter">
            <div className="grid gap-6">
              {/* Filter Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Toplam Arama
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-400">{filterStats.total_searches.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">YouTube araması</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Ban className="w-4 h-4" />
                      Reklam Filtrelendi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-400">{filterStats.advertisements_filtered.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Reklam videosu</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Çocuk İçeriği
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-yellow-400">{filterStats.child_content_filtered.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Filtrelendi</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Başarı Oranı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-400">{filterStats.filter_success_rate}%</p>
                    <p className="text-xs text-gray-400">Filtreleme başarısı</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Filtered Keywords */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    En Çok Filtrelenen Kelimeler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filterStats.top_filtered_keywords.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{item.keyword}</span>
                        </div>
                        <Badge variant="destructive" className="bg-red-600">
                          {item.count} kez
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Filter Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Günlük Filtreleme Aktivitesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filterStats.daily_filter_activity.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span className="text-gray-300 text-sm">{day.date}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${(day.filtered / 300) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-medium">{day.filtered}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}