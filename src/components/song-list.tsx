
'use client';

import { useState } from "react";
import { Song } from "@/lib/data";
import { Clock, Play, SkipForward, Repeat } from "lucide-react";
import { Button } from "./ui/button";
import SongContextMenu from "./song-context-menu";
import { ArtistHoverCard } from "@/components/artist-hover-card";
import { splitArtistNames } from "@/lib/artist-names";

interface SongListProps {
    songs: Song[];
}

export function SongList({ songs }: SongListProps) {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);

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
                    <div 
                        key={song.id}
                        className="group grid grid-cols-[auto,1fr,auto,auto] gap-x-4 items-center px-4 py-2 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedSong(song);
                            setContextMenuPos({ x: e.clientX, y: e.clientY });
                            setShowContextMenu(true);
                        }}
                        onClick={() => handlePlay(song)}
                    >
                        <div className="relative w-6 text-right text-muted-foreground">
                            <span className="group-hover:hidden">{index + 1}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 hidden group-hover:flex items-center justify-center"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlay(song);
                                }}
                            >
                                <Play className="w-4 h-4 fill-foreground"/>
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-semibold text-foreground">{song.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(() => {
                                    const names = splitArtistNames(song.artist);
                                    const list = names.length ? names : [song.artist];
                                    return list.map((n, idx) => (
                                      <span key={`${song.id}-artist-${n}-${idx}`}>
                                        <ArtistHoverCard name={n}>{n}</ArtistHoverCard>
                                        {idx < list.length - 1 ? ", " : null}
                                      </span>
                                    ));
                                  })()}
                                </p>
                            </div>
                        </div>
                        <div className="text-muted-foreground truncate">{song.album}</div>
                        <div className="text-right text-muted-foreground">{song.duration}</div>
                    </div>
                ))}
            </div>

            {/* Gelişmiş Context Menu */}
            {showContextMenu && selectedSong && (
                <SongContextMenu
                    song={selectedSong}
                    x={contextMenuPos.x}
                    y={contextMenuPos.y}
                    onClose={() => {
                        setShowContextMenu(false);
                        setSelectedSong(null);
                    }}
                />
            )}
        </div>
    );
}
