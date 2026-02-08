"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SongLanguage } from "@/lib/language-utils";

interface LanguagePreferences {
  preferredLanguage: SongLanguage;
  smartLanguageMode: boolean; // Otomatik dil geçişi
  mixLanguages: boolean; // Dilleri karıştır
}

export function LanguageSettings() {
  const [preferences, setPreferences] = useState<LanguagePreferences>({
    preferredLanguage: 'auto',
    smartLanguageMode: true,
    mixLanguages: false
  });

  useEffect(() => {
    // LocalStorage'dan tercihleri yükle
    const saved = localStorage.getItem('language-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      } catch (error) {
        console.error('Dil tercihleri yüklenemedi:', error);
      }
    }
  }, []);

  const savePreferences = (newPreferences: LanguagePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('language-preferences', JSON.stringify(newPreferences));
    
    // Global event gönder ki player güncellensin
    window.dispatchEvent(new CustomEvent('languagePreferencesChanged', {
      detail: newPreferences
    }));
    
    toast.success('Dil tercihleri kaydedildi');
  };

  const handleLanguageChange = (language: SongLanguage) => {
    savePreferences({
      ...preferences,
      preferredLanguage: language
    });
  };

  const handleSmartModeChange = (enabled: boolean) => {
    savePreferences({
      ...preferences,
      smartLanguageMode: enabled
    });
  };

  const handleMixLanguagesChange = (enabled: boolean) => {
    savePreferences({
      ...preferences,
      mixLanguages: enabled
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌍 Dil Tercihleri
        </CardTitle>
        <CardDescription>
          Müzik çalarken hangi dilde şarkılar çalınacağını ayarlayın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="language-select">Tercih Edilen Dil</Label>
          <Select
            value={preferences.preferredLanguage}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger id="language-select">
              <SelectValue placeholder="Dil seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">🤖 Otomatik (Şarkıya göre)</SelectItem>
              <SelectItem value="turkish">🇹🇷 Türkçe</SelectItem>
              <SelectItem value="english">🇺🇸 İngilizce</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {preferences.preferredLanguage === 'auto' && 'Çalan şarkının diline göre sonraki şarkı seçilir'}
            {preferences.preferredLanguage === 'turkish' && 'Öncelikle Türkçe şarkılar çalınır'}
            {preferences.preferredLanguage === 'english' && 'Öncelikle İngilizce şarkılar çalınır'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="smart-mode">Akıllı Dil Modu</Label>
            <p className="text-sm text-muted-foreground">
              Çalan şarkının diline göre sonraki şarkıyı seç
            </p>
          </div>
          <Switch
            id="smart-mode"
            checked={preferences.smartLanguageMode}
            onCheckedChange={handleSmartModeChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="mix-languages">Dilleri Karıştır</Label>
            <p className="text-sm text-muted-foreground">
              Türkçe ve İngilizce şarkıları karışık çal
            </p>
          </div>
          <Switch
            id="mix-languages"
            checked={preferences.mixLanguages}
            onCheckedChange={handleMixLanguagesChange}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Nasıl Çalışır?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Akıllı Dil Modu:</strong> Türkçe şarkı çalıyorsa sonraki şarkı da Türkçe olur</li>
            <li>• <strong>Tercih Edilen Dil:</strong> Yeni playlist oluştururken bu dil öncelikli olur</li>
            <li>• <strong>Dilleri Karıştır:</strong> Dil sıralamasını görmezden gelir</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}