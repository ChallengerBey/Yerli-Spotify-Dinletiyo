"use client";

import React, { useState, useEffect } from 'react';
import { SocialUser } from '@/types/social';
import { socialService } from '@/lib/social-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, MessageCircle, UserMinus, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ChatModal } from './chat-modal';

interface EnhancedFriendListProps {
  currentUserId?: string;
  currentUserName?: string;
  refreshTrigger?: number;
}

export function EnhancedFriendList({ currentUserId, currentUserName, refreshTrigger }: EnhancedFriendListProps) {
  const [friends, setFriends] = useState<SocialUser[]>([]);
  const [searchResults, setSearchResults] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChat, setActiveChat] = useState<SocialUser | null>(null);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      console.log('Fetching friends for user:', currentUserId);
      const data = await socialService.getFriends(currentUserId);
      console.log('Fetched friends:', data);
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Arkadaş listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUserId, refreshTrigger]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setSearchLoading(true);
    
    try {
      const results = await socialService.getUsers(term, currentUserId);
      setSearchResults(results.filter(u => !u.isFriend)); // Only show people who aren't friends yet
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Arama sırasında hata oluştu');
    } finally {
      setSearchLoading(false);
    }
  };

  const addFriend = async (userId: string) => {
    try {
      console.log('Adding friend:', userId, 'for user:', currentUserId);
      await socialService.addFriend(userId, currentUserId);
      console.log('Friend added, refreshing list...');
      await fetchFriends();
      if (isSearching) {
        setSearchResults(prev => prev.filter(u => u.id !== userId));
      }
      toast.success('Arkadaş eklendi!', {
        description: 'Yeni bir arkadaş edindin! 🎉'
      });
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Arkadaş eklenirken hata oluştu');
    }
  };

  const removeFriend = async (userId: string) => {
    try {
      await socialService.removeFriend(userId, currentUserId);
      await fetchFriends();
      toast.success('Arkadaş çıkarıldı');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Arkadaş çıkarılırken hata oluştu');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Search Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Kullanıcı Ara</h3>
          </div>
          
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              searchLoading ? 'text-red-500 animate-pulse' : 'text-zinc-500'
            }`} />
            <Input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 focus:border-red-500/50 focus:ring-red-500/20"
            />
          </div>

          {isSearching && (
            <div className="mt-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">
                Arama Sonuçları ({searchResults.length})
              </div>
              {searchResults.length === 0 && !searchLoading ? (
                <p className="text-zinc-500 text-sm">Eşleşen sonuç bulunamadı.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-zinc-900 ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'
                          }`} />
                        </div>
                        <div>
                          <span className="text-white font-medium text-sm">{user.name}</span>
                          {user.bio && (
                            <p className="text-zinc-500 text-xs">{user.bio}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addFriend(user.id)}
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        Arkadaş Ekle
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Friends List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Arkadaş Listesi ({friends.length})
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchFriends}
              className="h-8 w-8 text-gray-500 hover:text-red-500"
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
                <p className="text-zinc-500 animate-pulse">Yükleniyor...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-60">
                <Users className="h-12 w-12 text-zinc-600" />
                <p className="text-zinc-500">Henüz hiç arkadaşın yok.</p>
                <p className="text-zinc-600 text-sm">Yukarıdan arama yaparak yeni arkadaşlar bulabilirsin!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map(friend => (
                  <div key={friend.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-700">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                          <Image
                            src={friend.avatar}
                            alt={friend.name}
                            width={48}
                            height={48}
                            className="object-cover grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                          friend.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-red-400 transition-colors">
                          {friend.name}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1">
                          {friend.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                        </div>
                        {friend.bio && (
                          <div className="text-xs text-zinc-600 mt-1">{friend.bio}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveChat(friend)}
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        title="Mesaj Gönder"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFriend(friend.id)}
                        className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Arkadaşlıktan Çıkar"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {activeChat && (
        <ChatModal
          friend={activeChat}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </>
  );
}