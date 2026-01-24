'use client';

import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdCarouselProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  autoPlay?: boolean;
  showControls?: boolean;
  showDots?: boolean;
}

export function AdCarousel({ 
  className, 
  variant = 'horizontal'
}: AdCarouselProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = 'dQw4w9WgXcQ';
  const songTitle = 'Örnek Şarkı';
  const artist = 'Örnek Sanatçı';
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl group",
        variant === 'horizontal' ? 'h-32' : 'h-48',
        className
      )}
    >
      {/* Arkada ses çalsın - eğer isPlaying true ise */}
      {isPlaying && (
        <iframe
          className="hidden"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&mute=0&loop=1&playlist=${videoId}`}
          title={`${artist} - ${songTitle}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      {/* Görünen kısım */}
      <div className="flex items-center h-full gap-4 p-4">
        {/* Şarkı Fotoğrafı */}
        <div className="relative flex-shrink-0 h-full aspect-square rounded-lg overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={songTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Şarkı Bilgileri */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          <h3 className="text-white font-bold text-sm line-clamp-2">
            {songTitle}
          </h3>
          <p className="text-gray-400 text-xs">
            {artist}
          </p>
        </div>

        {/* Play/Stop Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex-shrink-0 bg-red-600 hover:bg-red-700 rounded-full p-3 group-hover:scale-110 transition-transform"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white fill-white" />
          ) : (
            <Play className="h-5 w-5 text-white fill-white" />
          )}
        </button>
      </div>
    </div>
  );
}
