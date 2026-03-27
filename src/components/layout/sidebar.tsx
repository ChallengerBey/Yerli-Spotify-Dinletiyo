
"use client";

import Link from "next/link";
import { Home, Search, Library, Plus, User, LogOut, Settings, Users, ListMusic, Sparkles, BarChart3, Trophy, Crown, Mic2, Activity, Radio, Tv, Monitor, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimpleYoutubeSearch } from "@/components/simple-youtube-search";
import { getPlaylists, Playlist } from "@/lib/data";
import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";

const desktopNavLinks = [
  { href: "/home", label: "Ana Sayfa", icon: Home },
  { href: "/home/search", label: "Ara", icon: Search },
  { href: "/home/library", label: "Kütüphane", icon: Library },
  { href: "/home/playlists", label: "Playlistler", icon: ListMusic },
  { href: "/home/yayinci", label: "Yayıncı", icon: Tv },
  { href: "/home/overlay", label: "Yayın Overlay'i", icon: Monitor },
  { href: "/home/feed", label: "Aktivite", icon: Activity },
  { href: "/home/leaderboard", label: "Liderler", icon: Trophy },
  { href: "/home/premium", label: "Premium", icon: Crown },
];

const mobileFeatures = [
  { href: "/home/playlists", label: "Playlistler", icon: ListMusic },
  { href: "/home/yayinci", label: "Yayıncı", icon: Tv },
  { href: "/home/feed", label: "Aktivite", icon: Activity },
  { href: "/home/leaderboard", label: "Liderler", icon: Trophy },
  { href: "/home/premium", label: "Premium", icon: Crown },
];

interface LoggedInUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const u = result.user;
      const userData = {
        id: u.uid,
        email: u.email || '',
        username: u.displayName || (u.email ? u.email.split('@')[0] : 'Kullanıcı'),
        avatar: u.photoURL || undefined,
        provider: 'google',
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('rememberMe', 'true');
      // storage event bazı browserlarda aynı sekmede tetiklenmez; kendimiz de yenileyelim
      setUser({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
      });
      router.push('/home');
    } catch {
      router.push('/login');
    }
  };

  useEffect(() => {
    const updateUser = async () => {
      let currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      let userData = currentUser ? JSON.parse(currentUser) : null;

      // Fallback: Eğer local'de yoksa veya id yoksa Supabase auth'tan çekmeyi dene
      if (!userData || !userData.id) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          userData = {
            id: authUser.id,
            email: authUser.email,
            username: authUser.user_metadata?.username || 'Kullanıcı',
            avatar: authUser.user_metadata?.avatar_url
          };
          // Local'i tamir et
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      }

      if (userData && userData.id) {
        // Önce eldeki veriyi set et
        setUser({
          id: userData.id,
          username: userData.username || 'Kullanıcı',
          email: userData.email || '',
          avatar: userData.avatar
        });

        // Veritabanından en güncelini çek
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', userData.id)
            .single();

          if (data && !error) {
            setUser({
              id: userData.id,
              username: data.username,
              email: userData.email || '',
              avatar: data.avatar_url || userData.avatar
            });

            // Local storage'ı da fitleyelim
            userData.username = data.username;
            if (data.avatar_url) userData.avatar = data.avatar_url;
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        } catch (e) {
          console.error('User data sync error:', e);
        }
      } else {
        setUser(null);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);

    return () => {
      window.removeEventListener('storage', updateUser);
    };
  }, []);

  // Isim düzeltme: Eğer kullanıcı adı "Kullanıcı" veya "Giriş Yap" ise veritabanından doğrusunu çek
  // FixUsername artik updateUser'in icinde yapiliyor, bu effecti temizleyebiliriz

  interface LibraryItem {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    type: 'playlist' | 'artist';
  }

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([
    { id: '1', title: 'Beğenilen Şarkılar', subtitle: 'Playlist • 12 şarkı', imageUrl: 'https://misc.scdn.co/liked-songs/liked-songs-640.png', type: 'playlist' },
  ]);

  const handleAddRandomArtist = () => {
    const newArtists: LibraryItem[] = [
      { id: 'new1', title: 'Ceza', subtitle: 'Sanatçı', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5d644d56778f309a63dc1b21', type: 'artist' },
      { id: 'new2', title: 'Sagopa Kajmer', subtitle: 'Sanatçı', imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebb5d644d56778f309a63dc1b21', type: 'artist' },
      { id: 'new3', title: 'Ezhel', subtitle: 'Sanatçı', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb19c2794025b5c9281e64627d', type: 'artist' },
      { id: 'new4', title: 'Şebnem Ferah', subtitle: 'Sanatçı', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4122d256860361026f43e32e', type: 'artist' },
      { id: 'new5', title: 'Duman', subtitle: 'Sanatçı', imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebc56cc7c07b49463283257523', type: 'artist' },
    ];

    // Rastgele birini seçip ekle (listede yoksa)
    const randomArtist = newArtists[Math.floor(Math.random() * newArtists.length)];
    setLibraryItems(prev => {
      if (prev.find(item => item.title === randomArtist.title)) return prev;
      return [...prev, randomArtist];
    });
  };
  /*
    useEffect(() => {
      const loadPlaylists = async () => {
        try {
          const data = await getPlaylists();
          setPlaylists(data);
        } catch (error) {
          console.error('Playlist yüklenirken hata:', error);
        }
      };
      loadPlaylists();
    }, []);
  */

  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-background/50 backdrop-blur-xl border-r border-white/5 p-4 space-y-6">
        <div className="px-2">
          <Link href="/home" aria-label="Ana Sayfa" className="block transition-transform hover:scale-105 active:scale-95 duration-200">
            <Logo />
          </Link>
        </div>

        <nav>
          <ul className="space-y-2">
            {desktopNavLinks.map((link) => (
              <li key={link.href}>
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  asChild
                  className={cn(
                    "w-full justify-start text-base font-semibold transition-all duration-200",
                    pathname === link.href ? "bg-primary/20 text-primary hover:bg-primary/30" : "hover:bg-white/10"
                  )}
                >
                  <Link href={link.href}>
                    <link.icon className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      pathname === link.href ? (
                        link.label === "Arkadaşlar" || link.label === "Yeni Biriyle Tanış" ? "text-red-500" : "text-primary"
                      ) : "group-hover:text-white"
                    )} />
                    {link.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

      <div className="flex-1 flex flex-col min-h-0 bg-white/5 rounded-xl border border-white/5 p-3 hover:bg-white/10 transition-colors duration-300">
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Kitaplığın</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-14 p-2 mb-1 hover:bg-white/10 group"
              asChild
            >
              <Link href="/home/library">
                <img
                  src="https://misc.scdn.co/liked-songs/liked-songs-640.png"
                  alt="Beğenilen Şarkılar"
                  className="h-10 w-10 rounded-md object-cover shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="ml-3 text-left overflow-hidden">
                  <p className="font-semibold text-sm truncate">Beğenilen Şarkılar</p>
                </div>
              </Link>
            </Button>
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-16 p-2 hover:bg-white/10 rounded-xl"
              onClick={() => { if (!user) router.push('/login'); }}
            >
              <Avatar className="mr-3 h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.username} data-ai-hint="user avatar" />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">{user ? user.username.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-sm truncate">{user ? user.username : 'Giriş Yap'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <p className="text-xs text-muted-foreground font-medium">{user ? 'Normal Üye' : 'Hesabına giriş yap'}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 bg-card/95 backdrop-blur-xl border-white/10" align="start" side="top">
            <DropdownMenuLabel className="font-semibold text-base py-3 px-4">{user ? 'Hesabım' : 'Giriş Yap'}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {!user ? (
              <>
                <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-primary/20 focus:text-primary">
                  <Link href="/login">
                    <User className="mr-3 h-4 w-4" />
                    <span>E-posta ile giriş</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGoogleLogin} className="p-3 cursor-pointer focus:bg-primary/20 focus:text-primary">
                  <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google ile giriş</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-primary/20 focus:text-primary">
                  <Link href="/signup">
                    <Plus className="mr-3 h-4 w-4" />
                    <span>Hesap oluştur</span>
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-primary/20 focus:text-primary">
                  <Link href="/home/profile">
                    <User className="mr-3 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-primary/20 focus:text-primary">
                  <Link href="/home/settings">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Ayarlar</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="p-3 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-500">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </aside>

      {/* Mobile Features Dropdown */}
      <div className="lg:hidden flex items-center px-4 py-2">
        <DropdownMenu open={isFeaturesOpen} onOpenChange={setIsFeaturesOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between h-12 text-base font-semibold transition-all duration-200 hover:bg-white/10"
            >
              <div className="flex items-center">
                <Sparkles className="mr-3 h-5 w-5" />
                Özellikler
              </div>
              <svg
                className={cn(
                  "h-4 w-4 transition-transform",
                  isFeaturesOpen && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-white/10" align="start">
            {mobileFeatures.map((link) => (
              <DropdownMenuItem 
                key={link.href}
                asChild 
                className={cn(
                  "p-3 cursor-pointer focus:bg-primary/20 focus:text-primary",
                  pathname === link.href && "bg-primary/10 text-primary"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="mr-3 h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
