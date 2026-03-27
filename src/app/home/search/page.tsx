
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import { SongCard } from '@/components/song-card';
import { Song } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { splitArtistNames } from "@/lib/artist-names";
import { ArtistHoverCard } from "@/components/artist-hover-card";
import { cn, slugify } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const categories = [
  { name: "Pop", color: "from-red-500 to-pink-500" },
  { name: "Rock", color: "from-slate-600 to-gray-800" },
  { name: "Hip Hop", color: "from-purple-600 to-indigo-700" },
  { name: "Elektronik", color: "from-green-500 to-teal-600" },
  { name: "Klasik", color: "from-yellow-400 to-amber-600" },
  { name: "Caz", color: "from-blue-500 to-sky-700" },
];

type ArtistPreview = { name: string; imageUrl?: string; followers?: number };

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"tracks" | "artists" | "playlists">("tracks");
  const [recent, setRecent] = useState<string[]>([]);
  const [artistPreview, setArtistPreview] = useState<Record<string, ArtistPreview>>({});

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem("search-history") || "[]");
      if (Array.isArray(r)) setRecent(r.slice(0, 8));
    } catch {}
  }, []);

  // /home/search?q=... ile gelinince otomatik ara
  useEffect(() => {
    const q = searchParams.get("q")?.trim();
    if (!q) return;
    setSearchTerm(q);
    void (async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);
        setResults(Array.isArray(json?.songs) ? json.songs : []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    })();
    // sadece query değişince çalışsın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const uniqueArtists = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of results) {
      const names = splitArtistNames(s.artist);
      const list = names.length ? names : [s.artist];
      for (const n of list) {
        const key = (n || "").trim().toLowerCase();
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(n.trim());
      }
    }
    return out.slice(0, 24);
  }, [results]);

  // Artist preview (image/followers) fetch, lazy + cached
  useEffect(() => {
    let cancelled = false;
    const missing = uniqueArtists
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => !artistPreview[n.toLowerCase()]);
    if (missing.length === 0) return;

    (async () => {
      const batch = missing.slice(0, 8);
      await Promise.all(
        batch.map(async (name) => {
          try {
            const res = await fetch(`/api/artist-search?q=${encodeURIComponent(name)}`);
            const json = await res.json().catch(() => null);
            const data = json?.success ? json.data : null;
            const preview: ArtistPreview = data ? { name: data.name || name, imageUrl: data.imageUrl, followers: data.followers } : { name };
            if (cancelled) return;
            setArtistPreview((prev) => ({ ...prev, [name.toLowerCase()]: preview }));
          } catch {
            if (cancelled) return;
            setArtistPreview((prev) => ({ ...prev, [name.toLowerCase()]: { name } }));
          }
        })
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [uniqueArtists, artistPreview]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      setResults(Array.isArray(json?.songs) ? json.songs : []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }

    try {
      const history = JSON.parse(localStorage.getItem("search-history") || "[]");
      const arr = Array.isArray(history) ? history : [];
      const filtered = arr.filter((t: string) => t !== searchTerm.trim());
      filtered.unshift(searchTerm.trim());
      localStorage.setItem("search-history", JSON.stringify(filtered.slice(0, 10)));
      setRecent(filtered.slice(0, 8));
    } catch {}
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-4xl font-bold">Ara</h1>

      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Ne dinlemek istersin?"
          className="pl-12 h-14 text-lg bg-secondary border-0 focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-[92px] top-1/2 -translate-y-1/2"
            onClick={() => setSearchTerm("")}
            aria-label="Temizle"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" size="lg" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ara'}
        </Button>
      </form>

      {isLoading && (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-square bg-secondary rounded-lg"></div>
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                    <div className="h-4 bg-secondary rounded w-1/2"></div>
                </div>
            ))}
         </div>
      )}

      {!isLoading && hasSearched && (
        <section className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="bg-secondary/40">
              <TabsTrigger value="tracks">Şarkılar</TabsTrigger>
              <TabsTrigger value="artists">Sanatçılar</TabsTrigger>
              <TabsTrigger value="playlists">Playlistler</TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="mt-4">
              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {results.map((song) => (
                    <SongCard key={song.id} item={song} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16">
                  <p className="text-lg">Sonuç bulunamadı.</p>
                  <p>"{searchTerm}" için sonuç bulunamadı. Lütfen başka bir şey deneyin.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="artists" className="mt-4">
              {uniqueArtists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {uniqueArtists.map((name) => {
                    const p = artistPreview[name.toLowerCase()];
                    const displayName = p?.name || name;
                    const img = p?.imageUrl;
                    return (
                      <Link
                        key={name}
                        href={`/home/artist/${slugify(displayName)}`}
                        className={cn(
                          "group rounded-2xl border border-white/10 bg-secondary/20 hover:bg-secondary/40 transition-colors p-4",
                          "flex flex-col items-center text-center"
                        )}
                      >
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10 border border-white/10">
                          {img ? (
                            <Image src={img} alt={displayName} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
                          )}
                        </div>
                        <div className="mt-3 font-semibold truncate w-full">
                          <ArtistHoverCard name={displayName}>{displayName}</ArtistHoverCard>
                        </div>
                        <div className="text-xs text-muted-foreground">Sanatçı</div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16">
                  Sanatçı sonucu yok. Önce bir şarkı arat.
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlists" className="mt-4">
              <div className="text-muted-foreground">
                Playlist arama yakında. (Şimdilik şarkı ve sanatçı araması aktif.)
              </div>
            </TabsContent>
          </Tabs>
        </section>
      )}

      {!isLoading && !hasSearched && (
        <section>
          {recent.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight mb-3">Son aramalar</h2>
              <div className="flex flex-wrap gap-2">
                {recent.map((t) => (
                  <button
                    key={t}
                    className="px-3 py-1.5 rounded-full bg-secondary/40 hover:bg-secondary/60 text-sm transition-colors"
                    onClick={() => {
                      setSearchTerm(t);
                      // auto-run search
                      void (async () => {
                        setIsLoading(true);
                        setHasSearched(true);
                        try {
                          const res = await fetch(`/api/search?q=${encodeURIComponent(t)}`, { cache: "no-store" });
                          const json = await res.json().catch(() => null);
                          setResults(Array.isArray(json?.songs) ? json.songs : []);
                        } catch {
                          setResults([]);
                        } finally {
                          setIsLoading(false);
                        }
                      })();
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-semibold tracking-tight mb-4">Hepsine göz at</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`relative aspect-square rounded-lg p-4 overflow-hidden flex items-end bg-gradient-to-br ${category.color} transition-transform hover:scale-105 cursor-pointer`}
              >
                <h3 className="text-white font-bold text-2xl shadow-lg">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
