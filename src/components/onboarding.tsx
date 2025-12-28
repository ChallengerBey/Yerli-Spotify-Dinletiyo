"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const artists = [
  'Tarkan', 'Sezen Aksu', 'Ceza', 'Sagopa Kajmer', 'Duman', 'mor ve ötesi',
  'Sertab Erener', 'Ajda Pekkan', 'Müslüm Gürses', 'Cem Karaca', 'maNga',
  'Mabel Matiz', 'Norm Ender', 'Şanışer', 'Yeni Türkü', 'Kibariye'
];

const genres = [
  'Türkçe Pop', 'Türkçe Rock', 'Türkçe Rap', 'Arabesk', 'Alternatif',
  'Elektronik', 'Folk', 'Jazz', 'Blues', 'Klasik'
];

interface OnboardingProps {
  onComplete: (preferences: { artists: string[], genres: string[] }) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const toggleArtist = (artist: string) => {
    setSelectedArtists(prev => 
      prev.includes(artist) 
        ? prev.filter(a => a !== artist)
        : [...prev, artist]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleComplete = () => {
    onComplete({ artists: selectedArtists, genres: selectedGenres });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Hoş Geldin! 🎵</CardTitle>
          <p className="text-muted-foreground">
            Sana özel müzik önerileri için tercihlerini seç
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Hangi sanatçıları dinlersin?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {artists.map(artist => (
                  <Badge
                    key={artist}
                    variant={selectedArtists.includes(artist) ? "default" : "outline"}
                    className="cursor-pointer p-2 text-center justify-center"
                    onClick={() => toggleArtist(artist)}
                  >
                    {artist}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {selectedArtists.length} sanatçı seçildi
                </div>
                <Button 
                  onClick={() => setStep(2)}
                  disabled={selectedArtists.length === 0}
                >
                  Devam Et
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Hangi türleri seversin?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {genres.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer p-2 text-center justify-center"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Geri
                </Button>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedGenres.length} tür seçildi
                  </div>
                  <Button 
                    onClick={handleComplete}
                    disabled={selectedGenres.length === 0}
                  >
                    Başlayalım! 🎉
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}