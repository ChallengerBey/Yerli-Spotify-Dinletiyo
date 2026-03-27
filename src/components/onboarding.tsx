"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import artistsData from "../../data/songer.json";
import { Check, Search, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const GENRES = [
  "Türkçe Pop",
  "Türkçe Rap",
  "Türkçe Rock",
  "Arabesk",
  "Alternatif",
  "Elektronik",
  "Lo-fi",
  "Indie",
  "Jazz",
  "Blues",
  "Klasik",
  "Akustik",
];

type OnboardingStep = 0 | 1 | 2;

type Artist = {
  id?: string | number;
  name: string;
  imageUrl?: string;
  rank?: number;
};

interface OnboardingProps {
  onComplete: (preferences: { artists: string[]; genres: string[] }) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [step, setStep] = useState<OnboardingStep>(0);
  const [artistQuery, setArtistQuery] = useState("");

  const toggleArtist = (artist: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artist) ? prev.filter((a) => a !== artist) : [...prev, artist]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleComplete = () => {
    onComplete({ artists: selectedArtists, genres: selectedGenres });
  };

  const progressValue = step === 0 ? 18 : step === 1 ? 60 : 100;

  const popularArtists = useMemo(() => {
    const list = (artistsData as unknown as Artist[])
      .filter((a) => a?.name)
      .slice()
      .sort((a, b) => (a.rank ?? 999999) - (b.rank ?? 999999))
      .slice(0, 72);

    const q = artistQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => a.name.toLowerCase().includes(q));
  }, [artistQuery]);

  const selectedArtistObjects = useMemo(() => {
    const byName = new Map<string, Artist>();
    for (const a of artistsData as unknown as Artist[]) byName.set(a.name, a);
    return selectedArtists.map((name) => byName.get(name) ?? { name });
  }, [selectedArtists]);

  const canContinueFromArtists = selectedArtists.length >= 3;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-background/75 backdrop-blur-md" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.12),transparent_45%)]" />

      <div className="relative flex min-h-full items-start justify-center p-2 py-4 sm:items-center sm:p-4">
        <Card className="w-full max-w-6xl overflow-hidden border-white/10 bg-background/70 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
            <div className="relative border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sana özel öneriler
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    Dinletiyo’yu sana göre ayarlayalım
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    30 saniyede biter. Seçtiklerine göre ana sayfa ve öneriler daha isabetli olur.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={handleComplete}
                  title="Şimdilik geç"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Kurulum</span>
                  <span>{step === 0 ? "1" : step === 1 ? "2" : "3"} / 3</span>
                </div>
                <Progress value={progressValue} className="h-2 bg-white/10" />
              </div>

              <Separator className="my-6 bg-white/10" />

              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
                  <div className="text-xs font-semibold sm:text-sm">Seçtiklerin</div>
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                    {selectedArtists.length === 0 && selectedGenres.length === 0 ? (
                      <div className="text-xs text-muted-foreground sm:text-sm">
                        Henüz seçim yok. İstersen sonra da değiştirebilirsin.
                      </div>
                    ) : (
                      <>
                        {selectedArtists.slice(0, 6).map((a) => (
                          <Badge key={`sa-${a}`} variant="secondary" className="gap-1 text-xs">
                            <span className="max-w-[100px] truncate sm:max-w-none">{a}</span>
                            <button
                              className="ml-0.5 rounded-full hover:bg-white/10"
                              onClick={() => toggleArtist(a)}
                              aria-label={`${a} kaldır`}
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {selectedArtists.length > 6 && (
                          <Badge variant="outline" className="border-white/15 text-xs">
                            +{selectedArtists.length - 6} daha
                          </Badge>
                        )}
                        {selectedGenres.map((g) => (
                          <Badge key={`sg-${g}`} variant="outline" className="border-white/15 text-xs">
                            {g}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground sm:text-xs">
                  İpucu: Sanatçı seçiminde{" "}
                  <span className="font-semibold text-foreground">en az 3</span> seçersen öneriler daha iyi olur.
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <CardHeader className="p-0">
                <CardTitle className="text-lg sm:text-xl">
                  {step === 0
                    ? "Başlamadan önce"
                    : step === 1
                      ? "Sevdiğin sanatçıları seç"
                      : "Sevdiğin türleri seç"}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {step === 0
                    ? "Hızlıca birkaç tercih alalım; sonra içerik çok daha isabetli olacak."
                    : step === 1
                      ? "Arat, seç ve devam et. İstediğin zaman ayarlardan değiştirirsin."
                      : "İstersen boş bırakabilirsin; sanatçı seçimin zaten yeter."}
                </p>
              </CardHeader>

              <CardContent className="mt-6 p-0">
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-3">
                      {[
                        { title: "Daha iyi öneriler", desc: "Seçimlerine göre ana sayfa şekillenir." },
                        { title: "Daha az alakasız içerik", desc: "Karışık sonuçlar azalır." },
                        { title: "Hızlı başlangıç", desc: "2 adımda biter, sonra akışa geçersin." },
                      ].map((c) => (
                        <div
                          key={c.title}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4"
                        >
                          <div className="text-sm font-semibold sm:text-base">{c.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{c.desc}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button variant="ghost" onClick={handleComplete} className="w-full sm:w-auto">
                        Şimdilik geç
                      </Button>
                      <Button onClick={() => setStep(1)} className="w-full sm:w-auto">Devam et</Button>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={artistQuery}
                        onChange={(e) => setArtistQuery(e.target.value)}
                        placeholder="Sanatçı ara (örn: Sezen Aksu)"
                        className="pl-9"
                      />
                    </div>

                    {selectedArtists.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {selectedArtistObjects.map((a) => (
                          <Badge key={`sel-${a.name}`} variant="secondary" className="gap-1 text-xs sm:text-sm">
                            <span className="max-w-[120px] truncate sm:max-w-none">{a.name}</span>
                            <button
                              className="ml-0.5 rounded-full hover:bg-white/10"
                              onClick={() => toggleArtist(a.name)}
                              aria-label={`${a.name} kaldır`}
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="grid max-h-[50vh] gap-2.5 overflow-y-auto overflow-x-hidden pr-1 sm:max-h-[420px] sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                      {popularArtists.map((artist) => {
                        const active = selectedArtists.includes(artist.name);
                        return (
                          <button
                            key={(artist.id ?? artist.name).toString()}
                            onClick={() => toggleArtist(artist.name)}
                            className={cn(
                              "group relative rounded-2xl border p-2 text-left transition-all duration-200 active:scale-95 sm:p-3",
                              active
                                ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/20"
                                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                            )}
                            type="button"
                          >
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white/10 shadow-md">
                              {artist.imageUrl ? (
                                <Image
                                  src={artist.imageUrl}
                                  alt={artist.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-pink-500/30" />
                              )}
                              <div
                                className={cn(
                                  "absolute inset-0 bg-black/30 transition-opacity duration-200",
                                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                              />
                              <div
                                className={cn(
                                  "absolute right-2 top-2 rounded-full p-1.5 shadow-lg transition-all duration-200",
                                  active
                                    ? "bg-primary text-primary-foreground scale-100"
                                    : "bg-black/40 text-white scale-0 group-hover:scale-100"
                                )}
                              >
                                <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </div>
                            </div>
                            <div className="mt-1.5 sm:mt-2.5">
                              <div className="truncate text-xs font-semibold sm:text-sm md:text-base">{artist.name}</div>
                              <div className="text-[9px] text-muted-foreground sm:text-[10px] md:text-xs">Sanatçı</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-muted-foreground sm:text-sm">
                        {selectedArtists.length} sanatçı seçildi
                        {!canContinueFromArtists && (
                          <span className="ml-1 text-[10px] text-muted-foreground sm:ml-2 sm:text-xs">(devam için en az 3)</span>
                        )}
                      </div>
                      <div className="flex gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => setStep(0)} className="flex-1 sm:flex-none">
                          Geri
                        </Button>
                        <Button onClick={() => setStep(2)} disabled={!canContinueFromArtists} className="flex-1 sm:flex-none">
                          Devam et
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                      {GENRES.map((genre) => {
                        const active = selectedGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            className={cn(
                              "relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 active:scale-95 sm:p-4",
                              active
                                ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/20"
                                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                            )}
                            type="button"
                          >
                            <div className="text-sm font-semibold sm:text-base">{genre}</div>
                            <div className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                              {active ? "Seçildi" : "Seçmek için tıkla"}
                            </div>
                            <div
                              className={cn(
                                "absolute right-2 top-2 rounded-full p-1 transition-all duration-200 sm:right-3 sm:top-3",
                                active
                                  ? "bg-primary text-primary-foreground scale-100"
                                  : "bg-white/10 text-muted-foreground scale-90"
                              )}
                            >
                              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-muted-foreground sm:text-sm">
                        {selectedGenres.length} tür seçildi (opsiyonel)
                      </div>
                      <div className="flex gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none">
                          Geri
                        </Button>
                        <Button onClick={handleComplete} className="flex-1 sm:flex-none">Bitir</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}