"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
    Heart, MoreHorizontal, ChevronDown, ListMusic, Volume2, VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Song } from "@/lib/data";
import { getBestAlbumArt } from "@/lib/spotify-api";
import { ArtistHoverCard } from "@/components/artist-hover-card";
import { splitArtistNames } from "@/lib/artist-names";

interface FullScreenPlayerProps {
    currentSong: Song;
    isPlaying: boolean;
    progress: number;
    duration: number;
    volume: number;
    queue: Song[];
    currentIndex: number;
    isShuffling: boolean;
    repeatMode: 'off' | 'one' | 'all';
    isFavorite: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSeek: (value: number[]) => void;
    onVolumeChange: (value: number[]) => void;
    onToggleShuffle: () => void;
    onToggleRepeat: () => void;
    onToggleFavorite: () => void;
    onClose: () => void;
    onPlayQueueItem: (index: number) => void;
    isVisible?: boolean;
}

export function FullScreenPlayer({
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    queue,
    currentIndex,
    isShuffling,
    repeatMode,
    isFavorite,
    onPlayPause,
    onNext,
    onPrevious,
    onSeek,
    onVolumeChange,
    onToggleShuffle,
    onToggleRepeat,
    onToggleFavorite,
    onClose,
    onPlayQueueItem,
    isVisible = true
}: FullScreenPlayerProps) {
    const [gradientColor, setGradientColor] = useState("from-purple-900/50 to-black");
    const [imgSrc, setImgSrc] = useState(currentSong.imageUrl);
    const [queueImageSources, setQueueImageSources] = useState<Map<string, string>>(new Map());
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set()); // Yükleniyor mu kontrolü
    const scrollRef = useRef<HTMLDivElement>(null);

    // Format time (seconds -> mm:ss)
    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Handle queue item image error with fallback
    const handleQueueImageError = async (songId: string, currentSrc: string, artistName: string) => {
        // Zaten yükleniyor mu kontrol et (중복 방지)
        if (loadingImages.has(songId)) {
            console.log(`⏳ Zaten yükleniyor: ${songId}`);
            return;
        }
        
        // Zaten placeholder veya lastfm'den geliyorsa tekrar deneme
        if (currentSrc.includes('placehold') || currentSrc.includes('lastfm')) {
            console.log(`⏹️ Son fallback zaten kullanılıyor: ${songId}`);
            return;
        }
        
        console.log(`⚠️ Queue image yükleme hatası: ${songId}`);
        setLoadingImages(prev => new Set(prev).add(songId));
        
        // YouTube video ID'sini çıkar
        const videoIdMatch = currentSrc.match(/\/vi\/([^\/]+)\//);
        
        let newSrc = '';
        
        if (!videoIdMatch) {
            // YouTube değilse direkt placeholder
            newSrc = 'https://placehold.co/40x40/1a1a1a/666?text=♪';
        } else {
            const videoId = videoIdMatch[1];
            
            // Mevcut kaliteyi tespit et ve bir sonrakini dene
            if (currentSrc.includes('hqdefault')) {
                newSrc = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
            } else if (currentSrc.includes('mqdefault')) {
                newSrc = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
            } else if (currentSrc.includes('default.jpg')) {
                // Son YouTube kalitesi de çalışmadı, placeholder kullan
                newSrc = 'https://placehold.co/40x40/1a1a1a/666?text=♪';
            } else {
                // İlk hata, hqdefault dene
                newSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }
        }
        
        setQueueImageSources(prev => new Map(prev).set(songId, newSrc));
        setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(songId);
            return newSet;
        });
    };

    // Get image source for queue item
    const getQueueImageSrc = (song: Song) => {
        return queueImageSources.get(song.id) || song.imageUrl;
    };

    // Update image source when song changes - Spotify'dan gerçek albüm kapağı çek
    useEffect(() => {
        let isMounted = true;

        const loadAlbumArt = async () => {
            // Eğer zaten yüksek kaliteli görsel varsa (Deezer/Spotify), direkt kullan
            const isYoutubeThumbnail = currentSong.imageUrl.includes('ytimg.com') || 
                                      currentSong.imageUrl.includes('youtube.com');
            
            // YouTube thumbnail değilse direkt kullan (zaten player.tsx'te Deezer'dan çekilmiş)
            if (!isYoutubeThumbnail) {
                setImgSrc(currentSong.imageUrl);
                return;
            }

            // YouTube thumbnail ise Deezer'dan çek
            setImgSrc(currentSong.imageUrl);

            try {
                const bestArt = await getBestAlbumArt(
                    currentSong.imageUrl,
                    currentSong.artist,
                    currentSong.title
                );

                if (isMounted && bestArt !== currentSong.imageUrl) {
                    console.log(`🎨 Full screen: Albüm kapağı güncellendi: ${currentSong.title}`);
                    setImgSrc(bestArt);
                }
            } catch (error) {
                console.error('Albüm kapağı yükleme hatası:', error);
            }
        };

        loadAlbumArt();

        return () => {
            isMounted = false;
        };
    }, [currentSong.id, currentSong.imageUrl, currentSong.artist, currentSong.title]);

    // Scroll to current song in queue
    useEffect(() => {
        if (scrollRef.current) {
            const activeItem = scrollRef.current.querySelector('[data-active="true"]');
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentIndex, queue]);

    // Extract color from image (mock logic for now, using random gradients or based on known artists)
    useEffect(() => {
        // Simple mock logic for dynamic background
        const colors = [
            "from-purple-900/40 to-black",
            "from-blue-900/40 to-black",
            "from-red-900/40 to-black",
            "from-green-900/40 to-black",
            "from-pink-900/40 to-black",
        ];
        setGradientColor(colors[Math.floor(Math.random() * colors.length)]);
    }, [currentSong.id]);

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-3xl text-white transition-all duration-300 ease-in-out",
            isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
            {/* Dynamic Background */}
            <div className={cn("absolute inset-0 bg-gradient-to-b opacity-80 z-[-1]", gradientColor)} />

            {/* Background Image Blur Overlay (Optional) */}
            {currentSong.imageUrl && (
                <div className="absolute inset-0 z-[-2] opacity-20 blur-3xl scale-125">
                    <Image
                        src={currentSong.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full hover:bg-white/10"
                >
                    <ChevronDown className="h-6 w-6" />
                </Button>

                <div className="text-center">
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">Radyo</p>
                </div>

                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                    <MoreHorizontal className="h-6 w-6" />
                </Button>
            </header>

            {/* Main Content */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-stretch lg:items-start justify-start lg:justify-between px-4 lg:px-16 gap-4 lg:gap-16 pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto lg:overflow-hidden">

                {/* Left Side: Album Art & Controls */}
                <div className="w-full lg:w-[60%] flex flex-col justify-center items-center gap-6 lg:gap-6 h-full min-h-0">
                    {/* Album Art - Mobilde büyük, masaüstünde orta */}
                    <div className="relative w-full max-w-[85vw] sm:max-w-[400px] lg:max-w-[400px] aspect-square shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        {currentSong.imageUrl ? (
                            <Image
                                src={imgSrc || currentSong.imageUrl}
                                alt={currentSong.title}
                                fill
                                className="object-cover"
                                priority
                                quality={100}
                                sizes="(max-width: 768px) 85vw, 400px"
                                onError={() => {
                                    // Zaten placeholder ise tekrar deneme
                                    if (imgSrc?.includes('placehold')) {
                                        return;
                                    }
                                    
                                    // YouTube video ID'sini çıkar
                                    const videoIdMatch = imgSrc?.match(/\/vi\/([^\/]+)\//);
                                    if (!videoIdMatch) {
                                        setImgSrc('https://placehold.co/400x400/1a1a1a/666?text=♪');
                                        return;
                                    }
                                    
                                    const videoId = videoIdMatch[1];
                                    
                                    if (imgSrc && imgSrc.includes('hqdefault')) {
                                        setImgSrc(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
                                    } else if (imgSrc && imgSrc.includes('mqdefault')) {
                                        setImgSrc(`https://i.ytimg.com/vi/${videoId}/default.jpg`);
                                    } else if (imgSrc && imgSrc.includes('default.jpg')) {
                                        setImgSrc('https://placehold.co/400x400/1a1a1a/666?text=♪');
                                    } else {
                                        setImgSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <ListMusic className="w-32 h-32 text-gray-600" />
                            </div>
                        )}
                    </div>

                    {/* Song Info & Main Controls */}
                    <div className="w-full max-w-[600px] space-y-4 lg:space-y-3 pb-2">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                                <h1 className="text-2xl lg:text-2xl font-bold line-clamp-2">{currentSong.title}</h1>
                                <p className="text-lg lg:text-lg text-white/60 truncate">
                                  {(() => {
                                    const names = splitArtistNames(currentSong.artist);
                                    const list = names.length ? names : [currentSong.artist];
                                    return list.map((n, idx) => (
                                      <span key={`${n}-${idx}`}>
                                        <ArtistHoverCard
                                          name={n}
                                          className="inline cursor-pointer underline-offset-4 hover:underline"
                                        >
                                          {n}
                                        </ArtistHoverCard>
                                        {idx < list.length - 1 ? <span className="text-white/40">, </span> : null}
                                      </span>
                                    ));
                                  })()}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleFavorite}
                                className={cn("hover:bg-transparent transform transition-transform hover:scale-110 flex-shrink-0", isFavorite && "text-green-500")}
                            >
                                <Heart className={cn("h-7 w-7", isFavorite && "fill-current")} />
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <Slider
                                value={[progress]}
                                max={duration || 100}
                                step={1}
                                onValueChange={onSeek}
                                className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&>span:first-child>span]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-white/50">{formatTime(progress)}</span>
                                <span className="text-sm font-medium text-white/50">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center justify-between px-0 sm:px-4 pt-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleShuffle}
                                className={cn("text-white/60 hover:text-white hover:bg-transparent", isShuffling && "text-green-500")}
                            >
                                <Shuffle className="h-6 w-6" />
                            </Button>

                            <div className="flex items-center gap-6 sm:gap-8">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onPrevious}
                                    className="text-white hover:text-white/80 hover:bg-transparent"
                                >
                                    <SkipBack className="h-10 w-10 sm:h-10 sm:w-10 fill-current" />
                                </Button>

                                <Button
                                    onClick={onPlayPause}
                                    className="h-20 w-20 sm:h-20 sm:w-20 rounded-full bg-white text-black hover:scale-105 transition-transform flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                >
                                    {isPlaying ? <Pause className="h-10 w-10 sm:h-10 sm:w-10 fill-current" /> : <Play className="h-10 w-10 sm:h-10 sm:w-10 fill-current ml-1" />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onNext}
                                    className="text-white hover:text-white/80 hover:bg-transparent"
                                >
                                    <SkipForward className="h-10 w-10 sm:h-10 sm:w-10 fill-current" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onToggleRepeat}
                                    className={cn("text-white/60 hover:text-white hover:bg-transparent relative", repeatMode !== 'off' && "text-green-500")}
                                >
                                    <Repeat className="h-6 w-6" />
                                    {repeatMode === 'one' && <span className="absolute text-[10px] font-bold -bottom-1 right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span>}
                                </Button>

                                {/* Volume Control - PC için */}
                                <div className="hidden lg:flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onVolumeChange(volume > 0 ? [0] : [50])}
                                        className="text-white/60 hover:text-white hover:bg-transparent"
                                    >
                                        {volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                                    </Button>
                                    <Slider
                                        value={[volume]}
                                        onValueChange={onVolumeChange}
                                        max={100}
                                        step={1}
                                        className="w-24 [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&>span:first-child>span]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Tabs (Queue, Lyrics, Related) - Re-designed */}
                <div className="hidden lg:flex flex-1 h-full w-full lg:max-w-[450px] xl:max-w-[500px] flex-col bg-[#121212] rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                    <Tabs defaultValue="queue" className="h-full flex flex-col">
                        <div className="px-4 lg:px-6 pt-4 lg:pt-6 bg-[#121212] z-10">
                            <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none p-0 h-auto gap-4 lg:gap-8 mb-4">
                                <TabsTrigger
                                    value="queue"
                                    className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-white/50 data-[state=active]:text-white uppercase text-[10px] lg:text-xs font-bold tracking-wider border-b-2 border-transparent data-[state=active]:border-white rounded-none px-0 pb-3 transition-all"
                                >
                                    SIRADAKİ
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="queue" className="flex-1 overflow-hidden p-0 m-0 relative">
                            <ScrollArea className="h-full bg-[#121212]" ref={scrollRef}>
                                <div className="flex flex-col pb-4">
                                    {/* Song List - Header kaldırıldı */}
                                    <div className="px-2 lg:px-3 space-y-1 pb-4 pt-2">
                                        {queue.map((song, index) => {
                                            if (index <= currentIndex) return null;

                                            return (
                                                <div
                                                    key={`${song.id}-${index}`}
                                                    className="group flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/8 transition-all duration-200 border-l-2 border-transparent hover:border-l-white/20"
                                                    onClick={() => onPlayQueueItem(index)}
                                                >
                                                    {/* Index Badge */}
                                                    <div className="w-6 text-center flex-shrink-0">
                                                        <span className="text-[10px] font-medium text-white/40 group-hover:hidden">{index + 1}</span>
                                                        <Play className="h-3 w-3 text-white hidden group-hover:block mx-auto" />
                                                    </div>

                                                    {/* Album Art */}
                                                    <div className="relative w-10 h-10 rounded-sm overflow-hidden shrink-0 bg-white/5">
                                                        {song.imageUrl && (
                                                            <Image 
                                                                src={getQueueImageSrc(song)} 
                                                                alt={song.title} 
                                                                fill 
                                                                className="object-cover"
                                                                loading="lazy"
                                                                onError={() => handleQueueImageError(song.id, getQueueImageSrc(song), song.artist)}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Song Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-white truncate group-hover:text-green-400 transition-colors">{song.title}</div>
                                                        <div className="text-xs text-white/50 truncate mt-0.5">{song.artist}</div>
                                                    </div>

                                                    {/* Duration */}
                                                    <div className="text-xs text-white/40 tabular-nums flex-shrink-0">
                                                        {song.duration}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Mock / Recommended Songs to make the list look full */}
                                        {(
                                            <>
                                                {queue.slice(currentIndex + 1).length < 3 && (
                                                    <div className="px-2 py-4 mt-2 mb-1 border-t border-white/5">
                                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Sizin İçin Önerilenler</p>
                                                    </div>
                                                )}
                                                {[
                                                    { id: 'm1', title: 'Aşkın Olayım', artist: 'Simge', duration: '4:11', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273b538e12d4df558c407c6f014' },
                                                    { id: 'm2', title: 'Antidepresan', artist: 'Mabel Matiz', duration: '3:50', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273747bea340156972e255ce728' },
                                                    { id: 'm3', title: 'Bi Tek Ben Anlarım', artist: 'KÖFN', duration: '3:12', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273d2ef937a091f043126f5d88f' },
                                                    { id: 'm4', title: 'Yana Yana', artist: 'Semicenk & Reynmen', duration: '3:03', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27301c4c1a5332cf5e08b1a5113' },
                                                    { id: 'm5', title: 'Kusura Bakma', artist: 'Tuğkan', duration: '3:34', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273e86c0780283c48be3851025a' },
                                                    { id: 'm6', title: 'Mockingbird', artist: 'Eminem', duration: '4:11', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2736ca5c90113b30c3c43ffb8f4' },
                                                    { id: 'm7', title: 'Starboy', artist: 'The Weeknd', duration: '3:50', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2734718e28d2492771c1db881c8' },
                                                    { id: 'm8', title: 'Another Love', artist: 'Tom Odell', duration: '4:04', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2731917a0f3f41366e0ebd447a2' },
                                                ].slice(0, Math.max(0, 10 - queue.slice(currentIndex + 1).length)).map((song, i) => (
                                                    <div
                                                        key={`mock-${i}`}
                                                        className="group flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/8 transition-all duration-200 border-l-2 border-transparent hover:border-l-white/20 opacity-50 hover:opacity-100"
                                                    >
                                                        <div className="w-6 text-center flex-shrink-0">
                                                            <div className="w-1 h-1 bg-white/20 rounded-full mx-auto group-hover:hidden" />
                                                            <Play className="h-3 w-3 text-white hidden group-hover:block mx-auto" />
                                                        </div>

                                                        <div className="relative w-10 h-10 rounded-sm overflow-hidden shrink-0 bg-white/5 grayscale group-hover:grayscale-0 transition-all">
                                                            {song.imageUrl && (
                                                                <Image 
                                                                    src={getQueueImageSrc(song as Song)} 
                                                                    alt={song.title} 
                                                                    fill 
                                                                    className="object-cover"
                                                                    loading="lazy"
                                                                    onError={() => handleQueueImageError(song.id, getQueueImageSrc(song as Song), song.artist)}
                                                                />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm text-white truncate">{song.title}</div>
                                                            <div className="text-xs text-white/40 truncate mt-0.5">{song.artist}</div>
                                                        </div>

                                                        <div className="text-xs text-white/30 tabular-nums flex-shrink-0">
                                                            {song.duration}
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
