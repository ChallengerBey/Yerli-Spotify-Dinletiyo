"use client";

import { useEffect, useState } from 'react';
import { SongCard } from "@/components/song-card";
import { ArtistCard } from "@/components/artist-card";
import { Onboarding } from "@/components/onboarding";
import { getMadeForYou, getNewReleases, filterPlaylistsByPreferences, Playlist } from "@/lib/data";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import artistsData from '../../../data/songer.json';
import { SimpleYoutubeSearch } from '@/components/simple-youtube-search';
import { Button } from "@/components/ui/button";
import { detectSongLanguage } from '@/lib/language-utils';
import { parseYouTubeMusicMeta } from "@/lib/youtube-metadata";
import { useRouter } from "next/navigation";

interface Artist {
  name: string;
  imageUrl: string;
  spotifyUrl: string;
  source: string;
}

interface UserPreferences {
  artists: string[];
  genres: string[];
}

interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle?: string;
}

function extractArtistAndTitle(fullTitle: string) {
  const parsed = parseYouTubeMusicMeta(fullTitle);
  return { artist: parsed.artist || 'Bilinmeyen', title: parsed.title || fullTitle.trim() };
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 w-full">
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ title, showAll = true, id }: { title: string; showAll?: boolean; id?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 id={id} className="text-xl font-bold">{title}</h2>

      {showAll && (
        <div className="flex items-center gap-2">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            Tümünü göster
          </button>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const TURK_ILHAM_SONGS = [
  { id: 'ilham-1', title: 'Seni Kendime Sakladım', artist: 'Duman', imageUrl: 'https://i.ytimg.com/vi/3Rl2xpHFMaI/hqdefault.jpg', audioUrl: '3Rl2xpHFMaI', duration: '4:12' },
  { id: 'ilham-2', title: 'Duman', artist: 'Mor ve Ötesi', imageUrl: 'https://i.ytimg.com/vi/Wd7xqPMBCpI/hqdefault.jpg', audioUrl: 'Wd7xqPMBCpI', duration: '3:58' },
  { id: 'ilham-3', title: 'Kuzu Kuzu', artist: 'Tarkan', imageUrl: 'https://i.ytimg.com/vi/Wd7xqPMBCpI/hqdefault.jpg', audioUrl: 'Wd7xqPMBCpI', duration: '3:45' },
  { id: 'ilham-4', title: 'Firuze', artist: 'Sezen Aksu', imageUrl: 'https://i.ytimg.com/vi/3Rl2xpHFMaI/hqdefault.jpg', audioUrl: '3Rl2xpHFMaI', duration: '4:30' },
  { id: 'ilham-5', title: 'Paramparça', artist: 'Teoman', imageUrl: 'https://i.ytimg.com/vi/Wd7xqPMBCpI/hqdefault.jpg', audioUrl: 'Wd7xqPMBCpI', duration: '4:05' },
];

const EXCLUDED_ARTISTS = ['Hande Yener', 'Dedublüman'];
const ARTISTS_PER_PAGE = 12;

export default function HomePageClient() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [playlistRefreshKey, setPlaylistRefreshKey] = useState(0);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);
  const [artistPage, setArtistPage] = useState(0);
  const [artistAnimating, setArtistAnimating] = useState(false);
  const [artistDirection, setArtistDirection] = useState<'left' | 'right'>('right');
  const [madeForYou, setMadeForYou] = useState<Playlist[]>([]);
  const [newReleases, setNewReleases] = useState<Playlist[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<YoutubeVideo[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [personalizedQuery, setPersonalizedQuery] = useState<string>('türkçe müzik 2024');
  const [personalizedLanguage, setPersonalizedLanguage] = useState<'turkish' | 'english'>('turkish');
  const [personalizedIsRap, setPersonalizedIsRap] = useState<boolean>(true);
  const [ilhamPage, setIlhamPage] = useState(0);
  const [ilhamAnimating, setIlhamAnimating] = useState(false);
  const [ilhamDirection, setIlhamDirection] = useState<'left' | 'right'>('right');
  const ILHAM_PER_PAGE = 6;

  const normalizeText = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const matchesAnySelectedArtist = (title: string, fallbackArtist: string) => {
    if (!userPreferences?.artists?.length) return true;
    const hay = normalizeText(`${title} ${fallbackArtist}`);
    return userPreferences.artists.some((a) => {
      const needle = normalizeText(a);
      if (!needle) return false;
      return hay.includes(needle);
    });
  };

  const changePage = (dir: 'left' | 'right') => {
    if (artistAnimating) return;
    const totalPages = Math.ceil(popularArtists.length / ARTISTS_PER_PAGE);
    const next = dir === 'right' ? artistPage + 1 : artistPage - 1;
    if (next < 0 || next >= totalPages) return;
    setArtistDirection(dir);
    setArtistAnimating(true);
    setTimeout(() => {
      setArtistPage(next);
      setArtistAnimating(false);
    }, 250);
  };

  useEffect(() => {
    const handleYoutubeLoaded = () => setPlaylistRefreshKey(prev => prev + 1);
    window.addEventListener('youtubeLoaded', handleYoutubeLoaded);
    return () => window.removeEventListener('youtubeLoaded', handleYoutubeLoaded);
  }, []);

  const [lastPlayedUpdate, setLastPlayedUpdate] = useState(0);

  useEffect(() => {
    const handleSongChanged = () => {
      console.log('🎵 Şarkı değişti, ana sayfa önerileri güncelleniyor...');
      setLastPlayedUpdate(prev => prev + 1);
    };
    window.addEventListener('songChanged', handleSongChanged);
    return () => window.removeEventListener('songChanged', handleSongChanged);
  }, []);

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]') as Array<any>;
      const recentTop = Array.isArray(recent) ? recent.slice(0, 10) : [];
      
      console.log('📊 Son dinlenenler kontrol ediliyor:', recentTop.length);

      // Eğer son dinlenenler varsa, onları önceliklendir (kullanıcının güncel zevki)
      if (recentTop.length > 0) {
        const last = recentTop[0];
        const lastArtist = (last?.artist || '').toString().trim();
        const lastTitle = (last?.title || '').toString().trim();
        
        console.log('🎯 Son dinlenen sanatçı:', lastArtist);

        // Sanatçı bazlı bir arama sorgusu oluştur
        const lang = detectSongLanguage(lastTitle, lastArtist) === 'turkish' ? 'turkish' : 'english';
        const rapSignals = ['rap', 'hip hop', 'hip-hop', 'drill', 'trap', 'freestyle', 'type beat', 'cypher'];
        const looksRap = rapSignals.some(sig => `${lastTitle} ${lastArtist}`.toLowerCase().includes(sig)) ||
          ['ceza', 'sagopa', 'ezhel', 'uzi', 'gazapizm', 'khontkar', 'blok3', 'şanışer', 'cakal', 'reckol', 'lvbel', 'batuflex', 'no.1', 'maestro', 'mode xl']
            .some(a => lastArtist.toLowerCase().includes(a));
            
        setPersonalizedLanguage(lang);
        setPersonalizedIsRap(looksRap);
        
        const genre = lang === 'turkish' ? (looksRap ? 'türkçe rap' : 'türkçe pop') : (looksRap ? 'hip hop' : 'english rap');
        
        // Eğer son dinlenen sanatçı seçilen tercihlerden biriyse veya tercihler hiç yoksa direkt kullan
        const q = lastArtist ? `${lastArtist} ${genre} official audio` : `${genre} hits 2024`;
        setPersonalizedQuery(q);
        console.log('🚀 Yeni arama sorgusu:', q);
        return;
      }

      // Eğer son dinlenen yoksa, başlangıç tercihlerine bak
      if (userPreferences?.artists?.length || userPreferences?.genres?.length) {
        const artist = userPreferences.artists?.[0]?.toString().trim();
        const genre = userPreferences.genres?.[0]?.toString().trim();
        const q = artist
          ? `${artist}${genre ? ` ${genre}` : ""} official audio`
          : `${genre || "türkçe müzik"} hits 2024`;
        setPersonalizedLanguage('turkish');
        setPersonalizedIsRap(Boolean(genre && normalizeText(genre).includes("rap")));
        setPersonalizedQuery(q);
        return;
      }
      
      // Hiçbir şey yoksa varsayılan
      setPersonalizedQuery('türkçe müzik hits 2024');
    } catch (error) {
      console.error('Kişiselleştirme hatası:', error);
    }
  }, [userPreferences, lastPlayedUpdate]);



  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        // Eğer kişiselleştirilmiş bir sorgu varsa, direkt YouTube'dan çek (Radyo-D pop ağırlıklı olduğu için kişiselleştirmeyi bozar)
        const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
        const hasRecent = recent.length > 0;

        if (!hasRecent) {
          console.log('📻 Kişiselleştirme yok, Radyo-D Top 20 yükleniyor...');
          const res = await fetch('/api/radyod-top20');
          if (res.ok) {
            const data = await res.json();
            if (data.videos?.length > 0) {
              setTrendingVideos(data.videos.slice(0, 50));
              const { addYoutubeToCache } = await import('@/lib/data');
              addYoutubeToCache(data.videos);
              window.dispatchEvent(new CustomEvent('youtubeLoaded'));
              setLoadingTrending(false);
              return;
            }
          }
        }

        console.log('🔍 Kişiselleştirilmiş içerik aranıyor:', personalizedQuery);
        const scrapeRes = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(personalizedQuery)}`);
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          if (scrapeData.videos?.length > 0) {
            const filtered = scrapeData.videos.filter((v: any) => {
              const parsed = extractArtistAndTitle(v.title || '');
              const l = detectSongLanguage(parsed.title, parsed.artist);
              if (personalizedLanguage === 'turkish') return l === 'turkish';
              return l !== 'turkish';
            });
            const artistFiltered = (filtered.length ? filtered : scrapeData.videos).filter((v: any) => {
              const parsed = extractArtistAndTitle(v.title || "");
              return matchesAnySelectedArtist(parsed.title || v.title || "", parsed.artist || v.channelTitle || "");
            });
            const best = (artistFiltered.length >= 8 ? artistFiltered : (filtered.length ? filtered : scrapeData.videos)).slice(0, 50);
            setTrendingVideos(best);
            const { addYoutubeToCache } = await import('@/lib/data');
            addYoutubeToCache(best);
            window.dispatchEvent(new CustomEvent('youtubeLoaded'));
          }
        }
      } catch (e) {
        console.error('Trending yüklenemedi:', e);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, [personalizedQuery, personalizedLanguage]);


  useEffect(() => {
    const loadArtists = async () => {
      // 1. Son dinlenen sanatçıları al
      const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]') as Array<any>;
      const recentArtists = recent
        .map(s => s.artist)
        .filter((artist, index, self) => artist && self.indexOf(artist) === index) // Unique artists
        .slice(0, 12); // İlk 12 son dinlenen

      // 2. songer.json'dan popüler sanatçıları al
      const popular = [...(artistsData as any[])]
        .filter(a => !EXCLUDED_ARTISTS.includes(a.name))
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 48)
        .map(a => ({ 
          name: a.name, 
          imageUrl: a.imageUrl, 
          spotifyUrl: a.deezerUrl, 
          source: 'deezer' 
        }));

      // 3. Son dinlenen sanatçıların detaylarını popular listesinden bul veya yeni oluştur
      const recentDetailed = recentArtists.map(name => {
        const found = popular.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (found) return found;
        return { 
          name, 
          imageUrl: '', // ArtistCard default avatar kullanacak
          spotifyUrl: '',
          source: 'dynamic'
        };
      });

      // 4. Birleştir: Önce son dinlenenler, sonra popüler olanlar (duplicate olmasın)
      const combined = [...recentDetailed];
      popular.forEach(p => {
        if (!combined.some(c => c.name.toLowerCase() === p.name.toLowerCase())) {
          combined.push(p);
        }
      });

      setPopularArtists(combined.slice(0, 36)); // Toplam 3 sayfa artist göster
    };

    loadArtists();
  }, [lastPlayedUpdate]); // Şarkı değiştiğinde bu liste de güncellensin


  useEffect(() => {
    const data = getMadeForYou(6);
    setMadeForYou(userPreferences ? filterPlaylistsByPreferences(data, userPreferences) : data);
  }, [playlistRefreshKey, userPreferences]);

  useEffect(() => {
    const data = getNewReleases(6);
    setNewReleases(userPreferences ? filterPlaylistsByPreferences(data, userPreferences) : data);
  }, [playlistRefreshKey, userPreferences]);

  useEffect(() => {
    const load = async () => {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!currentUser) return;
      try {
        const user = JSON.parse(currentUser);
        const onboardingKey = `onboarding-completed-${user.id}`;
        const preferencesKey = `user-preferences-${user.id}`;
        try {
          const res = await fetch(`/api/user-data?userId=${user.id}`);
          if (res.ok) {
            const d = await res.json();
            if (d.preferences?.artists?.length > 0 || d.preferences?.genres?.length > 0) {
              localStorage.setItem(preferencesKey, JSON.stringify(d.preferences));
              localStorage.setItem(onboardingKey, 'true');
              setUserPreferences(d.preferences);
              return;
            }
          }
        } catch {}
        const done = localStorage.getItem(onboardingKey);
        if (done === 'true') {
          const prefs = localStorage.getItem(preferencesKey);
          if (prefs) setUserPreferences(JSON.parse(prefs));
          else setShowOnboarding(true);
        } else {
          setShowOnboarding(true);
        }
      } catch {}
    };
    load();
  }, []);

  const handleOnboardingComplete = async (preferences: UserPreferences) => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    const user = JSON.parse(currentUser);
    localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
    localStorage.setItem(`user-preferences-${user.id}`, JSON.stringify(preferences));
    setUserPreferences(preferences);
    setShowOnboarding(false);
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, preferences }),
      });
    } catch {}
  };

  if (showOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <main className="space-y-10 pb-8">
        <section className="space-y-3" aria-labelledby="senin-icin-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 id="senin-icin-title" className="text-xl font-bold">Senin için</h1>
              <p className="text-sm text-muted-foreground mt-1">Seçimlerine göre öneriler</p>
            </div>
            <Button variant="ghost" onClick={() => router.push("/home/search")} className="mt-1">Ara</Button>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <SimpleYoutubeSearch defaultQuery={personalizedQuery} hideSearchBar />
          </div>
        </section>

        {popularArtists.length > 0 && (() => {
          const totalPages = Math.ceil(popularArtists.length / ARTISTS_PER_PAGE);
          const pageArtists = popularArtists.slice(artistPage * ARTISTS_PER_PAGE, (artistPage + 1) * ARTISTS_PER_PAGE);
          return (
            <section aria-labelledby="dinlemeye-devam-et-title">
              <div className="flex items-center justify-between mb-4">
                <h2 id="dinlemeye-devam-et-title" className="text-xl font-bold">Dinlemeye devam et</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{artistPage + 1} / {totalPages}</span>
                  <button onClick={() => changePage('left')} disabled={artistPage === 0 || artistAnimating} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Önceki sayfa"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => changePage('right')} disabled={artistPage === totalPages - 1 || artistAnimating} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Sonraki sayfa"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-6 lg:grid-cols-12 gap-3 transition-all duration-250" style={{ opacity: artistAnimating ? 0 : 1, transform: artistAnimating ? `translateX(${artistDirection === 'right' ? '-30px' : '30px'})` : 'translateX(0)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
                {pageArtists.map((artist, i) => <ArtistCard key={`${artist.name}-${artistPage}-${i}`} name={artist.name} imageUrl={artist.imageUrl} spotifyUrl={artist.spotifyUrl} />)}
              </div>
            </section>
          );
        })()}

        {(() => {
          const songs = trendingVideos.length > 0 ? trendingVideos.map(v => ({ ...extractArtistAndTitle(v.title), id: v.id, imageUrl: v.thumbnail, audioUrl: v.id, duration: v.duration })) : TURK_ILHAM_SONGS;
          const totalPages = Math.ceil(songs.length / ILHAM_PER_PAGE);
          const pageSongs = songs.slice(ilhamPage * ILHAM_PER_PAGE, (ilhamPage + 1) * ILHAM_PER_PAGE);
          const changeIlhamPage = (dir: 'left' | 'right') => {
            if (ilhamAnimating) return;
            const next = dir === 'right' ? ilhamPage + 1 : ilhamPage - 1;
            if (next < 0 || next >= totalPages) return;
            setIlhamDirection(dir);
            setIlhamAnimating(true);
            setTimeout(() => { setIlhamPage(next); setIlhamAnimating(false); }, 250);
          };
          return (
            <section aria-labelledby="ilham-kaynagi-title">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 id="ilham-kaynagi-title" className="text-xl font-bold">Bu mikslerin ilham kaynağı..</h2>
                  <p className="text-sm text-muted-foreground mt-1">Favorilerine benzer yeni parçalar keşfet</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {!loadingTrending && totalPages > 1 && <span className="text-xs text-muted-foreground">{ilhamPage + 1} / {totalPages}</span>}
                  <div className="flex gap-1">
                    <button onClick={() => changeIlhamPage('left')} disabled={ilhamPage === 0 || ilhamAnimating || loadingTrending} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Önceki sayfa"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => changeIlhamPage('right')} disabled={ilhamPage === totalPages - 1 || ilhamAnimating || loadingTrending} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Sonraki sayfa"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
              {loadingTrending ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{Array.from({ length: ILHAM_PER_PAGE }).map((_, i) => <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 animate-pulse"><div className="w-14 h-14 rounded-md bg-secondary flex-shrink-0" /><div className="space-y-2 flex-1"><div className="h-3 bg-secondary rounded w-3/4" /><div className="h-3 bg-secondary rounded w-1/2" /></div></div>)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{ opacity: ilhamAnimating ? 0 : 1, transform: ilhamAnimating ? `translateX(${ilhamDirection === 'right' ? '-30px' : '30px'})` : 'translateX(0)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
                  {pageSongs.map((song: any, i: number) => (
                    <article key={`ilham-${song.id}-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors" onClick={() => {
                      if (!song.audioUrl) return;
                      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
                      if (!currentUser) { window.dispatchEvent(new CustomEvent('showAuthModal', { detail: { title: song.title, artist: song.artist, imageUrl: song.imageUrl, thumbnail: song.imageUrl } })); return; }
                      window.dispatchEvent(new CustomEvent('startRadio', { detail: { id: song.id, title: song.title, artist: song.artist, imageUrl: song.imageUrl, audioUrl: song.audioUrl, duration: song.duration, album: '' } }));
                    }}>
                      <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-secondary">{song.imageUrl && <Image src={song.imageUrl} alt={song.title} fill className="object-cover" />}</div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">{song.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">- {song.artist}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })()}

        {newReleases.length > 0 && (
          <section aria-labelledby="sevecegin-calma-listeleri-title">
            <SectionHeader title="Seveceğin çalma listeleri" id="sevecegin-calma-listeleri-title" />
            <HorizontalScroll>
              {newReleases.map((playlist, i) => (
                <div key={`playlist-${i}`} className="min-w-[160px] max-w-[160px]">
                  <SongCard item={playlist} startRadio />
                </div>
              ))}
            </HorizontalScroll>
          </section>
        )}

        <footer className="text-center text-sm text-muted-foreground pt-4 border-t">Dinletiyo Company Semih Ergili 2026</footer>
      </main>

  );
}
