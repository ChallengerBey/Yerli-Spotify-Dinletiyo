
import React from 'react';
import { Home, Compass, Library, PlusSquare, Heart, Bookmark } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'library', icon: Library, label: 'Library' },
  ];

  return (
    <aside className="w-64 bg-black flex flex-col p-6 hidden md:flex border-r border-zinc-900">
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-lg flex items-center justify-center rotate-3">
          <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center -rotate-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          </div>
        </div>
        <span className="text-xl font-black tracking-tighter">ECHOSTREAM</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-4 px-3 py-3 rounded-lg transition-all group ${
              activeTab === item.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-green-500' : 'group-hover:text-white'}`} />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-10 space-y-6">
        <div>
          <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-3 mb-4">Your Playlists</h5>
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-4 px-3 py-2 text-zinc-400 hover:text-white transition-colors group">
              <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center group-hover:bg-zinc-700">
                <PlusSquare className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">Create Playlist</span>
            </button>
            <button className="w-full flex items-center space-x-4 px-3 py-2 text-zinc-400 hover:text-white transition-colors group">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-400 rounded flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
              </div>
              <span className="text-sm font-bold">Liked Songs</span>
            </button>
            <button className="w-full flex items-center space-x-4 px-3 py-2 text-zinc-400 hover:text-white transition-colors group">
              <div className="w-6 h-6 bg-emerald-800/40 rounded flex items-center justify-center">
                <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-sm font-bold">Your Episodes</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-zinc-800 mx-3" />

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {['Cyberpunk Radio', 'Midnight Jazz', 'Study Lo-fi', 'Best of 80s', 'Rock Classics', 'Mood Booster'].map((name) => (
            <button key={name} className="w-full text-left px-3 py-1.5 text-sm text-zinc-400 hover:text-white truncate">
              {name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
