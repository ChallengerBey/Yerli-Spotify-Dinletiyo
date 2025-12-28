'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { SongCard } from '@/components/song-card';
import { Song, Playlist } from '@/lib/data';
import { Search, Play } from 'lucide-react';
import { AdCarousel } from '@/components/ad-carousel';
import { useRouter } from 'next/navigation';

const sections = [
  { title: "Popüler Listeler", items: 6 },
  { title: "Yeni Çıkanlar", items: 6 },
];

const cardData: Playlist[] = [
  { id: "1", title: "Türkce Pop Hits", description: "En popüler parçalar", imageUrl: "/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png", aiHint: "pop music", songs: [] },
  { id: "2", title: "Haftanın Keşifleri", description: "Yeni müzikler keşfet", imageUrl: "/Fotoğraflar/haftanın keşifleri.341Z.png", aiHint: "discovery playlist", songs: [] },
  { id: "3", title: "Akustik Akşamlar", description: "Sakin ve huzurlu", imageUrl: "/Fotoğraflar/akustik akşamlar.911Z.png", aiHint: "acoustic guitar", songs: [] },
  { id: "4", title: "Türkce Rock", description: "Efsanevi riffler", imageUrl: "/Fotoğraflar/TÜKRÇE ROCK.037Z.png", aiHint: "rock concert", songs: [] },
  { id: "5", title: "Yolculuk Şarkıları", description: "Yol arkadaşların", imageUrl: "/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png", aiHint: "road trip", songs: [] },
  { id: "6", title: "90'lar Pop", description: "Geçmişe yolculuk", imageUrl: "/Fotoğraflar/90lar.973Z.png", aiHint: "retro cassette", songs: [] },
  { id: "7", title: "Yeni Nesil Rap", description: "Sokakların sesi", imageUrl: "/Fotoğraflar/YENİNESİLRAP.797Z.png", aiHint: "urban graffiti", songs: [] },
  { id: "8", title: "Elektronik Dans", description: "Enerjini yükselt", imageUrl: "/Fotoğraflar/elektronik dans.885Z.png", aiHint: "dj turntable", songs: [] },
  { id: "9", title: "Damar Şarkılar", description: "Duygusal anlar", imageUrl: "/Fotoğraflar/damarşarkılar.917Z.png", aiHint: "rainy window", songs: [] },
  { id: "10", title: "Antrenman Modu", description: "Limitleri zorla", imageUrl: "/Fotoğraflar/ANTREMANMODU.333Z.png", aiHint: "gym workout", songs: [] },
  { id: "11", title: "Odaklanma Zamanı", description: "Derin konsantrasyon", imageUrl: "/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png", aiHint: "zen stones", songs: [] },
  { id: "12", title: "Efsane Şarkılar", description: "Unutulmaz klasikler", imageUrl: "/Fotoğraflar/Efsaneşarkılar.885Z.png", aiHint: "vinyl record", songs: [] },
];

export default function LandingPage() {
  const [isBanned, setIsBanned] = useState(false);
  const [userIP, setUserIP] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Song | Playlist)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Beni hatırla kontrolü
    const checkSession = () => {
      const rememberMe = localStorage.getItem('rememberMe');
      const currentUser = localStorage.getItem('currentUser');

      if (rememberMe === 'true' && currentUser) {
        router.push('/home');
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    // IP'yi al ve ban kontrolü yap
    const checkBan = async () => {
      try {
        // IP'yi al
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        setUserIP(ip);

        // Ban kontrolü
        const banResponse = await fetch('/api/ip-ban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check', ip })
        });
        const banData = await banResponse.json();

        if (banData.banned) {
          setIsBanned(true);
        }
      } catch (error) {
        console.error('Ban kontrolü hatası:', error);
      }
    };

    checkBan();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Dinletiyo içi arama - playlist'lerde ara
      const filteredResults = cardData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Mock şarkı sonuçları ekle
      const mockSongs: Song[] = [
        {
          id: 'search-1',
          title: `${searchQuery} - Pop Remix`,
          artist: 'Dinletiyo Music',
          album: 'Search Results',
          duration: '3:45',
          imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
          audioUrl: 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3',
          aiHint: 'pop music'
        },
        {
          id: 'search-2',
          title: `${searchQuery} - Akustik Versiyon`,
          artist: 'Dinletiyo Acoustic',
          album: 'Search Results',
          duration: '4:12',
          imageUrl: '/Fotoğraflar/akustik akşamlar.911Z.png',
          audioUrl: 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3',
          aiHint: 'acoustic guitar'
        },
        {
          id: 'search-3',
          title: `${searchQuery} - Live Performance`,
          artist: 'Dinletiyo Live',
          album: 'Search Results',
          duration: '5:23',
          imageUrl: '/Fotoğraflar/Efsaneşarkılar.885Z.png',
          audioUrl: 'https://storage.googleapis.com/stolo-public-assets/gemini-studio/royalty-free-music/scott-buckley-jul.mp3',
          aiHint: 'live performance'
        }
      ];

      // Convert filteredResults to proper Playlist objects if needed
      const properPlaylists: Playlist[] = filteredResults.map((item, index) => ({
        ...item,
        id: `search-playlist-${index}`,
        songs: item.songs || []
      }));

      setSearchResults([...mockSongs, ...properPlaylists]);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isBanned) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Dinletiyo</h1>
          </div>

          <div className="bg-black border-2 border-red-500 rounded-2xl p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🚫</div>

              <h1 className="text-5xl font-bold text-red-500 mb-4">
                ERİŞİM ENGELLENDİ
              </h1>

              <div className="bg-black border border-red-500 rounded-lg p-6 space-y-4">
                <p className="text-xl text-red-400">
                  IP adresiniz site yönetim kurallarına göre <strong className="text-red-500">kalıcı olarak engellenmiştir.</strong>
                </p>

                <div className="bg-black border border-red-600 rounded p-3">
                  <p className="font-mono text-red-400 text-lg">
                    IP: <span className="text-red-500 font-bold">{userIP}</span>
                  </p>
                  <p className="font-mono text-red-400 text-lg">
                    Tarih: <span className="text-red-500">{new Date().toLocaleString('tr-TR')}</span>
                  </p>
                </div>

                <div className="border-t border-red-500 pt-4">
                  <p className="text-red-400 font-semibold text-lg">
                    ⚠️ Bu ağdan hiçbir cihaz siteye erişemez.
                  </p>
                  <p className="text-red-500 text-lg mt-2 font-bold">
                    Giriş denemesi tespit edilirse IP adresi <strong>Jandarma Siber</strong> ile paylaşılacaktır.
                  </p>
                </div>
              </div>

              <div className="bg-black border border-red-600 rounded-lg p-4">
                <p className="text-red-400 text-lg">
                  📞 <strong>Destek:</strong> Bu kararın yanlış olduğunu düşünüyorsanız sistem yöneticisi ile iletişime geçin.
                </p>
              </div>

              <div className="pt-6 border-t border-red-500">
                <p className="text-red-500 text-sm">
                  Dinletiyo Güvenlik Sistemi © 2025 | Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-auto">
            <Logo />
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Giriş Yap</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Üye Ol</Link>
            </Button>
          </nav>
        </div>
      </header>



      <main className="container py-12">
        {/* Üst Reklam Carousel */}
        <section className="mb-12">
          <AdCarousel
            variant="horizontal"
            autoPlay={true}
            showControls={true}
            showDots={true}
            className="max-w-4xl mx-auto"
          />
        </section>

        <section className="text-center py-20">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter">
            Müziğin Ritmini Yakala
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Milyonlarca Türkçe ve yabancı şarkı, podcast ve sana özel çalma listeleri. Dinletiyo ile müziğin keyfini ücretsiz çıkar.
          </p>

          {/* Arama Kısmı */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Dinletiyo'da şarkı, sanatçı veya playlist ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button
                size="lg"
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 px-8"
              >
                {isSearching ? 'Araniyor...' : 'Ara'}
              </Button>
            </div>
          </div>

          <Button size="lg" className="mt-6" asChild>
            <Link href="/signup">Hemen Başla</Link>
          </Button>
        </section>



        {/* Arama Sonuçları */}
        {searchResults.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-6">
              "{searchQuery}" için Dinletiyo'da bulunanlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.slice(0, 8).map((result, index) => (
                <SongCard
                  key={`search-${index}`}
                  item={result}
                  className="w-full"
                />
              ))}
            </div>

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  "{searchQuery}" için sonuç bulunamadı
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Farklı anahtar kelimeler deneyebilirsiniz
                </p>
              </div>
            )}
          </section>
        )}

        {/* Sadece arama yapılmamışsa playlist'leri göster */}
        {searchResults.length === 0 && sections.map((section, sectionIndex) => (
          <section key={section.title} className="mt-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-6">{section.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {cardData.slice(sectionIndex * section.items, (sectionIndex + 1) * section.items).map((item, index) => (
                <SongCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </section>
        ))}


      </main>

      {/* Alt Reklam Carousel */}
      <section className="container py-8">
        <AdCarousel
          variant="horizontal"
          autoPlay={true}
          showControls={true}
          showDots={true}
          className="max-w-6xl mx-auto"
        />
      </section>

      <footer className="container py-8 mt-16 border-t border-border/40">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Dinletiyo. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="/gizlilik" className="text-sm hover:underline">Gizlilik</Link>
            <Link href="/kosullar" className="text-sm hover:underline">Koşullar</Link>
          </div>
        </div>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MusicGroup',
              name: 'Dinletiyo',
              description: 'Türkiye\'nin en büyük ücretsiz müzik platformu',
              url: 'https://dinletiyo.com',
              sameAs: [
                'https://twitter.com/dinletiyo',
                'https://instagram.com/dinletiyo',
                'https://facebook.com/dinletiyo'
              ],
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://dinletiyo.com/?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </footer>
    </div>
  );
}