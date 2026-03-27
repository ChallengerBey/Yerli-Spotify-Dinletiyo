import React from 'react';
import { Play, Heart } from 'lucide-react';
import { Song } from '../lib/api';

interface SongCardProps {
  song: Song;
  onPlay?: (song: Song) => void;
  onFavorite?: (song: Song) => void;
  isFavorite?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  onPlay, 
  onFavorite, 
  isFavorite = false 
}) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
      <div className="aspect-square overflow-hidden">
        <img 
          src={song.cover} 
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onPlay?.(song)}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
        >
          <Play className="w-6 h-6 fill-white" />
        </button>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onFavorite?.(song)}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
        >
          <Heart 
            className="w-4 h-4" 
            fill={isFavorite ? 'currentColor' : 'none'}
            color={isFavorite ? '#ef4444' : 'currentColor'}
          />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <h3 className="font-semibold text-sm truncate">{song.title}</h3>
        <p className="text-xs text-white/60 truncate">{song.artist}</p>
      </div>
    </div>
  );
};

export default SongCard;
