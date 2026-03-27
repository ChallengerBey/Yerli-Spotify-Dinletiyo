"use client";

import React, { useState } from 'react';
import { SocialUser } from '@/types/social';
import { socialService } from '@/lib/social-service';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserPlus, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface MeetNewProps {
  currentUserId?: string;
  onAdd?: () => void;
}

export function MeetNew({ currentUserId, onAdd }: MeetNewProps) {
  const [randomUser, setRandomUser] = useState<SocialUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchRandom = async () => {
    setLoading(true);
    try {
      console.log('Fetching random user for currentUserId:', currentUserId);
      const user = await socialService.getRandomUser(currentUserId);
      console.log('Fetched user:', user);
      setRandomUser(user);
    } catch (error) {
      console.error('Error fetching random user:', error);
      toast.error('Kullanıcı yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!randomUser) return;
    
    setAdding(true);
    try {
      await socialService.addFriend(randomUser.id, currentUserId);
      setRandomUser({ ...randomUser, isFriend: true });
      onAdd?.(); // Call the callback to refresh friend list
      toast.success('Arkadaş eklendi!', {
        description: `${randomUser.name} ile artık arkadaşsın! 🎉`
      });
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Arkadaş eklenirken hata oluştu');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 transition-all hover:bg-zinc-900/60 group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Yeni Biriyle Tanış</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchRandom}
          disabled={loading}
          className="h-8 w-8 text-gray-500 hover:text-red-500"
        >
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      </div>
      
      {randomUser ? (
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-zinc-800">
            <Image
              src={randomUser.avatar}
              alt={randomUser.name}
              fill
              className="object-cover"
            />
            <span className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
              randomUser.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'
            }`} />
          </div>
          
          <div>
            <div className="text-lg font-bold text-white">{randomUser.name}</div>
            {randomUser.bio && (
              <div className="text-zinc-500 text-sm mt-1">{randomUser.bio}</div>
            )}
            <div className="text-xs text-zinc-600 mt-1">
              {randomUser.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
            </div>
          </div>
          
          <Button 
            onClick={handleAddFriend}
            disabled={randomUser.isFriend || adding}
            className={`w-full ${
              randomUser.isFriend 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
            }`}
          >
            {adding ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Ekleniyor...
              </>
            ) : randomUser.isFriend ? (
              'Zaten Arkadaşsın'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Arkadaş Ekle
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-zinc-500 text-sm text-center">
            Keşfetmek için yenile butonuna tıkla
          </div>
          <Button 
            onClick={fetchRandom}
            disabled={loading}
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Keşfet
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}