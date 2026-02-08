"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Music2, Loader2 } from "lucide-react";

interface LyricsViewerProps {
  songId?: string;
  songTitle: string;
  artist: string;
}

export function LyricsViewer({ songId, songTitle, artist }: LyricsViewerProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLyrics();
  }, [songId, songTitle, artist]);

  const fetchLyrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (songId) params.append('song_id', songId);
      params.append('title', songTitle);
      params.append('artist', artist);

      const response = await fetch(`/api/lyrics?${params}`);
      const data = await response.json();

      if (response.ok && data.lyrics) {
        setLyrics(data.lyrics.lyrics_text);
      } else {
        setError(data.error || 'Şarkı sözleri bulunamadı');
      }
    } catch (err) {
      setError('Şarkı sözleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music2 className="h-5 w-5" />
          Şarkı Sözleri
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {songTitle} - {artist}
        </p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12 space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchLyrics} variant="outline" size="sm">
              Tekrar Dene
            </Button>
          </div>
        )}

        {lyrics && !loading && (
          <ScrollArea className="h-[400px]">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {lyrics}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
