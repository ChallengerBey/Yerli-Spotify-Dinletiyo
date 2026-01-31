
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import InfoBox from './components/InfoBox';
import SearchBox from './components/SearchBox';
import FriendList from './components/FriendList';
import MeetNew from './components/MeetNew';
import ChatModal from './components/ChatModal';
import { User } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChat, setActiveChat] = useState<User | null>(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    const data = await dbService.getFriends();
    setFriends(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setSearchLoading(true);
    const results = await dbService.getUsers(term);
    setSearchResults(results.filter(u => !u.isFriend)); // Only show people who aren't friends yet
    setSearchLoading(false);
  };

  const addFriend = async (userId: string) => {
    await dbService.addFriend(userId);
    // Refresh lists
    await fetchFriends();
    if (isSearching) {
       setSearchResults(prev => prev.filter(u => u.id !== userId));
    }
  };

  const removeFriend = async (userId: string) => {
    await dbService.removeFriend(userId);
    await fetchFriends();
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-12 md:px-8">
      {/* Header & Feature Intro */}
      <Header />
      <InfoBox />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar / Secondary Section */}
        <div className="lg:col-span-4 space-y-8">
          <MeetNew onAdd={addFriend} />
          
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hidden lg:block">
            <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-tighter italic">Günün İpucu</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Daha fazla arkadaş edinerek profilini canlandırabilir ve müzik keşiflerine başlayabilirsin. 
              Sistemimiz şu an Beta aşamasındadır.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div>
            <SearchBox onSearch={handleSearch} isLoading={searchLoading} />
            
            {isSearching && (
              <div className="mt-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4">ARAMA SONUÇLARI</div>
                {searchResults.length === 0 && !searchLoading ? (
                  <p className="text-zinc-500 text-sm">Eşleşen sonuç bulunamadı.</p>
                ) : (
                  <div className="grid gap-3">
                    {searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                        <button 
                          onClick={() => addFriend(user.id)}
                          className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full hover:bg-red-500 hover:text-white transition-all"
                        >
                          Arkadaş Ekle
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <FriendList 
            friends={friends} 
            loading={loading} 
            onChat={setActiveChat}
            onRemove={removeFriend}
          />
        </div>
      </div>

      {/* Footer / Copyright */}
      <div className="mt-20 border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm">
         <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-green-500 rounded-full"></span>
           Sistem Durumu: Aktif
         </div>
         <div>&copy; 2024 Social Friends Hub. Tüm hakları saklıdır.</div>
      </div>

      {activeChat && (
        <ChatModal 
          friend={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
};

export default App;
