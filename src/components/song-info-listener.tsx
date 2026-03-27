'use client';

import { useState, useEffect } from 'react';
import { Song } from '@/lib/data';
import { SongInfoModal } from './song-info-modal';

export function SongInfoListener() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleShowSongInfo = (event: any) => {
      const song = event.detail;
      setSelectedSong(song);
      setIsModalOpen(true);
    };

    window.addEventListener('showSongInfo', handleShowSongInfo);
    
    return () => {
      window.removeEventListener('showSongInfo', handleShowSongInfo);
    };
  }, []);

  return (
    <SongInfoModal
      song={selectedSong}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setSelectedSong(null);
      }}
    />
  );
}