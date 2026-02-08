
import React from 'react';
import { Play } from 'lucide-react';

const RECOMMENDATIONS = [
  { id: '101', title: 'Top 50 - Global', type: 'Playlist', cover: 'https://picsum.photos/seed/p1/400/400' },
  { id: '102', title: 'Daily Mix 1', type: 'For You', cover: 'https://picsum.photos/seed/p2/400/400' },
  { id: '103', title: 'Chill Vibes', type: 'Playlist', cover: 'https://picsum.photos/seed/p3/400/400' },
  { id: '104', title: 'Power Workout', type: 'Album', cover: 'https://picsum.photos/seed/p4/400/400' },
  { id: '105', title: 'Jazz Classics', type: 'Radio', cover: 'https://picsum.photos/seed/p5/400/400' },
  { id: '106', title: 'Indigo Nights', type: 'Artist', cover: 'https://picsum.photos/seed/p6/400/400' },
];

const SongGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {RECOMMENDATIONS.map((item) => (
        <div key={item.id} className="bg-zinc-900/40 p-4 rounded-xl hover:bg-zinc-800/60 transition-all group cursor-pointer border border-transparent hover:border-white/10">
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
            <img src={item.cover} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              <button className="bg-green-500 text-black p-3 rounded-full shadow-xl hover:scale-105 active:scale-95">
                <Play className="w-6 h-6 fill-black" />
              </button>
            </div>
          </div>
          <h4 className="font-bold truncate text-sm mb-1">{item.title}</h4>
          <p className="text-xs text-zinc-400 font-medium">{item.type}</p>
        </div>
      ))}
    </div>
  );
};

export default SongGrid;
