import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';

interface MiniPlayerProps {
  currentSong: {
    id: string;
    title: string;
    artist: string;
    cover: string;
    bpm: number;
    youtubeId?: string;
  };
  isPlaying: boolean;
  setIsPlaying: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ currentSong, isPlaying, setIsPlaying, onNext, onPrev }) => {
  
  const triggerHaptic = (intensity: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(intensity);
  };

  const handlePlayPause = () => {
    triggerHaptic(15);
    setIsPlaying();
  };

  return (
    <div className="flex items-center space-x-5 bg-white/[0.03] backdrop-blur-2xl px-5 py-3 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 hover:bg-white/[0.05] hover:border-white/20">
      
      {/* Mini Thumbnail */}
      <div className={`relative w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0 transition-transform duration-500 ${isPlaying ? 'scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'scale-100 grayscale-[0.5]'}`}>
        <img 
          src={currentSong.cover} 
          alt={currentSong.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback images for failed thumbnails
            const target = e.target as HTMLImageElement;
            const fallbacks = [
              'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=800'
            ];
            
            if (!target.src.includes('unsplash')) {
              target.src = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            }
          }}
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col min-w-[140px] max-w-[180px]">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white/90 truncate">{currentSong.title}</span>
          {isPlaying && (
            <div className="flex items-end space-x-0.5 h-2.5 mb-0.5">
              <div 
                className="w-0.5 bg-white animate-[bounce_0.6s_infinite_alternate]" 
                style={{ animationDuration: `${60 / currentSong.bpm * 0.8}s` }}
              />
              <div 
                className="w-0.5 bg-white animate-[bounce_0.8s_infinite_alternate]" 
                style={{ animationDuration: `${60 / currentSong.bpm * 1.2}s` }}
              />
              <div 
                className="w-0.5 bg-white animate-[bounce_0.5s_infinite_alternate]" 
                style={{ animationDuration: `${60 / currentSong.bpm * 0.9}s` }}
              />
            </div>
          )}
        </div>
        <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase mt-0.5 truncate">{currentSong.artist}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3 border-l border-white/5 pl-5">
        <button 
          onClick={() => { onPrev(); triggerHaptic(5); }}
          className="p-1.5 text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>
        
        <button 
          onClick={handlePlayPause}
          className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
        </button>

        <button 
          onClick={() => { onNext(); triggerHaptic(5); }}
          className="p-1.5 text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Like Button */}
      <button 
        onClick={() => triggerHaptic(20)}
        className="text-zinc-600 hover:text-red-500 transition-colors ml-1 active:scale-125"
      >
        <Heart className="w-4 h-4" />
      </button>
      
      <style>{`
        @keyframes bounce {
          from { height: 2px; transform: scaleY(1); }
          to { height: 10px; transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
};

export default MiniPlayer;