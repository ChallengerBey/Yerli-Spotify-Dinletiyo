
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, SkipForward, Repeat, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Song, Playlist } from "@/lib/data";
import SongContextMenu from "./song-context-menu";


interface SongCardProps {
  item: Song | Playlist;
  className?: string;
  startRadio?: boolean;
}

export function SongCard({ item, className, startRadio = false }: SongCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const isPlaylist = 'songs' in item;

  // Context menu'yu kapatmak için click listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showContextMenu) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [showContextMenu]);

  const title = item.title;
  const imageUrl = item.imageUrl;
  const description = isPlaylist ? (item as Playlist).description : (item as Song).artist;

  const songToPlay = isPlaylist ? (item as Playlist).songs?.[0] : (item as Song);
  const href = isPlaylist ? `/home/playlist/${item.id}` : '#';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (songToPlay && songToPlay.audioUrl) {
      if (startRadio && !isPlaylist) {
        window.dispatchEvent(new CustomEvent('startRadio', { detail: songToPlay }));
      } else {
        window.dispatchEvent(new CustomEvent('playSong', { detail: songToPlay }));
      }
    }
  };

  const handleAddToQueue = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (songToPlay && songToPlay.audioUrl) {
      try {
        const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            await fetch('/api/user-data/queue', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userData.id,
                song: songToPlay,
                playNext: false
              }),
            });
          } catch (e) {
            console.error('User data parse error in SongCard:', e);
          }
        }
      } catch (error) {
        console.error('Kuyruğa ekleme hatası:', error);
      }
    }
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    alert('Çalma listesine ekle özelliği yakında eklenecek!');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    alert('Şarkı paylaşımı özelliği yakında eklenecek!');
  };

  const handlePlayNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (songToPlay && songToPlay.audioUrl) {
      window.dispatchEvent(new CustomEvent('playNext', { detail: songToPlay }));
    }
  };

  const handleRepeatSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (songToPlay && songToPlay.audioUrl) {
      window.dispatchEvent(new CustomEvent('repeatSong', { detail: songToPlay }));
    }
  };

  return (
    <>
      <div
        className={cn("song-card-container group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg cursor-pointer", className)}
        data-song-card="true"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (songToPlay) {
            setContextMenuPos({ x: e.clientX, y: e.clientY });
            setShowContextMenu(true);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowContextMenu(false);
          if (!isPlaylist) {
            handlePlay(e);
          }
        }}
      >
        <div className="p-0">
          <div className="relative aspect-square">
            {imageUrl ? (
              <Image src={imageUrl} alt={title} fill className="object-cover rounded-t-lg" />
            ) : (
              <div className="w-full h-full bg-gray-300 rounded-t-lg flex items-center justify-center">
                <ListMusic className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-2 right-2">
              {songToPlay && (
                <Button
                  size="icon"
                  className="rounded-full w-12 h-12 bg-primary shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(e);
                  }}
                  aria-label={`Play ${songToPlay.title}`}
                >
                  <Play className="h-6 w-6 ml-1 fill-primary-foreground text-primary-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-base font-semibold truncate">{title}</p>
          <p className="text-sm truncate text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Yeni Gelişmiş Context Menu */}
      {showContextMenu && songToPlay && (
        <SongContextMenu
          song={songToPlay}
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </>
  );
}
