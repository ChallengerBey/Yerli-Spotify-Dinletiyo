import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Song } from '../lib/api';

interface MiniPlayerProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-md border-t border-white/10 px-4 py-4 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <img 
          src={song.cover} 
          alt={song.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{song.title}</h3>
          <p className="text-xs text-white/60 truncate">{song.artist}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 w-full bg-white/10 rounded-full h-1">
        <div className="bg-white h-1 rounded-full w-1/3" />
      </div>
    </div>
  );
};

export default MiniPlayer;
