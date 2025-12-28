'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaPlay, FaPause } from 'react-icons/fa';

interface Track {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  artist: string;
  audioUrl: string;
  duration: number;
  genre: string;
  position: number;
}

export default function AudiusTrending() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchTrendingTracks = async () => {
      try {
        const response = await fetch('/api/audius/trending');
        const data = await response.json();
        
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
        } else {
          setError('Şu anda popüler şarkılar yüklenemedi.');
        }
      } catch (err) {
        console.error('Şarkılar yüklenirken hata oluştu:', err);
        setError('Şarkılar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTracks();
  }, []);

  const togglePlay = (trackId: string, audioUrl: string) => {
    if (nowPlaying === trackId) {
      // Eğer aynı şarkıyı durduruyorsak
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setNowPlaying(null);
    } else {
      // Yeni bir şarkı çalıyorsak
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error('Ses çalınamadı:', err);
        setError('Bu şarkı şu anda çalınamıyor.');
      });
      
      // Önceki sesi durdur
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Yeni ses referansını kaydet
      audioRef.current = audio;
      setNowPlaying(trackId);
      
      // Şarkı bittiğinde durumu sıfırla
      audio.onended = () => {
        audioRef.current = null;
        setNowPlaying(null);
      };
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Popüler Şarkılar Yükleniyor...</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="bg-gray-700 h-40 w-full rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Popüler Şarkılar</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Popüler Şarkılar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
            <div className="relative group">
              <div className="relative w-full h-40 bg-gray-800">
                {track.thumbnail && (
                  <Image 
                    src={track.thumbnail}
                    alt={track.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Resim yüklenemezse varsayılan resmi göster
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-music.jpg'; // public klasörüne ekleyin
                      target.onerror = null; // Sonsuz döngüyü önle
                    }}
                  />
                )}
              </div>
              <button
                onClick={() => track.audioUrl && togglePlay(track.id, track.audioUrl)}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  bg-green-500 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity
                  ${nowPlaying === track.id ? 'opacity-100' : ''}`}
                aria-label={nowPlaying === track.id ? 'Durdur' : 'Çal'}
              >
                {nowPlaying === track.id ? <FaPause /> : <FaPlay />}
              </button>
              {nowPlaying === track.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500">
                  <div className="h-full bg-white animate-pulse"></div>
                </div>
              )}
            </div>
            
            <div className="p-3">
              <h3 className="font-semibold truncate">{track.title}</h3>
              <p className="text-gray-400 text-sm truncate">{track.artist}</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>{track.genre}</span>
                <span>{formatDuration(track.duration)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
