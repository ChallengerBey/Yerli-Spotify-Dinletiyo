
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, SkipForward, Repeat, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Song, Playlist } from "@/lib/data";


interface SongCardProps {
  item: Song | Playlist;
  className?: string;
}

export function SongCard({ item, className }: SongCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const isPlaylist = 'songs' in item;



  const title = item.title;
  const imageUrl = item.imageUrl;
  const description = isPlaylist ? (item as Playlist).description : (item as Song).artist;

  const songToPlay = isPlaylist ? (item as Playlist).songs?.[0] : (item as Song);
  const href = isPlaylist ? `/home/playlist/${item.id}` : '#';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click/navigation event
    e.preventDefault();
    if (songToPlay && songToPlay.audioUrl) {
      window.dispatchEvent(new CustomEvent('playSong', { detail: songToPlay }));
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
    // Bu özellik için daha sonra bir modal veya başka bir arayüz eklenebilir
    alert('Çalma listesine ekle özelliği yakında eklenecek!');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Şarkı paylaşımı için daha sonra sosyal medya entegrasyonu eklenebilir
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
        className={cn("group w-full overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/60 transition-colors relative rounded-lg cursor-pointer", className)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenuPos({ x: e.clientX, y: e.clientY });
          setShowContextMenu(true);
          console.log('Custom menu açıldı!');
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
            <Image src={imageUrl} alt={title} fill className="object-cover rounded-t-lg" />
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

      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed z-50 bg-background border rounded-md shadow-lg py-1 min-w-[150px]"
            style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          >
            <button
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayNext(e);
                setShowContextMenu(false);
              }}
            >
              <SkipForward className="h-4 w-4" />
              Sonraki Şarkı
            </button>
            <button
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToPlaylist(e);
                setShowContextMenu(false);
              }}
            >
              <ListMusic className="h-4 w-4" />
              Playliste Ekle
            </button>
          </div>
        </>
      )}
    </>
  );
}
