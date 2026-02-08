
import React, { useState } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';

interface MeetNewProps {
  onAdd: (userId: string) => void;
}

const MeetNew: React.FC<MeetNewProps> = ({ onAdd }) => {
  const [randomUser, setRandomUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRandom = async () => {
    setLoading(true);
    const user = await dbService.getRandomUser();
    setRandomUser(user);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 h-full transition-all hover:bg-zinc-900/60 group">
      <div className="text-zinc-500 uppercase text-xs font-bold tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
        YENİ BİRİYLE TANIŞ
      </div>
      
      {randomUser ? (
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
           <img src={randomUser.avatar} className="w-24 h-24 rounded-full border-4 border-zinc-800 object-cover" alt="" />
           <div>
             <div className="text-xl font-bold text-white">{randomUser.name}</div>
             <div className="text-zinc-500 text-sm">{randomUser.bio}</div>
           </div>
           <button 
             onClick={() => onAdd(randomUser.id)}
             disabled={randomUser.isFriend}
             className={`w-full py-2 px-6 rounded-xl font-bold transition-all ${randomUser.isFriend ? 'bg-zinc-800 text-zinc-500' : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'}`}
           >
             {randomUser.isFriend ? 'Zaten Arkadaşsın' : 'Arkadaş Ekle'}
           </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
           <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>
           </div>
           <div className="text-zinc-500 text-sm text-center">Keşfetmek için butona tıkla</div>
        </div>
      )}

      <button 
        onClick={fetchRandom}
        disabled={loading}
        className="text-zinc-400 hover:text-red-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      </button>
    </div>
  );
};

export default MeetNew;
