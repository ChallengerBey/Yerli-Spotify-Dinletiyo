'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Heart, Clock, Music } from 'lucide-react';

interface LoggedInUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser({
        id: userData.id,
        username: userData.username || (userData.email ? userData.email.split('@')[0] : 'Kullanıcı'),
        email: userData.email || '',
        avatar: userData.avatar
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (!user) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 max-w-md mx-auto">
      {/* Profil Bilgileri */}
      <div className="text-center space-y-4">
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback className="text-2xl">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-red-400 font-medium">Premium Üye</p>
        </div>
      </div>

      {/* Menü Seçenekleri */}
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-14 text-left"
          onClick={() => router.push('/home/library')}
        >
          <Heart className="mr-3 h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium">Beğendiklerim</p>
            <p className="text-sm text-muted-foreground">Favori şarkıların</p>
          </div>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-14 text-left"
          onClick={() => router.push('/home/playlists')}
        >
          <Music className="mr-3 h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium">Playlistlerim</p>
            <p className="text-sm text-muted-foreground">Oluşturduğun listeler</p>
          </div>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-14 text-left"
        >
          <Clock className="mr-3 h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium">Son Dinlenenler</p>
            <p className="text-sm text-muted-foreground">Geçmiş dinleme kayıtların</p>
          </div>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-14 text-left"
          onClick={() => alert('Ayarlar sayfası yakında eklenecek!')}
        >
          <Settings className="mr-3 h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium">Ayarlar</p>
            <p className="text-sm text-muted-foreground">Hesap ve uygulama ayarları</p>
          </div>
        </Button>
      </div>

      {/* Çıkış Yap */}
      <div className="pt-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-14 text-left text-red-500 hover:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <div>
            <p className="font-medium">Çıkış Yap</p>
            <p className="text-sm text-muted-foreground">Hesabından çık</p>
          </div>
        </Button>
      </div>
    </div>
  );
}