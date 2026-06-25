"use client";
<meta name="google-site-verification" content="dREUMPILd7rgKGVZQppOZ5KNbCGm5jDAD02oAnhp4kE" />

import { useEffect, useState } from 'react';
import { SongCard } from "@/components/song-card";
import { SimpleYoutubeSearch } from "@/components/simple-youtube-search";
import { Onboarding } from "@/components/onboarding";
import { getMadeForYou, getNewReleases, Playlist, filterPlaylistsByPreferences } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';


function PlaylistSection({ title, fetchData, userPreferences, refreshKey, startRadio = false }) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      console.log(`${title} için yeni veri yüklendi:`, data);
      // Kullanıcı tercihlerine göre filtrele
      const filteredData = userPreferences ?
        await filterPlaylistsByPreferences(data, userPreferences) : data;
      // Ensure playlists is always an array
      setPlaylists(Array.isArray(filteredData) ? filteredData : []);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Playlist yüklenirken hata:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [fetchData, userPreferences, refreshKey]);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (playlists.length === 0) {
    return null; // Tercihlere uygun playlist yoksa gösterme
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {playlists.map((playlist, index) => (
          <SongCard
            key={`${playlist.id}-${lastFetchTime}-${index}`}
            item={playlist}
            startRadio={startRadio}
          />
        ))}
      </div>
    </section>
  );
}



export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [playlistRefreshKey, setPlaylistRefreshKey] = useState(0);
  const router = useRouter();

  // YouTube şarkıları yüklendiğinde playlist'leri yenile
  useEffect(() => {
    const handleYoutubeLoaded = () => {
      console.log('🔄 YouTube şarkıları yüklendi, playlist\'ler yenileniyor...');
      setPlaylistRefreshKey(prev => prev + 1);
    };

    window.addEventListener('youtubeLoaded', handleYoutubeLoaded);
    return () => window.removeEventListener('youtubeLoaded', handleYoutubeLoaded);
  }, []);






  useEffect(() => {
    // Global context menu artık şarkıları algılıyor, burada engellemeye gerek yok
  }, []);

  useEffect(() => {
    const loadUserPreferences = async () => {
      const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          const onboardingKey = `onboarding-completed-${user.id}`;
          const preferencesKey = `user-preferences-${user.id}`;

          // Önce localStorage'dan kontrol et
          const hasCompletedOnboarding = localStorage.getItem(onboardingKey);

          // Sunucudan kullanıcı tercihlerini al
          try {
            const response = await fetch(`/api/user-data?userId=${user.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.preferences && (data.preferences.artists.length > 0 || data.preferences.genres.length > 0)) {
                // Sunucudan gelen tercihleri localStorage ile senkronize et
                localStorage.setItem(preferencesKey, JSON.stringify(data.preferences));
                localStorage.setItem(onboardingKey, 'true'); // Kesinlikle tamamlandı olarak işaretle
                setUserPreferences(data.preferences);
                setShowOnboarding(false);
                return;
              }
            }
          } catch (error) {
            console.error('Kullanıcı tercihleri sunucudan alınamadı:', error);
          }

          // Sunucudan veri alınamazsa veya boşsa localStorage'dan kontrol et
          if (hasCompletedOnboarding === 'true') {
            const preferences = localStorage.getItem(preferencesKey);
            if (preferences) {
              setUserPreferences(JSON.parse(preferences));
              setShowOnboarding(false);
            } else {
              // Onboarding tamamlanmış ama preferences yoksa, tekrar sor
              setShowOnboarding(true);
            }
          } else {
            setShowOnboarding(true);
          }
        } catch (e) {
          console.error('User parse error:', e);
          setShowOnboarding(false);
        }
      } else {
        // Kullanıcı giriş yapmamışsa, ana sayfaya yönlendir (veya login'e)
        // Şimdilik onboarding gösterme
        setShowOnboarding(false);
      }
    };

    loadUserPreferences();
  }, []);

  const handleOnboardingComplete = async (preferences) => {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      const onboardingKey = `onboarding-completed-${user.id}`;
      const preferencesKey = `user-preferences-${user.id}`;

      console.log('Saving preferences for user:', user.id, preferences);

      // Önce localStorage'da güncelle
      localStorage.setItem(onboardingKey, 'true');
      localStorage.setItem(preferencesKey, JSON.stringify(preferences));
      setUserPreferences(preferences);
      setShowOnboarding(false);

      // Sunucu tarafında da güncelle
      try {
        const response = await fetch('/api/user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            preferences: preferences
          }),
        });
        const result = await response.json();
        console.log('Server response:', result);
      } catch (error) {
        console.error('Kullanıcı tercihleri sunucuya kaydedilemedi:', error);
      }
    }
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="space-y-12 relative">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold">Merhaba!</h1>
            <p className="text-muted-foreground text-lg">
              {userPreferences ?
                `${userPreferences.artists.slice(0, 3).join(', ')} ve daha fazlası için önerilerimiz var.` :
                'Sana özel önerilerimiz var.'
              }
            </p>
          </div>


        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight">Dinletiyo'da Ara</h2>
        <SimpleYoutubeSearch
          defaultQuery={userPreferences ?
            `${userPreferences.artists.slice(0, 2).join(' ')} ${userPreferences.genres[0] || ''} mix` :
            'popüler türkçe müzik 2024'}
        />
      </div>

      {/* Kullanıcı tercihlerine göre şarkı önerileri */}
      {/* <RecommendedSongs /> component removed as per user request */}

      <PlaylistSection
        title="Senin için Derlendi"
        fetchData={() => getMadeForYou(6)}
        userPreferences={userPreferences}
        refreshKey={playlistRefreshKey}
        startRadio={true}
      />
      
      <PlaylistSection
        title="Yeni Çıkanlar"
        fetchData={() => getNewReleases(6)}
        userPreferences={userPreferences}
        refreshKey={playlistRefreshKey}
        startRadio={true}
      />


      <footer className="text-center text-sm text-muted-foreground py-8 border-t">
        Dinletiyo Company  Ergili 2026
      </footer>
    </div>
  );
}
