
import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-2">
          Arkadaşlar <span className="text-red-500 text-xl">🤝</span>
        </h1>
        <p className="text-zinc-500 font-medium">Yeni arkadaşlar bul ve beraber müzik dinle</p>
      </div>
    </div>
  );
};

export default Header;
