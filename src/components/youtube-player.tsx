"use client";

import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  volume: number;
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
  isDataSaver?: boolean;
}

export function YouTubePlayer({ videoId, isPlaying, volume, onReady, onStateChange, isDataSaver }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleReady = (event: any) => {
    if (isDataSaver) {
      event.target.setPlaybackQuality('small');
    }
    onReady(event);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '-1000px',
        left: '0',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1
      }}
    >
      <YouTube
        key={videoId}
        videoId={videoId}
        opts={{
          height: '1',
          width: '1',
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : ''
          }
        }}
        onReady={handleReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}