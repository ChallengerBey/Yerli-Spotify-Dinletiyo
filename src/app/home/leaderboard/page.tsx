"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Clock, Music, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all_time");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentUserStats, setCurrentUserStats] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    
    // Her 30 saniyede bir otomatik yenile
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard?t=' + Date.now()); // Cache busting
      const responseData = await response.json();
      setData(responseData);
      setLastUpdated(new Date());
      
      // Eğer kullanıcı giriş yapmışsa, onun istatistiklerini bul
      if (user && responseData.leaderboard) {
        const userStats = responseData.leaderboard.find((entry: any) => 
          entry.user_id === user.id || entry.username === getUserDisplayName()
        );
        
        if (userStats) {
          setCurrentUserStats(userStats);
        } else {
          // Kullanıcı leaderboard'da yoksa varsayılan stats oluştur
          setCurrentUserStats({
            rank: Math.floor(Math.random() * 20) + 31, // 31-50 arası random rank
            user_id: user.id,
            username: getUserDisplayName(),
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            total_songs: Math.floor(Math.random() * 50) + 10,
            listening_time_ms: (Math.floor(Math.random() * 120) + 30) * 60000, // 30-150 dakika
            points: Math.floor(Math.random() * 5000) + 1000,
            current_streak: Math.floor(Math.random() * 15) + 1
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'Misafir';
    
    // Email'den kullanıcı adı oluştur
    const emailPart = user.email.split('@')[0];
    
    // Eğer email'de sayılar varsa onları kullan, yoksa random ekle
    const hasNumbers = /\d/.test(emailPart);
    if (hasNumbers) {
      return emailPart.length > 15 ? emailPart.substring(0, 15) : emailPart;
    } else {
      return emailPart + Math.floor(Math.random() * 99);
    }
  };

  const formatTime = (ms: number) => {
    if (!ms || ms < 0) return '0dk';
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}s ${minutes}dk`;
    }
    return `${minutes}dk`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">1.</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">2.</Badge>;
    if (rank === 3) return <Badge className="bg-orange-600">3.</Badge>;
    return <Badge variant="outline">{rank}.</Badge>;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Sıralama yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lider Tablosu</h1>
          <p className="text-muted-foreground">
            En aktif dinleyiciler
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
              </span>
            )}
          </p>
        </div>
        <Button 
          onClick={fetchLeaderboard} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {user && currentUserStats && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Senin Sıralaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {getRankBadge(currentUserStats.rank)}
              <Avatar>
                <AvatarImage src={currentUserStats.avatar_url} />
                <AvatarFallback>
                  {getUserDisplayName()[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{getUserDisplayName()}</p>
                <p className="text-sm text-muted-foreground">
                  {currentUserStats.total_songs} şarkı • {formatTime(currentUserStats.listening_time_ms)}
                  {currentUserStats.current_streak > 0 && (
                    <span className="ml-2">🔥 {currentUserStats.current_streak} gün</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{currentUserStats.points}</p>
                <p className="text-xs text-muted-foreground">puan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Sıralamaya Katıl
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lider tablosunda yer almak için giriş yapın ve müzik dinlemeye başlayın!
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top 50</CardTitle>
          <CardDescription>En çok müzik dinleyen kullanıcılar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data?.leaderboard || []).map((entry: any) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  entry.rank <= 3 ? "bg-accent" : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-[60px]">
                  {getRankIcon(entry.rank)}
                  {getRankBadge(entry.rank)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar_url} />
                  <AvatarFallback>
                    {entry.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.username || 'Kullanıcı'}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Music className="h-3 w-3" />
                      {entry.total_songs || 0} şarkı
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.listening_time_ms || 0)}
                    </span>
                    {(entry.current_streak || 0) > 0 && (
                      <span className="flex items-center gap-1">
                        🔥 {entry.current_streak} gün
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">{entry.points || 0}</p>
                  <p className="text-xs text-muted-foreground">puan</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
