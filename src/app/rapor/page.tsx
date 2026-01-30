'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Globe, Activity, MapPin, TrendingUp, Clock, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CountryData {
  country: string;
  country_code: string;
  count: number;
  cities: string[];
  avgCoordinates: [number, number];
}

interface AnalyticsStats {
  totalEvents: number;
  uniqueCountries: number;
  eventTypes: Record<string, number>;
  dailyStats: Record<string, number>;
}

interface RealtimeData {
  events: any[];
  activeUsers: number;
}

export default function RaporPage() {
  const [mapData, setMapData] = useState<CountryData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [totalUsers] = useState(1547); // SABİT KULLANICI SAYISI - 1500 civarı
  const [currentActiveUsers] = useState(() => {
    // Sayfa yüklendiğinde 25-35 arası rastgele bir sayı seç ve sabit tut
    return Math.floor(Math.random() * 11) + 25; // 25-35 arası
  });

  // Verileri yükle - Sadece sabit veriler, API çağrısı yok
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Sabit veriler yükleniyor...');
      
      // Hiç API çağrısı yapmıyoruz, sadece sabit veriler
      
      // Sabit harita verileri
      setMapData([
        {
          country: 'Turkey',
          country_code: 'TR',
          count: 150,
          cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
          avgCoordinates: [39.9334, 32.8597]
        }
      ]);

      // Sabit istatistik verileri
      setStats({
        totalEvents: 0,
        uniqueCountries: 0,
        eventTypes: {},
        dailyStats: {}
      });

      // Sabit aktif kullanıcı verisi - Sayfa yüklendiğinde belirlenen sayı
      setRealtimeData({
        activeUsers: currentActiveUsers, // Sayfa yüklendiğinde belirlenen sabit sayı
        events: [
          {
            event_type: 'song_play',
            city: 'Istanbul',
            country: 'Turkey',
            created_at: new Date(Date.now() - 300000).toISOString()
          },
          {
            event_type: 'page_view',
            city: 'Ankara',
            country: 'Turkey',
            created_at: new Date(Date.now() - 600000).toISOString()
          },
          {
            event_type: 'search',
            city: 'Izmir',
            country: 'Turkey',
            created_at: new Date(Date.now() - 900000).toISOString()
          }
        ]
      });

    } catch (error) {
      console.error('❌ Veri yükleme hatası:', error);
      
      // Hata durumunda da aynı sabit veriler
      setMapData([
        {
          country: 'Turkey',
          country_code: 'TR',
          count: 150,
          cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
          avgCoordinates: [39.9334, 32.8597]
        }
      ]);
      
      setStats({
        totalEvents: 0,
        uniqueCountries: 0,
        eventTypes: {},
        dailyStats: {}
      });
      
      setRealtimeData({
        activeUsers: currentActiveUsers, // Sayfa yüklendiğinde belirlenen sabit sayı
        events: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Analytics tracking kaldırıldı - sadece sabit veriler
    
    // Her 30 saniyede bir güncelle (ama aslında hiçbir şey değişmez)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedDays]);

  // Türkiye haritası için şehir koordinatları
  const turkishCities = {
    'Istanbul': [41.0082, 28.9784],
    'Ankara': [39.9334, 32.8597],
    'Izmir': [38.4192, 27.1287],
    'Bursa': [40.1826, 29.0665],
    'Antalya': [36.8969, 30.7133],
    'Adana': [37.0000, 35.3213],
    'Konya': [37.8667, 32.4833],
    'Gaziantep': [37.0662, 37.3833],
    'Samsun': [41.2928, 36.3313],
    'Kayseri': [38.7312, 35.4787],
    'Trabzon': [41.0015, 39.7178],
    'Eskisehir': [39.7767, 30.5206],
    'Diyarbakir': [37.9144, 40.2306],
    'Mersin': [36.8000, 34.6333],
    'Kocaeli': [40.8533, 29.8815]
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">📊 Dinletiyo Rapor</h1>
              <p className="text-muted-foreground">Kullanıcı aktiviteleri ve coğrafi dağılım analizi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={selectedDays === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(1)}
            >
              24 Saat
            </Button>
            <Button
              variant={selectedDays === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(7)}
            >
              7 Gün
            </Button>
            <Button
              variant={selectedDays === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(30)}
            >
              30 Gün
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Ana İstatistikler - Sadece 2 kart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{formatNumber(totalUsers)}</div>
              <p className="text-xs text-muted-foreground">Kayıtlı kullanıcılar</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Kullanıcı</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{realtimeData?.activeUsers || currentActiveUsers}</div>
              <p className="text-xs text-muted-foreground">Son 1 saatte</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Türkiye Haritası */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                🇹🇷 Türkiye Kullanıcı Haritası
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-4 h-96 overflow-hidden border border-slate-700">
                <svg viewBox="0 0 1000 500" className="w-full h-full">
                  {/* Türkiye gerçek sınırları (detaylı) */}
                  <path
                    d="M50 250 L80 220 L120 200 L160 190 L200 185 L250 180 L300 175 L350 170 L400 165 L450 160 L500 158 L550 160 L600 165 L650 170 L700 175 L750 180 L800 185 L850 190 L900 200 L930 220 L950 250 L940 280 L920 310 L890 330 L850 340 L800 345 L750 350 L700 355 L650 360 L600 365 L550 370 L500 375 L450 370 L400 365 L350 360 L300 355 L250 350 L200 345 L150 340 L100 330 L70 310 L50 280 Z"
                    fill="rgba(30, 41, 59, 0.9)"
                    stroke="rgba(148, 163, 184, 0.5)"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                  
                  {/* İç denizler ve detaylar */}
                  <path
                    d="M200 200 Q250 180 300 190 Q350 185 400 195 L450 200 L500 205 L550 210 L600 215 L650 220 L700 225 L750 230 L800 235 L820 250 L800 265 L750 270 L700 275 L650 280 L600 285 L550 290 L500 295 L450 290 L400 285 L350 280 L300 275 L250 270 L200 265 Z"
                    fill="rgba(51, 65, 85, 0.6)"
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth="1"
                  />
                  
                  {/* Şehir noktaları - Gerçek koordinatlara yakın */}
                  {mapData.map((country, index) => {
                    if (country.country_code === 'TR') {
                      const cityCoords = {
                        'Istanbul': [750, 200],
                        'Ankara': [500, 240],
                        'Izmir': [300, 280],
                        'Bursa': [650, 220],
                        'Antalya': [450, 350],
                        'Adana': [550, 320],
                        'Konya': [480, 290],
                        'Gaziantep': [600, 310],
                        'Samsun': [550, 180],
                        'Kayseri': [520, 270],
                        'Trabzon': [700, 160],
                        'Eskisehir': [450, 250],
                        'Diyarbakir': [750, 290],
                        'Mersin': [520, 340],
                        'Kocaeli': [720, 210]
                      };
                      
                      return country.cities.map((city, cityIndex) => {
                        const coords = cityCoords[city as keyof typeof cityCoords];
                        if (!coords) return null;
                        
                        const [x, y] = coords;
                        const userCount = Math.floor(Math.random() * 30) + 15; // 15-45 kullanıcı
                        
                        return (
                          <g key={`${city}-${cityIndex}`}>
                            {/* Glow effect */}
                            <circle
                              cx={x}
                              cy={y}
                              r={Math.min(userCount / 3, 30)}
                              fill="rgba(34, 197, 94, 0.2)"
                              className="animate-pulse"
                            />
                            <circle
                              cx={x}
                              cy={y}
                              r={Math.min(userCount / 5, 20)}
                              fill="rgba(34, 197, 94, 0.4)"
                              className="animate-pulse"
                              style={{ animationDelay: '0.5s' }}
                            />
                            {/* Ana nokta */}
                            <circle
                              cx={x}
                              cy={y}
                              r="6"
                              fill="#22c55e"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="drop-shadow-lg"
                            />
                            {/* Şehir adı */}
                            <text
                              x={x}
                              y={y - 35}
                              textAnchor="middle"
                              className="text-xs fill-white font-bold drop-shadow-lg"
                              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              {city}
                            </text>
                            {/* Kullanıcı sayısı */}
                            <text
                              x={x}
                              y={y - 20}
                              textAnchor="middle"
                              className="text-xs fill-green-400 font-bold drop-shadow-lg"
                              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              {userCount}
                            </text>
                          </g>
                        );
                      });
                    }
                    return null;
                  })}
                  
                  {/* Dekoratif elementler */}
                  <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(34, 197, 94, 0.8)" />
                      <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                    </radialGradient>
                  </defs>
                </svg>
                
                {/* Canlı gösterge - Daha büyük ve belirgin */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute"></div>
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">{realtimeData?.activeUsers || currentActiveUsers}</div>
                      <div className="text-xs text-gray-400">Aktif Kullanıcı</div>
                    </div>
                  </div>
                </div>
                
                {/* Toplam kullanıcı göstergesi */}
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">{formatNumber(totalUsers)}</div>
                      <div className="text-xs text-gray-400">Toplam Üye</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Şehir Listesi */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5 text-primary" />
                Şehir Sıralaması
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {/* Gerçekçi şehir verileri */}
                {[
                  { city: 'Istanbul', count: Math.floor(Math.random() * 50) + 120 }, // 120-170
                  { city: 'Ankara', count: Math.floor(Math.random() * 30) + 80 },    // 80-110
                  { city: 'Izmir', count: Math.floor(Math.random() * 25) + 60 },     // 60-85
                  { city: 'Bursa', count: Math.floor(Math.random() * 20) + 45 },     // 45-65
                  { city: 'Antalya', count: Math.floor(Math.random() * 15) + 35 },   // 35-50
                  { city: 'Adana', count: Math.floor(Math.random() * 12) + 28 },     // 28-40
                  { city: 'Konya', count: Math.floor(Math.random() * 10) + 22 },     // 22-32
                  { city: 'Gaziantep', count: Math.floor(Math.random() * 8) + 18 },  // 18-26
                  { city: 'Samsun', count: Math.floor(Math.random() * 6) + 15 },     // 15-21
                  { city: 'Kayseri', count: Math.floor(Math.random() * 5) + 12 },    // 12-17
                  { city: 'Trabzon', count: Math.floor(Math.random() * 4) + 10 },    // 10-14
                  { city: 'Eskisehir', count: Math.floor(Math.random() * 3) + 8 },   // 8-11
                  { city: 'Diyarbakir', count: Math.floor(Math.random() * 3) + 6 },  // 6-9
                  { city: 'Mersin', count: Math.floor(Math.random() * 2) + 5 },      // 5-7
                  { city: 'Kocaeli', count: Math.floor(Math.random() * 2) + 4 }      // 4-6
                ]
                .sort((a, b) => b.count - a.count)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">{item.city}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs font-bold">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Etkinlik Türleri */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Etkinlik Türleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.eventTypes && Object.entries(stats.eventTypes).map(([type, count]) => (
                <div key={type} className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize font-medium">
                    {type.replace('_', ' ').replace('page view', '📄 Sayfa').replace('song play', '🎵 Şarkı').replace('search', '🔍 Arama')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Son Aktiviteler */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Canlı Aktivite Akışı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {realtimeData?.events.slice(0, 15).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-foreground font-medium">
                      {event.event_type === 'page_view' && '📄'}
                      {event.event_type === 'song_play' && '🎵'}
                      {event.event_type === 'search' && '🔍'}
                      {event.event_type === 'user_login' && '👤'}
                      {' '}
                      {event.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{event.city}, {event.country}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}