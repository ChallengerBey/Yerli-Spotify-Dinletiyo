import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import SongGrid from './components/SongGrid';
import SearchBar from './components/SearchBar';
import { useSongs, useRecommendations, useSongSearch } from './hooks/useSongs';
import { useUserFavorites, useAddFavorite, useRemoveFavorite } from './hooks/useUser';
import { Song } from './lib/api';
import { Loader } from 'lucide-react';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // API Hooks
  const { data: allSongs = [], isLoading: songsLoading } = useSongs();
  const { data: recommendations = [], isLoading: recommendationsLoading } = useRecommendations(10);
  const { data: searchResults = [], isLoading: searchLoading } = useSongSearch(searchQuery);
  const { data: favorites = [] } = useUserFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const favoriteIds = useMemo(() => favorites.map(s => s.id), [favorites]);

  // Set initial song
  React.useEffect(() => {
    if (!currentSong && recommendations.length > 0) {
      setCurrentSong(recommendations[0]);
    }
  }, [recommendations, currentSong]);

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleToggleFavorite = (song: Song) => {
    if (favoriteIds.includes(song.id)) {
      removeFavoriteMutation.mutate(song.id);
    } else {
      addFavoriteMutation.mutate(song.id);
    }
  };

  const handleNext = () => {
    const currentList = searchQuery ? searchResults : (activeTab === 'home' ? recommendations : allSongs);
    if (currentList.length === 0) return;
    
    const currentIndex = currentList.findIndex(s => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % currentList.length;
    setCurrentSong(currentList[nextIndex]);
    if ('vibrate' in navigator) navigator.vibrate(8);
  };

  const handlePrev = () => {
    const currentList = searchQuery ? searchResults : (activeTab === 'home' ? recommendations : allSongs);
    if (currentList.length === 0) return;
    
    const currentIndex = currentList.findIndex(s => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    setCurrentSong(currentList[prevIndex]);
    if ('vibrate' in navigator) navigator.vibrate(8);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Recommended For You</h2>
              <SongGrid
                songs={recommendations}
                onPlay={handlePlaySong}
                onFavorite={handleToggleFavorite}
                favorites={favoriteIds}
                isLoading={recommendationsLoading}
              />
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-4">
            <SearchBar onSearch={setSearchQuery} />
            {searchQuery && (
              <SongGrid
                songs={searchResults}
                onPlay={handlePlaySong}
                onFavorite={handleToggleFavorite}
                favorites={favoriteIds}
                isLoading={searchLoading}
              />
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Favorites</h2>
            <SongGrid
              songs={favorites}
              onPlay={handlePlaySong}
              onFavorite={handleToggleFavorite}
              favorites={favoriteIds}
            />
          </div>
        );

      case 'create':
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Create Playlist</h2>
              <p className="text-white/60 text-sm">Coming soon...</p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Profile</h2>
              <p className="text-white/60 text-sm">Coming soon...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-32 max-w-md mx-auto relative">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <span className="font-semibold">
          {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l11 11c.39.39 1.02.39 1.41 0l11-11c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/>
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <span className="text-xs">51</span>
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {songsLoading && recommendationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* Mini Player */}
      {currentSong && (
        <MiniPlayer
          song={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
