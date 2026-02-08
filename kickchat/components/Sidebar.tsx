
import React, { useState } from 'react';
import { Streamer } from '../types';

interface SidebarProps {
  streamers: Streamer[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: (username: string) => void;
  onRemove: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ streamers, activeId, onSelect, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-64 bg-[#000000] border-r border-[#1a1a1a] flex flex-col h-full shrink-0">
      <div className="p-4 mt-2">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yayıncı Ekle..."
            className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-[#333] transition-all placeholder-gray-600"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1 text-gray-600 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {streamers.map((s) => (
          <div 
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
              activeId === s.id ? 'bg-[#1a1a1a]' : 'hover:bg-[#0e0e0e]'
            }`}
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                 activeId === s.id ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-500'
              }`}>
                {s.username[0].toUpperCase()}
              </div>
              <span className={`text-xs font-medium truncate ${activeId === s.id ? 'text-white' : 'text-gray-400'}`}>
                {s.username}
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(s.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-800 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
