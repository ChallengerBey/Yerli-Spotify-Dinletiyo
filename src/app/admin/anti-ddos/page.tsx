"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, Trash2, Plus, RefreshCw, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface SuspiciousActivity {
  ip: string;
  count: number;
  lastSeen: string;
  reasons: string[];
}

export default function AntiDDoSPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity[]>([]);
  const [newIP, setNewIP] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin şifresi - production'da environment variable kullan
  const ADMIN_PASSWORD = 'bozkurt2024';

  useEffect(() => {
    // Oturum kontrolü
    const savedAuth = localStorage.getItem('anti-ddos-auth');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('anti-ddos-auth', 'authenticated');
      toast.success('Giriş başarılı!');
      loadData();
    } else {
      toast.error('Yanlış şifre!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('anti-ddos-auth');
    setPassword('');
    toast.success('Çıkış yapıldı');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch blocked IPs
      const blockedResponse = await fetch('/api/admin/blocked-ips');
      if (blockedResponse.ok) {
        const blocked = await blockedResponse.json();
        setBlockedIPs(blocked);
      }
      
      // Fetch suspicious activity
      const suspiciousResponse = await fetch('/api/admin/suspicious-activity');
      if (suspiciousResponse.ok) {
        const suspicious = await suspiciousResponse.json();
        setSuspiciousActivity(suspicious);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const blockIP = async (ip: string, reason: string = 'Manual') => {
    try {
      const response = await fetch('/api/admin/blocked-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason })
      });
      
      if (response.ok) {
        toast.success(`IP ${ip} engellendi`);
        loadData();
      } else {
        toast.error('IP engellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast.error('IP engellenirken hata oluştu');
    }
  };

  const unblockIP = async (ip: string) => {
    try {
      const response = await fetch('/api/admin/blocked-ips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      
      if (response.ok) {
        toast.success(`IP ${ip} engeli kaldırıldı`);
        loadData();
      } else {
        toast.error('IP engeli kaldırılırken hata oluştu');
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast.error('IP engeli kaldırılırken hata oluştu');
    }
  };

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      toast.error('IP adresi gerekli');
      return;
    }
    
    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIP.trim())) {
      toast.error('Geçersiz IP adresi formatı');
      return;
    }
    
    await blockIP(newIP.trim(), 'Manual Admin Block');
    setNewIP('');
  };

  // Login ekranı
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="bg-white/5 border-red-500/20 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                🛡️ Bozkurt Anti-DDoS
              </CardTitle>
              <p className="text-gray-400">Admin Paneli Girişi</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Admin şifresi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-zinc-900 border-zinc-800 focus:border-red-500/50 text-white"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-red-500 hover:bg-red-600"
                disabled={!password.trim()}
              >
                <Lock className="h-4 w-4 mr-2" />
                Giriş Yap
              </Button>
              <div className="text-center text-xs text-gray-500 mt-4">
                Yetkisiz erişim yasaktır. Tüm girişimler loglanır.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-red-500" />
          <p className="text-gray-400 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/5">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-black text-white tracking-tight">🛡️ Bozkurt Anti-DDoS</h1>
              </div>
              <p className="text-lg text-gray-400 font-medium">Gelişmiş DDoS koruma ve IP yönetimi</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-red-400 border-red-500/20 hover:bg-red-500/10"
          >
            <Lock className="h-4 w-4 mr-2" />
            Çıkış
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-500/5 border-red-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Engellenen IP'ler</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{blockedIPs.length}</div>
            <p className="text-xs text-red-400">Aktif engelleme</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Şüpheli Aktivite</CardTitle>
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{suspiciousActivity.length}</div>
            <p className="text-xs text-yellow-400">İzlenen IP'ler</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Sistem Durumu</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Aktif</div>
            <p className="text-xs text-green-400">Koruma çalışıyor</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual IP Block */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-red-500" />
            Manuel IP Engelleme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="IP adresi (örn: 192.168.1.1)"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus:border-red-500/50"
            />
            <Button onClick={handleAddIP} className="bg-red-500 hover:bg-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Engelle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocked IPs */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Engellenen IP'ler ({blockedIPs.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </CardHeader>
        <CardContent>
          {blockedIPs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz engellenmiş IP yok
            </div>
          ) : (
            <div className="space-y-2">
              {blockedIPs.map((ip) => (
                <div key={ip} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="font-mono">
                      {ip}
                    </Badge>
                    <span className="text-sm text-gray-400">Engellenmiş</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unblockIP(ip)}
                    className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Engeli Kaldır
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspicious Activity */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-yellow-500" />
            Şüpheli Aktiviteler ({suspiciousActivity.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suspiciousActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Şüpheli aktivite tespit edilmedi
            </div>
          ) : (
            <div className="space-y-3">
              {suspiciousActivity.map((activity) => (
                <div key={activity.ip} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-yellow-400 border-yellow-500/20">
                        {activity.ip}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {activity.count} şüpheli aktivite
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => blockIP(activity.ip, 'Suspicious Activity')}
                        className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                      >
                        Engelle
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {activity.reasons.map((reason, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Son görülme: {new Date(activity.lastSeen).toLocaleString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-500/5 border-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Shield className="h-5 w-5" />
            Sistem Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p>• Rate limiting: API route'ları için 10 req/10sn, diğer sayfalar için 20 req/10sn</p>
          <p>• Otomatik engelleme: 5 şüpheli aktivite sonrası otomatik IP engelleme</p>
          <p>• Veritabanı: Supabase ile güvenli depolama</p>
          <p>• Middleware koruması: Tüm istekler kontrol edilir</p>
        </CardContent>
      </Card>
    </div>
  );
}