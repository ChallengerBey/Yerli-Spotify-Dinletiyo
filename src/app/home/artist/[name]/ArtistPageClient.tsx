"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, LayoutGrid } from "lucide-react";
import { slugify } from "@/lib/utils";

type ArtistInfo = {
  id: string;
  name: string;
  imageUrl?: string;
  followers?: number;
};

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle?: string;
};

const formatFollowers = (n?: number) => {
  if (!n && n !== 0) return "";
  return new Intl.NumberFormat("tr-TR").format(n);
};

const extractArtistAndTitle = (fullTitle: string, fallbackArtist: string) => {
  const separators = [" - ", " – ", " — ", " | ", ": ", " / "];
  for (const sep of separators) {
    if (fullTitle.includes(sep)) {
      const parts = fullTitle.split(sep);
      if (parts.length >= 2) {
        const artist = parts[0].trim() || fallbackArtist;
        let title = parts.slice(1).join(sep).trim();
        title = title
          .replace(/\s*\(official.*?\)/gi, "")
          .replace(/\s*\[official.*?\]/gi, "")
          .replace(/\s*\(.*?video.*?\)/gi, "")
          .replace(/\s*\[.*?video.*?\]/gi, "")
          .trim();
        return { artist, title: title || fullTitle.trim() };
      }
    }
  }
  return { artist: fallbackArtist, title: fullTitle.trim() };
};

export default function ArtistPageClient({ artistName }: { artistName: string }) {
  const router = useRouter();

  const [artist, setArtist] = React.useState<ArtistInfo>({ id: "", name: artistName });
  const [popular, setPopular] = React.useState<Video[]>([]);
  const [loadingPopular, setLoadingPopular] = React.useState(true);
  const [isFollowing, setIsFollowing] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const loadArtist = async () => {
      try {
        const res = await fetch(`/api/artist-search?q=${encodeURIComponent(artistName)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.success && data?.data) {
          setArtist((prev) => ({
            ...prev,
            id: data.data.id,
            name: data.data.name || artistName,
            imageUrl: data.data.imageUrl,
            followers: data.data.followers,
          }));
        }
      } catch {}
    };

    const loadPopular = async () => {
      setLoadingPopular(true);
      try {
        const q = `${artistName} en popüler şarkıları`;
        const res = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (cancelled) return;
        setPopular(Array.isArray(data?.videos) ? data.videos.slice(0, 10) : []);
      } catch {
        if (!cancelled) setPopular([]);
      } finally {
        if (!cancelled) setLoadingPopular(false);
      }
    };

    loadArtist();
    loadPopular();

    return () => {
      cancelled = true;
    };
  }, [artistName]);

  const playVideo = (video: Video) => {
    const { artist: a, title } = extractArtistAndTitle(video.title, artistName);
    const songData = {
      id: video.id,
      title,
      artist: a,
      album: "",
      duration: video.duration || "0:00",
      imageUrl: video.thumbnail,
      audioUrl: video.id,
      aiHint: "youtube",
    };
    window.dispatchEvent(new CustomEvent("startRadio", { detail: songData }));
  };

  return (
    <main className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/5" aria-labelledby="artist-name">
        <div className="absolute inset-0">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-black to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>

        <div className="relative p-5 sm:p-8 min-h-[240px] flex flex-col justify-end">
          <nav className="absolute top-4 left-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 px-3 py-2 text-sm text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>
          </nav>

          <div className="space-y-3">
            <h1 id="artist-name" className="text-4xl sm:text-6xl font-black tracking-tight text-white">
              {artist.name}
            </h1>
            <div className="text-white/70 text-sm">
              {artist.followers !== undefined ? (
                <span>Aylık {formatFollowers(artist.followers)} dinleyici</span>
              ) : (
                <span>Sanatçı</span>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => popular[0] && playVideo(popular[0])}
                disabled={!popular[0]}
                className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500 text-white hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label={`${artist.name} şarkılarını çal`}
              >
                <Play className="h-6 w-6 fill-white" />
              </button>
              <button
                onClick={() => setIsFollowing((v) => !v)}
                className="h-10 rounded-full px-4 text-sm font-semibold border border-white/25 text-white hover:bg-white/10 transition-colors"
              >
                {isFollowing ? "Takiptesin" : "Takip Et"}
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Yakında: daha fazla seçenek", type: "info" } }))}
                className="h-10 rounded-full px-3 text-sm font-semibold border border-white/15 text-white/80 hover:bg-white/10 transition-colors"
                aria-label="Daha fazla seçenek"
              >
                …
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="space-y-3" aria-labelledby="popular-songs-title">
        <div className="flex items-center justify-between">
          <h2 id="popular-songs-title" className="text-xl font-bold">Popüler</h2>
          <button
            onClick={() => router.push(`/home/search`)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Daha fazla ara
          </button>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
          {loadingPopular ? (
            <div className="p-4 text-sm text-muted-foreground">Yükleniyor...</div>
          ) : popular.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Şarkı bulunamadı.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {popular.slice(0, 5).map((v, idx) => {
                const parsed = extractArtistAndTitle(v.title, artistName);
                return (
                  <button
                    key={v.id}
                    onClick={() => playVideo(v)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    aria-label={`${parsed.title} şarkısını çal`}
                  >
                    <div className="w-6 text-xs text-white/50 tabular-nums" aria-hidden="true">{idx + 1}</div>
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0">
                      {v.thumbnail ? (
                        <Image src={v.thumbnail} alt={parsed.title} fill className="object-cover" unoptimized />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{parsed.title}</div>
                      <div className="text-xs text-white/50 truncate">{parsed.artist}</div>
                    </div>
                    <div className="text-xs text-white/50 tabular-nums">{v.duration}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Discography */}
      <section className="space-y-3" aria-labelledby="discography-title">
        <div className="flex items-center justify-between">
          <h2 id="discography-title" className="text-xl font-bold">Diskografi</h2>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Yakında: albüm/EP ayrımı", type: "info" } }))}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Tümünü göster
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {popular.slice(0, 6).map((v) => (
            <article
              key={`disc-${v.id}`}
              className="text-left group cursor-pointer"
              onClick={() => playVideo(v)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-white/15 transition-colors">
                {v.thumbnail ? (
                  <Image src={v.thumbnail} alt={v.title} fill className="object-cover" unoptimized />
                ) : null}
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-semibold line-clamp-1">{v.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">Single</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Discover More - Internal Linking */}
      <section className="pt-8 border-t border-white/5 space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LayoutGrid className="w-5 h-5" />
          <h2 className="text-lg font-bold">Keşfetmeye Devam Et</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/home')}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
          >
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="font-bold">Ana Sayfa</div>
              <div className="text-sm text-muted-foreground">Senin için seçilen miksler</div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/home/search')}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold">Müzik Keşfet</div>
              <div className="text-sm text-muted-foreground">Türler ve yeni sanatçılar</div>
            </div>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {['Tarkan', 'Sezen Aksu', 'Ezhel', 'BLOK3', 'Semicenk'].map((name) => (
            <button
              key={name}
              onClick={() => router.push(`/home/artist/${slugify(name)}`)}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </section>
    </main>

  );

}
