
import React from 'react';

interface SearchBoxProps {
  onSearch: (val: string) => void;
  isLoading: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, isLoading }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-6 bg-red-500 rounded-full"></span>
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Kullanıcı Ara</h2>
      </div>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className={`h-5 w-5 ${isLoading ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input 
          type="text" 
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Kullanıcı ara..." 
          className="block w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all shadow-inner"
        />
      </div>
    </div>
  );
};

export default SearchBox;
