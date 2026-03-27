
import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2, ListMusic, MonitorSpeaker, Heart } from 'lucide-react';

const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(34);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-zinc-900 h-24 px-4 flex items-center justify-between z-50">
      {/* Current Song Info */}
      <div className="flex items-center w-1/4 min-w-[180px]">
        <img 
          src="https://picsum.photos/seed/current/100/100" 
          alt="Current song" 
          className="w-14 h-14 rounded-md shadow-lg mr-4"
        />
        <div className="flex-1 truncate">
          <h5 className="text-sm font-bold hover:underline cursor-pointer truncate">Midnight City</h5>
          <p className="text-xs text-zinc-400 hover:underline cursor-pointer truncate">Neon Dreams</p>
        </div>
        <button className="ml-4 text-zinc-400 hover:text-green-500 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center max-w-[40%] w-full">
        <div className="flex items-center space-x-6 mb-2">
          <button className="text-zinc-500 hover:text-white transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="text-zinc-300 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}
          </button>
          <button className="text-zinc-300 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-zinc-500 hover:text-white transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center w-full space-x-3">
          <span className="text-[10px] text-zinc-500 font-mono w-8 text-right">0:45</span>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full relative group cursor-pointer overflow-hidden">
            <div 
              className="absolute h-full bg-white rounded-full group-hover:bg-green-500" 
              style={{ width: `${progress}%` }} 
            />
            {/* Scrubber Knob */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono w-8">3:24</span>
        </div>
      </div>

      {/* Additional Tools */}
      <div className="flex items-center justify-end w-1/4 min-w-[180px] space-x-3">
        <button className="text-zinc-400 hover:text-white">
          <Mic2 className="w-4 h-4" />
        </button>
        <button className="text-zinc-400 hover:text-white">
          <ListMusic className="w-4 h-4" />
        </button>
        <button className="text-zinc-400 hover:text-white">
          <MonitorSpeaker className="w-4 h-4" />
        </button>
        <div className="flex items-center space-x-2 w-24">
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <div className="flex-1 h-1 bg-zinc-800 rounded-full relative">
            <div className="absolute h-full w-[70%] bg-zinc-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
