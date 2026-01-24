"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, LogIn, Music } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Room {
  id: string;
  room_name: string;
  room_code: string;
  host_id: string;
  is_public: boolean;
  max_participants: number;
  current_song_data?: any;
  room_participants: any[];
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(50);

  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const fetchRooms = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/rooms", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupEmptyRooms = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error("Giriş yapman gerekiyor");
        router.push("/unauthorized");
        return;
      }

      const response = await fetch('/api/rooms/cleanup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.error || 'Temizleme başarısız');
        return;
      }

      toast.success(`${data.deleted || 0} oda temizlendi`);
      fetchRooms();
    } catch {
      toast.error('Temizleme başarısız');
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Oda adı gerekli");
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error("Giriş yapman gerekiyor");
        router.push("/unauthorized");
        return;
      }

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_name: roomName,
          is_public: isPublic,
          password: password || null,
          max_participants: maxParticipants,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Oda oluşturuldu! Kod: ${data.room.room_code}`);
        setCreateDialogOpen(false);
        setRoomName("");
        setPassword("");
        fetchRooms();
        router.push(`/home/rooms/${data.room.id}`);
      } else {
        toast.error(data.error || "Oda oluşturulamadı");
      }
    } catch (error) {
      toast.error("Oda oluşturma başarısız");
    }
  };

  const joinRoom = async (roomCode?: string) => {
    const code = roomCode || joinCode;
    
    if (!code.trim()) {
      toast.error("Oda kodu gerekli");
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error("Giriş yapman gerekiyor");
        router.push("/unauthorized");
        return;
      }

      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_code: code,
          password: joinPassword || null,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Odaya katıldın!");
        setJoinDialogOpen(false);
        setJoinCode("");
        setJoinPassword("");
        router.push(`/home/rooms/${data.room_id}`);
      } else {
        toast.error(data.error || "Odaya katılma başarısız");
      }
    } catch (error) {
      toast.error("Odaya katılma başarısız");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Odalar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dinleme Odaları</h1>
          <p className="text-muted-foreground">Arkadaşlarınla birlikte müzik dinle</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={cleanupEmptyRooms}>
            Boş Odaları Temizle
          </Button>
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Odaya Katıl
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Odaya Katıl</DialogTitle>
                <DialogDescription>
                  Oda kodunu girerek mevcut bir odaya katıl
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="join-code">Oda Kodu</Label>
                  <Input
                    id="join-code"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="join-password">Şifre (opsiyonel)</Label>
                  <Input
                    id="join-password"
                    type="password"
                    placeholder="Oda şifresi"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                  />
                </div>
                <Button onClick={() => joinRoom()} className="w-full">
                  Katıl
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Oda Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Oda Oluştur</DialogTitle>
                <DialogDescription>
                  Arkadaşlarınla birlikte müzik dinlemek için bir oda oluştur
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-name">Oda Adı</Label>
                  <Input
                    id="room-name"
                    placeholder="Benim Odam"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="public">Herkese Açık</Label>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre (opsiyonel)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Oda şifresi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="max">Maksimum Katılımcı</Label>
                  <Input
                    id="max"
                    type="number"
                    min={2}
                    max={100}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  />
                </div>
                <Button onClick={createRoom} className="w-full">
                  Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {rooms.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Music className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Henüz aktif oda yok</h3>
              <p className="text-sm text-muted-foreground">
                İlk odayı sen oluştur veya bir odaya katıl
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {room.room_name}
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {room.room_code}
                  </span>
                </CardTitle>
                <CardDescription>
                  {room.current_song_data?.title || "Şu an bir şarkı çalmıyor"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {room.room_participants?.length || 0} / {room.max_participants}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    room.is_public ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"
                  }`}>
                    {room.is_public ? "Herkese Açık" : "Özel"}
                  </span>
                </div>
                <Button 
                  onClick={() => joinRoom(room.room_code)} 
                  className="w-full"
                  variant="outline"
                >
                  Odaya Katıl
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
