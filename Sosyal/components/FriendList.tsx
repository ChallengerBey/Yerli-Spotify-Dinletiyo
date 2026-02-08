
import React from 'react';
import { User } from '../types';

interface FriendListProps {
  friends: User[];
  loading: boolean;
  onChat: (user: User) => void;
  onRemove: (userId: string) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friends, loading, onChat, onRemove }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-6 bg-red-500 rounded-full"></span>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Arkadaş Listen</h2>
      </div>
      
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 min-h-[300px]">
        <div className="text-zinc-600 text-[10px] font-bold tracking-widest uppercase mb-6 flex justify-between">
          ARKADAŞLAR ({friends.length})
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 animate-pulse">Yükleniyor...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-zinc-500">Henüz hiç arkadaşın yok.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {friends.map(friend => (
              <div key={friend.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-700">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${friend.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'}`}></span>
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-red-400 transition-colors">{friend.name}</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                      {friend.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onChat(friend)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-all"
                    title="Mesaj Gönder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onRemove(friend.id)}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Arkadaşlıktan Çıkar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;
