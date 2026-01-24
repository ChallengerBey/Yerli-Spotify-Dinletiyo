"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Clock, Music } from "lucide-react";

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all_time");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leaderboard');
      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Sıralama yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lider Tablosu</h1>
        <p className="text-muted-foreground">En aktif dinleyiciler</p>
      </div>

      {data?.current_user && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Senin Sıralaman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {getRankBadge(data.current_user?.rank || 0)}
              <Avatar>
                <AvatarImage src={data.current_user?.avatar_url} />
                <AvatarFallback>
                  {data.current_user?.username?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{data.current_user?.username || 'Kullanıcı'}</p>
                <p className="text-sm text-muted-foreground">
                  {data.current_user?.total_songs || 0} şarkı • {formatTime(data.current_user?.listening_time_ms || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{data.current_user?.points || 0}</p>
                <p className="text-xs text-muted-foreground">puan</p>
              </div>
            </div>
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
