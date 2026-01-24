'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface NowPlaying {
  song_id: string;
  song_title: string;
  song_artist: string;
  song_image_url: string;
  progress: number;
  duration: number;
  is_playing: boolean;
}

export default function OverlayPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kullanıcının şu an çalan şarkısını dinle
    const checkNowPlaying = async () => {
      try {
        const response = await fetch(`/api/now-playing?userId=${userId}`);
        const data = await response.json();
        
        if (data.nowPlaying && data.nowPlaying.is_playing) {
          setNowPlaying(data.nowPlaying);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Now playing fetch error:', error);
      }
    };

    // İlk yükleme
    checkNowPlaying();

    // Her 2 saniyede bir güncelle
    const interval = setInterval(checkNowPlaying, 2000);

    return () => clearInterval(interval);
  }, [userId]);

  if (!isVisible || !nowPlaying) {
    return null; // Şarkı yoksa hiçbir şey gösterme
  }

  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden">
      {/* Tam Ekran Overlay Container */}
      <div className="absolute bottom-8 left-8 animate-slide-in z-50">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex items-center gap-8 min-w-[600px] max-w-[800px] border-4 border-black/10">
          {/* Album Art - Daha büyük */}
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            {nowPlaying.song_image_url ? (
              <Image
                src={nowPlaying.song_image_url}
                alt={nowPlaying.song_title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Song Info - Daha büyük yazılar */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              🎵 DİNLETİYO.COM
            </p>
            <h3 className="text-3xl font-bold text-black truncate mb-2 leading-tight">
              {nowPlaying.song_title}
            </h3>
            <p className="text-xl text-gray-600 truncate mb-4">
              {nowPlaying.song_artist && nowPlaying.song_artist !== 'YouTube' ? nowPlaying.song_artist : 'Bilinmeyen Sanatçı'}
            </p>

            {/* Progress Bar - Daha büyük */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${nowPlaying.progress}%` }}
              />
            </div>
            
            {/* Süre bilgisi */}
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{Math.floor((nowPlaying.progress * nowPlaying.duration) / 100 / 60)}:{String(Math.floor(((nowPlaying.progress * nowPlaying.duration) / 100) % 60)).padStart(2, '0')}</span>
              <span>{Math.floor(nowPlaying.duration / 60)}:{String(nowPlaying.duration % 60).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Music Icon - Daha büyük */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}