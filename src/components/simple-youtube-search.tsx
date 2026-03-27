'use client';

import { useState, useEffect } from 'react';
import SongContextMenu from './song-context-menu';
import { parseYouTubeMusicMeta } from '@/lib/youtube-metadata';


interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

// Hardcoded şarkı listesi (API quota bittiğinde)
const fallbackSongs: Video[] = [
  { id: 'BNAEBRXlUlk', title: 'Ceza - Rapstar', thumbnail: 'https://i.ytimg.com/vi/BNAEBRXlUlk/maxresdefault.jpg', duration: '4:12' },
  { id: 'BypWUfBsNlE', title: 'Ceza - Holocaust', thumbnail: 'https://i.ytimg.com/vi/BypWUfBsNlE/maxresdefault.jpg', duration: '5:45' },
  { id: 'rxlKhwHkRP0', title: 'Sagopa Kajmer - Bir Pesimistin Gözyaşları', thumbnail: 'https://i.ytimg.com/vi/rxlKhwHkRP0/maxresdefault.jpg', duration: '6:23' },
  { id: 'qDptS1C7rkE', title: 'Norm Ender - Karma', thumbnail: 'https://i.ytimg.com/vi/qDptS1C7rkE/maxresdefault.jpg', duration: '3:55' },
  { id: 'gyCADiiKmPs', title: 'Şanışer - Susamam', thumbnail: 'https://i.ytimg.com/vi/gyCADiiKmPs/maxresdefault.jpg', duration: '14:55' },
  { id: 'HhZaHf8RP6g', title: 'Ezhel - Geceler', thumbnail: 'https://i.ytimg.com/vi/HhZaHf8RP6g/maxresdefault.jpg', duration: '3:42' },
  { id: 'YSHxt_-ntzw', title: 'Khontkar - Ölüme İnat', thumbnail: 'https://i.ytimg.com/vi/YSHxt_-ntzw/maxresdefault.jpg', duration: '3:18' },
  { id: 'kKO_bBNbJss', title: 'Gazapizm - Heyecanı Yok', thumbnail: 'https://i.ytimg.com/vi/kKO_bBNbJss/maxresdefault.jpg', duration: '4:01' },
  { id: 'JFm7YDVlqnI', title: 'Ed Sheeran - Shape of You', thumbnail: 'https://i.ytimg.com/vi/JFm7YDVlqnI/maxresdefault.jpg', duration: '3:53' },
  { id: '4NRXx6U8ABQ', title: 'The Weeknd - Blinding Lights', thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg', duration: '3:20' },
  { id: 'DyDfgMOUjCI', title: 'Billie Eilish - bad guy', thumbnail: 'https://i.ytimg.com/vi/DyDfgMOUjCI/maxresdefault.jpg', duration: '3:14' },
  { id: 'YQHsXMglC9A', title: 'Adele - Hello', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/maxresdefault.jpg', duration: '6:07' }
];

interface SimpleYoutubeSearchProps {
  defaultQuery?: string;
  hideSearchBar?: boolean;
}

export function SimpleYoutubeSearch({ defaultQuery, hideSearchBar = false }: SimpleYoutubeSearchProps) {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [selectedSong, setSelectedSong] = useState<any>(null);

  // Context menu'yu kapatmak için click listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showContextMenu) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [showContextMenu]);

  // Client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sayfa yüklendiğinde Türkçe rap/hip-hop getir
  useEffect(() => {
    if (mounted) {
      // Kullanıcı tercihi varsa onu, yoksa genel bir arama yap
      const initialSearch = defaultQuery || 'türkçe rap hip hop 2024 popüler';
      searchYouTube(initialSearch, false);
    }
  }, [mounted, defaultQuery]);

  if (!mounted) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  const formatDuration = (iso: string) => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const h = parseInt(match?.[1] || '0');
    const m = parseInt(match?.[2] || '0');
    const s = parseInt(match?.[3] || '0');
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const searchYouTube = async (searchQuery?: string, requireInput = true) => {
    const finalQuery = searchQuery || query;
    if (requireInput && !finalQuery.trim()) return;

    // Save to search history
    if (requireInput && finalQuery.trim()) {
      const searchHistory = JSON.parse(localStorage.getItem('search-history') || '[]');
      const filtered = searchHistory.filter((term: string) => term !== finalQuery);
      filtered.unshift(finalQuery);
      localStorage.setItem('search-history', JSON.stringify(filtered.slice(0, 10)));
    }

    setLoading(true);
    setVideos([]);

    try {
      // Yeni scrape API'sini kullan (sınırsız)
      const response = await fetch(`/api/youtube-scrape?q=${encodeURIComponent(finalQuery)}`);

      if (!response.ok) {
        throw new Error(`Scrape API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos);

        // YouTube şarkılarını global cache'e ekle
        if (typeof window !== 'undefined') {
          // data.ts'deki addYoutubeToCache fonksiyonunu çağır
          const { addYoutubeToCache } = await import('@/lib/data');
          addYoutubeToCache(data.videos);

          // Playlist'lerin yenilenmesi için event gönder
          window.dispatchEvent(new CustomEvent('youtubeLoaded'));
        }
      } else {
        setVideos(fallbackSongs);
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      // Hata durumunda fallback şarkıları göster
      setVideos(fallbackSongs);
    } finally {
      setLoading(false);
    }
  };

  const playVideo = (video: Video) => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) {
      const { artist, title } = parseYouTubeMusicMeta(video.title);
      window.dispatchEvent(new CustomEvent('showAuthModal', { detail: { title, artist, imageUrl: video.thumbnail, thumbnail: video.thumbnail } }));
      return;
    }

    // Şarkı başlığından sanatçı ve şarkı adını ayır
    const { artist, title } = parseYouTubeMusicMeta(video.title);

    console.log(`🎵 Ana sayfadan şarkı çalınıyor: "${title}" - "${artist}" (orijinal: "${video.title}")`);

    const songData = {
      id: video.id,
      title: title,
      artist: artist,
      album: '',
      duration: video.duration,
      imageUrl: video.thumbnail,
      audioUrl: video.id,
      aiHint: 'youtube'
    };

    window.dispatchEvent(new CustomEvent('startRadio', { detail: songData }));
  };

  const createSongData = (video: Video) => {
    // Şarkı başlığından sanatçı ve şarkı adını ayır
    const { artist, title } = parseYouTubeMusicMeta(video.title);

    return {
      id: video.id,
      title: title,
      artist: artist,
      album: '',
      duration: video.duration,
      imageUrl: video.thumbnail,
      audioUrl: video.id,
      youtube_url: `https://youtube.com/watch?v=${video.id}`,
      aiHint: 'youtube'
    };
  };

  // Not: YouTube title parsing `parseYouTubeMusicMeta` ile yapılır.

  return (
    <div className="space-y-6">
      {!hideSearchBar && (
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder=""
            onKeyDown={(e) => e.key === 'Enter' && searchYouTube()}
            className="flex-1 px-3 py-2 bg-secondary border border-border rounded-md"
          />
          <button onClick={() => searchYouTube()} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>
      )}

      {loading && <div className="text-center py-8">Şarkılar yükleniyor...</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-card-container cursor-pointer group relative rounded-lg overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg"
            data-video-card="true"
            onClick={() => playVideo(video)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const songData = createSongData(video);
              setSelectedSong(songData);
              setContextMenuPos({ x: e.clientX, y: e.clientY });
              setShowContextMenu(true);
            }}
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 rounded-full p-3">
                  <svg className="h-6 w-6 text-black fill-black" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-medium text-sm line-clamp-2">
                {video.title}
              </h3>
            </div>
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>
        ))}
      </div>

      {!loading && videos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Şarkı yüklenemedi.
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && selectedSong && (
        <SongContextMenu
          song={selectedSong}
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
}