'use client';

import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { libraryManager } from '@/lib/library-manager';
import { Song } from '@/lib/data';

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string>('');

  useEffect(() => {
    const loadLibraryData = async () => {
      try {
        setIsLoading(true);
        console.log('📚 Library: Loading library data with LibraryManager');
        
        // Get library data through LibraryManager
        const libraryData = await libraryManager.getLibraryData();
        setFavorites(libraryData.favorites);
        setRecentlyPlayed(libraryData.recentlyPlayed.slice(0, 20));
        
        console.log('✅ Library: Loaded', libraryData.favorites.length, 'favorites and', libraryData.recentlyPlayed.length, 'recently played');
        setSyncStatus('Loaded successfully');
      } catch (error) {
        console.error('❌ Library: Failed to load library data:', error);
        setSyncStatus('Failed to load data');
        
        // Fallback to direct localStorage access
        try {
          const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
          const localRecent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
          setFavorites(localFavorites);
          setRecentlyPlayed(localRecent.slice(0, 20));
          console.log('📦 Library: Fallback to local storage:', localFavorites.length, 'favorites');
        } catch (fallbackError) {
          console.error('❌ Library: Fallback also failed:', fallbackError);
          setFavorites([]);
          setRecentlyPlayed([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Load library data
    loadLibraryData();

    // Handle favorite changes
    const handleFavoriteChange = () => {
      console.log('🔄 Library: Favorite changed event received');
      loadLibraryData();
    };

    // Handle storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'favorites' || event.key === 'recentlyPlayed') {
        console.log('🔄 Library: Storage change detected for', event.key);
        loadLibraryData();
      }
    };

    // Listen for events
    window.addEventListener('favoriteChanged', handleFavoriteChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('favoriteChanged', handleFavoriteChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const togglePlay = (song: Song) => {
    // Notify LibraryManager about playback start
    if (currentSong !== song.id) {
      libraryManager.notifyPlaybackStart(song.id);
      
      // Add to recently played
      libraryManager.addToRecentlyPlayed(song.id);
    }

    window.dispatchEvent(new CustomEvent('playSong', { detail: song }));

    if (currentSong === song.id) {
      setIsPlaying(!isPlaying);
      
      // Notify LibraryManager about playback end if stopping
      if (isPlaying) {
        libraryManager.notifyPlaybackEnd(song.id);
      }
    } else {
      // If switching songs, end previous song
      if (currentSong) {
        libraryManager.notifyPlaybackEnd(currentSong);
      }
      
      setCurrentSong(song.id);
      setIsPlaying(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-headline text-2xl lg:text-4xl font-bold mb-2">Kitaplığın</h1>
          <p className="text-muted-foreground text-sm lg:text-lg">Beğendiğin ve dinlediğin şarkılar yükleniyor...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl lg:text-4xl font-bold mb-2">Kitaplığın</h1>
        <p className="text-muted-foreground text-sm lg:text-lg">Beğendiğin ve dinlediğin şarkılar.</p>
        {syncStatus && (
          <p className="text-xs text-muted-foreground mt-1">Durum: {syncStatus}</p>
        )}
      </div>

      <section>
        <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-4">Beğenilen Şarkılar</h2>
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz beğenilen şarkı yok. Şarkılara kalp atarak buraya ekleyebilirsin!
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                <div className="flex-shrink-0 w-12 h-12 relative ml-2">
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    onClick={() => togglePlay(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {currentSong === song.id && isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                {currentSong === song.id && isPlaying && (
                  <div className="ml-4 flex items-center">
                    <span className="text-sm text-primary">Çalıyor</span>
                    <div className="ml-2 flex space-x-1">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {recentlyPlayed.length > 0 && (
        <section>
          <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-4">Son Çalınanlar</h2>
          <div className="space-y-2">
            {recentlyPlayed.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                <div className="flex-shrink-0 w-12 h-12 relative ml-2">
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    onClick={() => togglePlay(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {currentSong === song.id && isPlaying ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 text-white" />
                    )}
                  </button>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                {currentSong === song.id && isPlaying && (
                  <div className="ml-4 flex items-center">
                    <span className="text-sm text-primary">Çalıyor</span>
                    <div className="ml-2 flex space-x-1">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}