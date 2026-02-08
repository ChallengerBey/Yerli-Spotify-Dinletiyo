"use client";

import { useState, useEffect } from "react";
import { detectSongLanguage, filterSongsByLanguage } from "@/lib/language-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const testSongs = [
  { id: '1', title: 'Rapstar', artist: 'Ceza', language: undefined },
  { id: '2', title: 'Shape of You', artist: 'Ed Sheeran', language: undefined },
  { id: '3', title: 'Geceler', artist: 'Ezhel', language: undefined },
  { id: '4', title: 'Blinding Lights', artist: 'The Weeknd', language: undefined },
  { id: '5', title: 'Susamam', artist: 'Şanışer', language: undefined },
  { id: '6', title: 'Bad Guy', artist: 'Billie Eilish', language: undefined },
  { id: '7', title: 'Aşk', artist: 'Sezen Aksu', language: undefined },
  { id: '8', title: 'Someone Like You', artist: 'Adele', language: undefined },
  { id: '9', title: 'Karma', artist: 'Norm Ender', language: undefined },
  { id: '10', title: 'Watermelon Sugar', artist: 'Harry Styles', language: undefined },
];

export default function TestLanguageDebugPage() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [languagePrefs, setLanguagePrefs] = useState({
    smartLanguageMode: true,
    mixLanguages: false,
    preferredLanguage: 'auto'
  });
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const simulatePlayNext = () => {
    const currentSong = testSongs[currentSongIndex];
    const remainingSongs = testSongs.slice(currentSongIndex + 1);
    
    addLog(`🎵 Mevcut şarkı: "${currentSong.title}" - "${currentSong.artist}"`);
    
    // Dil tespiti
    const currentLanguage = detectSongLanguage(currentSong.title, currentSong.artist);
    addLog(`🌍 Tespit edilen dil: ${currentLanguage}`);
    
    // Hedef dil belirleme
    let targetLanguage = 'auto';
    if (languagePrefs.mixLanguages) {
      targetLanguage = 'auto';
      addLog('🔀 Karışık mod aktif');
    } else if (languagePrefs.smartLanguageMode) {
      targetLanguage = currentLanguage;
      addLog(`🧠 Akıllı mod aktif - hedef dil: ${targetLanguage}`);
    } else {
      targetLanguage = languagePrefs.preferredLanguage;
      addLog(`🎯 Sabit tercih aktif - hedef dil: ${targetLanguage}`);
    }
    
    if (remainingSongs.length === 0) {
      addLog('❌ Kalan şarkı yok');
      return;
    }
    
    addLog(`🔍 ${remainingSongs.length} şarkı arasından ${targetLanguage} dili aranıyor...`);
    
    // Filtreleme
    if (targetLanguage === 'auto') {
      const nextSong = remainingSongs[0];
      addLog(`🎵 Sonraki şarkı (karışık): "${nextSong.title}"`);
      setCurrentSongIndex(currentSongIndex + 1);
    } else {
      const sameLangSongs = filterSongsByLanguage(remainingSongs, targetLanguage);
      
      if (sameLangSongs.length > 0) {
        const nextSong = sameLangSongs[0];
        const nextIndex = testSongs.findIndex((song, idx) => idx > currentSongIndex && song.id === nextSong.id);
        addLog(`✅ Aynı dilde şarkı bulundu: "${nextSong.title}"`);
        setCurrentSongIndex(nextIndex);
      } else {
        const nextSong = remainingSongs[0];
        addLog(`⚠️ Aynı dilde şarkı yok, sıradaki: "${nextSong.title}"`);
        setCurrentSongIndex(currentSongIndex + 1);
      }
    }
  };

  const resetTest = () => {
    setCurrentSongIndex(0);
    setDebugLogs([]);
    addLog('🔄 Test sıfırlandı');
  };

  const currentSong = testSongs[currentSongIndex];
  const currentLanguage = currentSong ? detectSongLanguage(currentSong.title, currentSong.artist) : 'unknown';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dil Sistemi Debug</h1>
        <p className="text-muted-foreground">Gerçek zamanlı dil filtreleme testi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mevcut Durum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Şu an çalan:</p>
              <p className="text-lg">{currentSong?.title || 'Hiçbiri'}</p>
              <p className="text-muted-foreground">{currentSong?.artist || ''}</p>
              <Badge variant={currentLanguage === 'turkish' ? 'default' : 'secondary'}>
                {currentLanguage === 'turkish' ? '🇹🇷 Türkçe' : '🇺🇸 İngilizce'}
              </Badge>
            </div>
            
            <div>
              <p className="font-medium">Sıra: {currentSongIndex + 1} / {testSongs.length}</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={languagePrefs.smartLanguageMode}
                  onChange={(e) => setLanguagePrefs(prev => ({ ...prev, smartLanguageMode: e.target.checked }))}
                />
                <span>Akıllı Dil Modu</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={languagePrefs.mixLanguages}
                  onChange={(e) => setLanguagePrefs(prev => ({ ...prev, mixLanguages: e.target.checked }))}
                />
                <span>Dilleri Karıştır</span>
              </label>
            </div>

            <div className="space-x-2">
              <Button onClick={simulatePlayNext} disabled={currentSongIndex >= testSongs.length - 1}>
                ⏭️ Sonraki Şarkı
              </Button>
              <Button onClick={resetTest} variant="outline">
                🔄 Sıfırla
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto bg-muted p-3 rounded text-sm font-mono">
              {debugLogs.map((log, idx) => (
                <div key={idx} className="mb-1">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Şarkıları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {testSongs.map((song, index) => {
              const language = detectSongLanguage(song.title, song.artist);
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded border ${index === currentSongIndex ? 'bg-primary/10 border-primary' : 'bg-muted'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-muted-foreground">{song.artist}</div>
                    </div>
                    <Badge variant={language === 'turkish' ? 'default' : 'secondary'}>
                      {language === 'turkish' ? '🇹🇷' : '🇺🇸'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}