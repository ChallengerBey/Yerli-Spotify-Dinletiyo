
'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Loader2, Search as SearchIcon } from "lucide-react";
import { searchTracks } from './actions';
import { SongCard } from '@/components/song-card';
import { Song } from '@/lib/data';
import { AdCarousel } from '@/components/ad-carousel';

const categories = [
  { name: "Pop", color: "from-red-500 to-pink-500" },
  { name: "Rock", color: "from-slate-600 to-gray-800" },
  { name: "Hip Hop", color: "from-purple-600 to-indigo-700" },
  { name: "Elektronik", color: "from-green-500 to-teal-600" },
  { name: "Klasik", color: "from-yellow-400 to-amber-600" },
  { name: "Caz", color: "from-blue-500 to-sky-700" },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    const searchResults = await searchTracks(searchTerm);
    setResults(searchResults);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-4xl font-bold">Ara</h1>

      {/* Üst Reklam Carousel */}
      <section className="mt-8">
        <AdCarousel
          variant="horizontal"
          autoPlay={true}
          showControls={true}
          showDots={true}
          className="max-w-4xl mx-auto"
        />
      </section>

      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Ne dinlemek istersin?"
          className="pl-12 h-14 text-lg bg-secondary border-0 focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" size="lg" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ara'}
        </Button>
      </form>

      {isLoading && (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-square bg-secondary rounded-lg"></div>
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                    <div className="h-4 bg-secondary rounded w-1/2"></div>
                </div>
            ))}
         </div>
      )}

      {!isLoading && hasSearched && results.length > 0 && (
         <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Arama Sonuçları</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((song) => (
              <SongCard key={song.id} item={song} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg">Sonuç bulunamadı.</p>
            <p>"{searchTerm}" için sonuç bulunamadı. Lütfen başka bir şey deneyin.</p>
          </div>
      )}

      {!isLoading && !hasSearched && (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Hepsine göz at</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`relative aspect-square rounded-lg p-4 overflow-hidden flex items-end bg-gradient-to-br ${category.color} transition-transform hover:scale-105 cursor-pointer`}
              >
                <h3 className="text-white font-bold text-2xl shadow-lg">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Alt Reklam Carousel */}
      <section className="container py-8">
        <AdCarousel
          variant="horizontal"
          autoPlay={true}
          showControls={true}
          showDots={true}
          className="max-w-6xl mx-auto"
        />
      </section>
    </div>
  );
}
