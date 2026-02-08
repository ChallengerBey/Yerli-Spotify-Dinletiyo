"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
    Heart, MoreHorizontal, ChevronDown, ListMusic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Song } from "@/lib/data";
import { getBestAlbumArt } from "@/lib/spotify-api";

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
    onPlayQueueItem
}: FullScreenPlayerProps) {
    const [gradientColor, setGradientColor] = useState("from-purple-900/50 to-black");
    const [imgSrc, setImgSrc] = useState(currentSong.imageUrl);
    const [isLoadingSpotifyArt, setIsLoadingSpotifyArt] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Format time (seconds -> mm:ss)
    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Update image source when song changes - Spotify'dan gerçek albüm kapağı çek
    useEffect(() => {
        let isMounted = true;

        const loadAlbumArt = async () => {
            // Önce mevcut görseli göster
            setImgSrc(currentSong.imageUrl);
            setIsLoadingSpotifyArt(true);

            try {
                // Spotify'dan daha iyi bir görsel bulmaya çalış
                const bestArt = await getBestAlbumArt(
                    currentSong.imageUrl,
                    currentSong.artist,
                    currentSong.title
                );

                // Component hala mount edilmişse görseli güncelle
                if (isMounted && bestArt !== currentSong.imageUrl) {
                    console.log(`🎨 Albüm kapağı güncellendi: ${currentSong.title}`);
                    setImgSrc(bestArt);
                }
            } catch (error) {
                console.error('Albüm kapağı yükleme hatası:', error);
            } finally {
                if (isMounted) {
                    setIsLoadingSpotifyArt(false);
                }
            }
        };

        loadAlbumArt();

        // Cleanup function
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
            "fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-3xl text-white transition-all duration-500 ease-in-out",
            "animate-in fade-in slide-in-from-bottom-10"
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
            <header className="flex items-center justify-between px-6 py-4 lg:py-6">
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
            <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between px-6 lg:px-16 gap-8 lg:gap-16 pb-8 overflow-hidden">

                {/* Left Side: Album Art & Controls */}
                <div className="w-full lg:w-[60%] flex flex-col justify-center items-center lg:items-center gap-6 h-full max-h-[90vh]">
                    {/* Album Art - Küçültüldü */}
                    <div className="relative w-full max-w-[400px] aspect-square shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        {currentSong.imageUrl ? (
                            <Image
                                src={imgSrc || currentSong.imageUrl}
                                alt={currentSong.title}
                                fill
                                className="object-cover"
                                priority
                                quality={100}
                                sizes="400px"
                                onError={() => {
                                    if (imgSrc && imgSrc.includes('maxresdefault')) {
                                        setImgSrc(imgSrc.replace('maxresdefault', 'hqdefault'));
                                    } else if (imgSrc && imgSrc.includes('hqdefault')) {
                                        setImgSrc(imgSrc.replace('hqdefault', 'mqdefault'));
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
                    <div className="w-full max-w-[600px] space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-1">
                                <h1 className="text-xl lg:text-2xl font-bold line-clamp-2">{currentSong.title}</h1>
                                <p className="text-base lg:text-lg text-white/60 truncate">{currentSong.artist}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleFavorite}
                                className={cn("hover:bg-transparent transform transition-transform hover:scale-110 flex-shrink-0", isFavorite && "text-green-500")}
                            >
                                <Heart className={cn("h-6 w-6", isFavorite && "fill-current")} />
                            </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <Slider
                                value={[progress]}
                                max={duration || 100}
                                step={1}
                                onValueChange={onSeek}
                                className="cursor-pointer [&>span:first-child]:bg-white/30 [&>span:first-child>span]:bg-red-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-white/50">{formatTime(progress)}</span>
                                <span className="text-xs font-medium text-white/50">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center justify-between px-4 pt-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleShuffle}
                                className={cn("text-white/60 hover:text-white hover:bg-transparent", isShuffling && "text-green-500")}
                            >
                                <Shuffle className="h-6 w-6" />
                            </Button>

                            <div className="flex items-center gap-8">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onPrevious}
                                    className="text-white hover:text-white/80 hover:bg-transparent"
                                >
                                    <SkipBack className="h-10 w-10 fill-current" />
                                </Button>

                                <Button
                                    onClick={onPlayPause}
                                    className="h-20 w-20 rounded-full bg-white text-black hover:scale-105 transition-transform flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                >
                                    {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onNext}
                                    className="text-white hover:text-white/80 hover:bg-transparent"
                                >
                                    <SkipForward className="h-10 w-10 fill-current" />
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleRepeat}
                                className={cn("text-white/60 hover:text-white hover:bg-transparent", repeatMode !== 'off' && "text-green-500")}
                            >
                                <Repeat className="h-6 w-6" />
                                {repeatMode === 'one' && <span className="absolute text-[8px] font-bold top-2 right-2">1</span>}
                            </Button>

                            {/* Volume Control - Sağ tarafta */}
                            <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onVolumeChange([volume === 0 ? 50 : 0])}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    {volume === 0 ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                        </svg>
                                    ) : volume < 50 ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                        </svg>
                                    )}
                                </button>
                                <div className="w-20">
                                    <Slider
                                        value={[volume]}
                                        max={100}
                                        step={1}
                                        onValueChange={onVolumeChange}
                                        className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/25 [&>span:first-child>span]:bg-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5"
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
                                                            <Image src={song.imageUrl} alt={song.title} fill className="object-cover" />
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
                                                            {song.imageUrl && <Image src={song.imageUrl} alt={song.title} fill className="object-cover" />}
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
