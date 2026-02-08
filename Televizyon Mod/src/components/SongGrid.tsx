import React from 'react';
import SongCard from './SongCard';
import { Song } from '../lib/api';

interface SongGridProps {
  songs: Song[];
  onPlay?: (song: Song) => void;
  onFavorite?: (song: Song) => void;
  favorites?: string[];
  isLoading?: boolean;
}

const SongGrid: React.FC<SongGridProps> = ({
  songs,
  onPlay,
  onFavorite,
  favorites = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">No songs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          onPlay={onPlay}
          onFavorite={onFavorite}
          isFavorite={favorites.includes(song.id)}
        />
      ))}
    </div>
  );
};

export default SongGrid;
