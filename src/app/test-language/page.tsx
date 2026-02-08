"use client";

import { useState } from "react";
import { detectSongLanguage, filterSongsByLanguage } from "@/lib/language-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const testSongs = [
  { id: '1', title: 'Rapstar', artist: 'Ceza', language: undefined },
  { id: '2', title: 'Shape of You', artist: 'Ed Sheeran', language: undefined },
  { id: '3', title: 'Geceler', artist: 'Ezhel', language: undefined },
  { id: '4', title: 'Blinding Lights', artist: 'The Weeknd', language: undefined },
  { id: '5', title: 'Susamam', artist: 'Şanışer', language: undefined },
  { id: '6', title: 'Bad Guy', artist: 'Billie Eilish', language: undefined },
  { id: '7', title: 'Aşk', artist: 'Sezen Aksu', language: undefined },
  { id: '8', title: 'Someone Like You', artist: 'Adele', language: undefined },
];

export default function TestLanguagePage() {
  const [results, setResults] = useState<any[]>([]);
  const [filterResults, setFilterResults] = useState<any[]>([]);

  const testLanguageDetection = () => {
    const detectionResults = testSongs.map(song => ({
      ...song,
      detectedLanguage: detectSongLanguage(song.title, song.artist)
    }));
    
    setResults(detectionResults);
    console.log('🧪 Dil tespit sonuçları:', detectionResults);
  };

  const testLanguageFiltering = () => {
    // Önce dilleri tespit et
    const songsWithLanguage = testSongs.map(song => ({
      ...song,
      language: detectSongLanguage(song.title, song.artist)
    }));

    const turkishSongs = filterSongsByLanguage(songsWithLanguage, 'turkish');
    const englishSongs = filterSongsByLanguage(songsWithLanguage, 'english');

    setFilterResults([
      { type: 'Türkçe Şarkılar', songs: turkishSongs },
      { type: 'İngilizce Şarkılar', songs: englishSongs }
    ]);

    console.log('🧪 Filtreleme sonuçları:', { turkishSongs, englishSongs });
  };

  const testPlayerIntegration = () => {
    // Player'a test eventi gönder
    window.dispatchEvent(new CustomEvent('languagePreferencesChanged', {
      detail: {
        preferredLanguage: 'turkish',
        smartLanguageMode: true,
        mixLanguages: false
      }
    }));

    console.log('🧪 Player dil tercihleri güncellendi');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dil Sistemi Test Sayfası</h1>
        <p className="text-muted-foreground">Dil tespit ve filtreleme sistemini test edin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={testLanguageDetection} className="h-20">
          🌍 Dil Tespiti Test Et
        </Button>
        <Button onClick={testLanguageFiltering} className="h-20">
          🔍 Dil Filtreleme Test Et
        </Button>
        <Button onClick={testPlayerIntegration} className="h-20">
          🎵 Player Entegrasyonu Test Et
        </Button>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dil Tespit Sonuçları</CardTitle>
            <CardDescription>Her şarkı için tespit edilen dil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((song, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>{song.title} - {song.artist}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    song.detectedLanguage === 'turkish' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {song.detectedLanguage === 'turkish' ? '🇹🇷 Türkçe' : '🇺🇸 İngilizce'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filterResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filterResults.map((group, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{group.type}</CardTitle>
                <CardDescription>{group.songs.length} şarkı bulundu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.songs.map((song: any, songIndex: number) => (
                    <div key={songIndex} className="p-2 bg-muted rounded">
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-muted-foreground">{song.artist}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Şarkıları</CardTitle>
          <CardDescription>Sistemde kullanılan test şarkıları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {testSongs.map((song, index) => (
              <div key={index} className="p-2 bg-muted rounded">
                <div className="font-medium">{song.title}</div>
                <div className="text-sm text-muted-foreground">{song.artist}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}