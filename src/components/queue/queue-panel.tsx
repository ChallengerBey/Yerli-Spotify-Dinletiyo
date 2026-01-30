"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Play, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  song_id: string;
  song_data: {
    title: string;
    artist: string;
    thumbnail?: string;
    duration?: string;
  };
  position: number;
  is_playing: boolean;
}

interface QueuePanelProps {
  onSongSelect?: (songId: string, songData: any) => void;
}

export function QueuePanel({ onSongSelect }: QueuePanelProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await fetch("/api/queue");
      const data = await response.json();
      if (data.queue) {
        setQueue(data.queue);
      }
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromQueue = async (queueId: string) => {
    try {
      await fetch(`/api/queue?id=${queueId}`, {
        method: "DELETE",
      });
      setQueue((prev) => prev.filter((item) => item.id !== queueId));
      toast.success("Şarkı kuyruktan kaldırıldı");
    } catch (error) {
      toast.error("Kuyruktan kaldırma başarısız");
    }
  };

  const clearQueue = async () => {
    try {
      await fetch("/api/queue", {
        method: "DELETE",
      });
      setQueue([]);
      toast.success("Kuyruk temizlendi");
    } catch (error) {
      toast.error("Kuyruk temizleme başarısız");
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = queue.findIndex((item) => item.id === draggedItem);
    const targetIndex = queue.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newQueue = [...queue];
    const [removed] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(targetIndex, 0, removed);

    setQueue(newQueue.map((item, index) => ({ ...item, position: index })));
  };

  const handleDragEnd = async () => {
    if (draggedItem) {
      try {
        await fetch("/api/queue", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queue }),
        });
      } catch (error) {
        console.error("Failed to update queue order:", error);
      }
    }
    setDraggedItem(null);
  };

  const playSong = (item: QueueItem) => {
    if (onSongSelect) {
      onSongSelect(item.song_id, item.song_data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Kuyruk</h2>
        {queue.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearQueue}
            className="text-xs"
          >
            Tümünü Temizle
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {queue.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">
              Kuyrukta şarkı yok
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {queue.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${
                  draggedItem === item.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>

                {item.song_data.thumbnail && (
                  <img
                    src={item.song_data.thumbnail}
                    alt={item.song_data.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.song_data.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.song_data.artist}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => playSong(item)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFromQueue(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {item.song_data.duration && (
                  <span className="text-xs text-muted-foreground">
                    {item.song_data.duration}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
