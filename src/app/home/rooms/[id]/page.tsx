"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, Crown, UserMinus, Settings, Music, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface RoomParticipant {
  user_id: string;
  joined_at?: string;
  profiles?: {
    username?: string;
    avatar_url?: string | null;
  };
}

interface Room {
  id: string;
  room_name: string;
  room_code: string;
  host_id: string;
  is_public: boolean;
  max_participants: number;
  current_song_data?: any;
  is_playing?: boolean;
  room_participants?: RoomParticipant[];
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = params?.id;

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const fetchRoom = async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/rooms?id=${encodeURIComponent(roomId)}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Oda yüklenemedi");
        setRoom(null);
        return;
      }

      const nextRoom = data.room || null;
      setRoom(nextRoom);
      setNewRoomName(nextRoom?.room_name || "");

      if (nextRoom && currentUser) {
        const isRoomHost = nextRoom.host_id === currentUser.id;
        setIsHost(isRoomHost);

        localStorage.setItem('active-room-id', nextRoom.id);
        localStorage.setItem('active-room-host-id', nextRoom.host_id);
        localStorage.setItem('active-room-is-host', isRoomHost ? 'true' : 'false');
        window.dispatchEvent(new Event('activeRoomChanged'));
        
        if (nextRoom.current_song_data) {
          window.dispatchEvent(new CustomEvent('playSong', { detail: nextRoom.current_song_data }));
        }
      }
    } catch (e) {
      setError("Oda yüklenemedi");
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRoom();
    }

    return () => {
      localStorage.removeItem('active-room-id');
      localStorage.removeItem('active-room-host-id');
      localStorage.removeItem('active-room-is-host');
      window.dispatchEvent(new Event('activeRoomChanged'));
    };
  }, [roomId, currentUser]);

  const kickUser = async (userId: string) => {
    if (!isHost) return;
    
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/rooms/kick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_id: roomId, user_id: userId }),
      });

      if (res.ok) {
        toast.success('Kullanıcı atıldı');
        fetchRoom();
      } else {
        toast.error('Kullanıcı atılamadı');
      }
    } catch {
      toast.error('Kullanıcı atılamadı');
    }
  };

  const updateRoomName = async () => {
    if (!isHost || !newRoomName.trim()) return;
    
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/rooms/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_id: roomId, room_name: newRoomName }),
      });

      if (res.ok) {
        toast.success('Oda adı güncellendi');
        setSettingsOpen(false);
        fetchRoom();
      } else {
        toast.error('Oda adı güncellenemedi');
      }
    } catch {
      toast.error('Oda adı güncellenemedi');
    }
  };

  const leaveRoom = async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/rooms/join?room_id=${encodeURIComponent(roomId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Odadan çıkıldı");
        localStorage.removeItem('active-room-id');
        localStorage.removeItem('active-room-host-id');
        localStorage.removeItem('active-room-is-host');
        window.dispatchEvent(new Event('activeRoomChanged'));
        router.push("/home/rooms");
      } else {
        toast.error("Odadan çıkılamadı");
      }
    } catch {
      toast.error("Odadan çıkılamadı");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Oda yükleniyor...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button variant="outline" onClick={() => router.push("/home/rooms")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Odalara Dön
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Oda bulunamadı</CardTitle>
            <CardDescription>{error || "Oda yüklenemedi"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const participants = room.room_participants || [];

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6 pb-32 lg:pb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Button variant="outline" onClick={() => router.push("/home/rooms")} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Odalara Dön
        </Button>
        <div className="flex flex-wrap gap-2">
          {isHost && (
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Oda Ayarları</DialogTitle>
                  <DialogDescription>Oda ayarlarını düzenle</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Oda Adı</Label>
                    <Input
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Oda adı"
                    />
                  </div>
                  <Button onClick={updateRoomName} className="w-full">
                    Güncelle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" onClick={fetchRoom} size="sm">Yenile</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg lg:text-xl">{room.room_name}</span>
              {isHost && <Crown className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-500" />}
            </div>
            <span className="text-xs font-mono bg-muted px-2 py-1 rounded w-fit">{room.room_code}</span>
          </CardTitle>
          <CardDescription className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <span>{room.is_public ? "Herkese Açık" : "Özel"}</span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {participants.length} / {room.max_participants}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          {room.current_song_data && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Music className="h-4 w-4 lg:h-5 lg:w-5" />
                  Şu an çalıyor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 lg:gap-4">
                  <img
                    src={room.current_song_data.imageUrl}
                    alt={room.current_song_data.title}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm lg:text-base truncate">{room.current_song_data.title}</p>
                    <p className="text-xs lg:text-sm text-muted-foreground truncate">{room.current_song_data.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {room.is_playing ? (
                      <Play className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                    ) : (
                      <Pause className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base lg:text-lg font-semibold">Katılımcılar</h3>
              <Badge variant="secondary" className="text-xs">{participants.length} kişi</Badge>
            </div>
            
            {participants.length === 0 ? (
              <div className="text-center py-6 lg:py-8 text-muted-foreground text-sm">
                Henüz katılımcı yok
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {participants.map((participant) => (
                  <div key={participant.user_id} className="flex items-center justify-between p-2 lg:p-3 rounded-lg border">
                    <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                        <AvatarImage src={participant.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {(participant.profiles?.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium flex items-center gap-2 text-sm lg:text-base truncate">
                          <span className="truncate">{participant.profiles?.username || 'Kullanıcı'}</span>
                          {participant.user_id === room.host_id && (
                            <Crown className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {participant.user_id === room.host_id ? 'Oda Sahibi' : 'Katılımcı'}
                        </p>
                      </div>
                    </div>
                    {isHost && participant.user_id !== room.host_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => kickUser(participant.user_id)}
                        className="text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <UserMinus className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button variant="destructive" onClick={leaveRoom} className="w-full">
            Odadan Çık
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
