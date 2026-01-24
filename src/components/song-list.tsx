
'use client';

import { Song } from "@/lib/data";
import { Clock, Play, SkipForward, Repeat } from "lucide-react";
import { Button } from "./ui/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface SongListProps {
    songs: Song[];
}

export function SongList({ songs }: SongListProps) {

    const handlePlay = (songToPlay: Song) => {
        if (songToPlay && songToPlay.audioUrl) {
          window.dispatchEvent(new CustomEvent('playSong', { detail: songToPlay }));
        }
    };
    
    const handlePlayNext = (songToPlay: Song) => {
        if (songToPlay && songToPlay.audioUrl) {
          window.dispatchEvent(new CustomEvent('playNext', { detail: songToPlay }));
        }
    };
    
    const handleRepeatSong = (songToPlay: Song) => {
        if (songToPlay && songToPlay.audioUrl) {
          window.dispatchEvent(new CustomEvent('repeatSong', { detail: songToPlay }));
        }
    };

    return (
        <div>
            <div className="grid grid-cols-[auto,1fr,auto,auto] gap-x-4 items-center px-4 py-2 border-b border-border text-sm text-muted-foreground font-semibold">
                <div className="text-right">#</div>
                <div>Başlık</div>
                <div>Albüm</div>
                <div className="text-right"><Clock className="w-4 h-4 inline-block"/></div>
            </div>
            <div className="space-y-1 mt-2">
                {songs.map((song, index) => (
                    <ContextMenu key={song.id}>
                        <ContextMenuTrigger>
                            <div className="group grid grid-cols-[auto,1fr,auto,auto] gap-x-4 items-center px-4 py-2 rounded-md hover:bg-secondary/50 transition-colors">
                                <div className="relative w-6 text-right text-muted-foreground">
                                    <span className="group-hover:hidden">{index + 1}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 hidden group-hover:flex items-center justify-center"
                                        onClick={() => handlePlay(song)}
                                    >
                                        <Play className="w-4 h-4 fill-foreground"/>
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Resim eklenebilir
                                    <Image src={song.imageUrl} alt={song.title} width={40} height={40} className="rounded" />
                                    */}
                                    <div>
                                        <p className="font-semibold text-foreground">{song.title}</p>
                                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                                    </div>
                                </div>
                                <div className="text-muted-foreground truncate">{song.album}</div>
                                <div className="text-right text-muted-foreground">{song.duration}</div>
                            </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onClick={() => handlePlay(song)}>
                                <Play className="mr-2 h-4 w-4" />
                                <span>Çal</span>
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handlePlayNext(song)}>
                                <SkipForward className="mr-2 h-4 w-4" />
                                <span>Sonraki Çal</span>
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => handleRepeatSong(song)}>
                                <Repeat className="mr-2 h-4 w-4" />
                                <span>Şarkıyı Tekrarla</span>
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                ))}
            </div>
        </div>
    );
}
