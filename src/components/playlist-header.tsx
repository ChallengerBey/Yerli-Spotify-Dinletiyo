
import { Playlist } from "@/lib/data";
import Image from "next/image";
import { Clock, Users } from "lucide-react";

interface PlaylistHeaderProps {
  playlist: Playlist;
}

export function PlaylistHeader({ playlist }: PlaylistHeaderProps) {
    const totalDurationMinutes = Math.floor(
        playlist.songs.reduce((acc, song) => {
            const [minutes, seconds] = song.duration.split(':').map(Number);
            return acc + (minutes * 60 + seconds);
        }, 0) / 60
    );

  return (
    <header className="flex flex-col md:flex-row items-center md:items-end gap-6">
      <div className="w-48 h-48 md:w-56 md:h-56 relative flex-shrink-0">
        <Image
          src={playlist.imageUrl}
          alt={playlist.title}
          fill
          className="object-cover rounded-lg shadow-2xl"
          data-ai-hint={playlist.aiHint}
        />
      </div>
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Çalma Listesi</p>
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter mt-2 mb-4">
          {playlist.title}
        </h1>
        <p className="text-muted-foreground max-w-lg mb-4">
          {playlist.description}
        </p>
        <div className="flex items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{playlist.songs.length} şarkı,</span>
            </div>
            <div className="flex items-center gap-1">
                 <Clock className="w-4 h-4" />
                <span>yaklaşık {totalDurationMinutes} dk.</span>
            </div>
        </div>
      </div>
    </header>
  );
}
