// Reklam Yönetim Sistemi

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  sponsor: string;
  category: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: string[];
  impressions: number;
  clicks: number;
  budget?: number;
  costPerClick?: number;
}

export interface AdPlacement {
  id: string;
  name: string;
  location: 'homepage-top' | 'homepage-middle' | 'homepage-bottom' | 'sidebar' | 'in-app-top' | 'in-app-bottom';
  size: 'small' | 'medium' | 'large';
  maxAds: number;
  rotationInterval: number;
  isActive: boolean;
}

// Varsayılan reklamlar
export const defaultAds: Ad[] = [
  {
    id: 'premium-1',
    title: 'Premium\'a Geç - Reklamsız Müzik',
    description: 'Sınırsız müzik, yüksek kalite, offline dinleme',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    linkUrl: '/home/premium',
    backgroundColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-purple-600 hover:bg-gray-100',
    sponsor: 'Yerli Spotify Premium',
    category: 'premium',
    priority: 10,
    isActive: true,
    impressions: 0,
    clicks: 0,
    costPerClick: 0.50
  },
  {
    id: 'music-discovery-1',
    title: 'Yeni Çıkan Türkçe Pop Hits',
    description: 'En güncel şarkılar, en sevilen sanatçılar',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    linkUrl: '/home/playlists',
    backgroundColor: 'from-blue-600 to-cyan-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-blue-600 hover:bg-gray-100',
    sponsor: 'Müzik Keşfi',
    category: 'music',
    priority: 8,
    isActive: true,
    impressions: 0,
    clicks: 0,
    costPerClick: 0.30
  },
  {
    id: 'social-1',
    title: 'Arkadaşlarınla Birlikte Dinle',
    description: 'Ortak dinleme odaları oluştur, müziği paylaş',
    imageUrl: '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
    linkUrl: '/home/rooms',
    backgroundColor: 'from-green-600 to-emerald-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-green-600 hover:bg-gray-100',
    sponsor: 'Sosyal Müzik',
    category: 'social',
    priority: 7,
    isActive: true,
    impressions: 0,
    clicks: 0,
    costPerClick: 0.25
  },
  {
    id: 'podcast-1',
    title: 'Podcast Dünyasını Keşfet',
    description: 'Binlerce podcast, her konuda içerik',
    imageUrl: '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png',
    linkUrl: '/home/podcasts',
    backgroundColor: 'from-orange-600 to-red-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-orange-600 hover:bg-gray-100',
    sponsor: 'Podcast Hub',
    category: 'podcast',
    priority: 6,
    isActive: true,
    impressions: 0,
    clicks: 0,
    costPerClick: 0.20
  },
  {
    id: 'streaming-1',
    title: 'Yayıncı Modu - Canlı Yayın',
    description: 'Müziklerini canlı yayınla, dinleyici kazan',
    imageUrl: '/Fotoğraflar/elektronik dans.885Z.png',
    linkUrl: '/home/yayinci',
    backgroundColor: 'from-red-600 to-pink-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-red-600 hover:bg-gray-100',
    sponsor: 'Yayıncı Platformu',
    category: 'streaming',
    priority: 5,
    isActive: true,
    impressions: 0,
    clicks: 0,
    costPerClick: 0.35
  },
  {
    id: 'gamification-1',
    title: 'Liderlik Tablosunda Yüksel',
    description: 'Dinleme istatistiklerin, başarımların',
    imageUrl: '/Fotoğraflar/ANTREMANMODU.333Z.png',
    linkUrl: '/home/leaderboard',
    backgroundColor: 'from-yellow-600 to-orange-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-yellow-600 hover:bg-gray-100',
    sponsor: 'Gamification',
    category: 'gamification',
    priority: 4,
    isActive: true,
    impressions: 0,
    clicks: 0,
    costPerClick: 0.15
  }
];

// Reklam yerleşimleri
export const adPlacements: AdPlacement[] = [
  {
    id: 'homepage-top',
    name: 'Ana Sayfa Üst Banner',
    location: 'homepage-top',
    size: 'large',
    maxAds: 5,
    rotationInterval: 6000,
    isActive: true
  },
  {
    id: 'homepage-middle',
    name: 'Ana Sayfa Orta Banner',
    location: 'homepage-middle',
    size: 'medium',
    maxAds: 4,
    rotationInterval: 8000,
    isActive: true
  },
  {
    id: 'homepage-bottom',
    name: 'Ana Sayfa Alt Banner',
    location: 'homepage-bottom',
    size: 'large',
    maxAds: 3,
    rotationInterval: 9000,
    isActive: true
  },
  {
    id: 'sidebar',
    name: 'Kenar Çubuğu Reklamı',
    location: 'sidebar',
    size: 'small',
    maxAds: 4,
    rotationInterval: 12000,
    isActive: true
  },
  {
    id: 'in-app-top',
    name: 'Uygulama İçi Üst Banner',
    location: 'in-app-top',
    size: 'medium',
    maxAds: 6,
    rotationInterval: 10000,
    isActive: true
  }
];

// Reklam yönetim fonksiyonları
export class AdManager {
  private static ads: Ad[] = [...defaultAds];
  private static placements: AdPlacement[] = [...adPlacements];

  // Belirli bir yerleşim için reklamları getir
  static getAdsForPlacement(placementId: string, category?: string): Ad[] {
    const placement = this.placements.find(p => p.id === placementId);
    if (!placement || !placement.isActive) return [];

    let filteredAds = this.ads.filter(ad => 
      ad.isActive && 
      this.isAdActive(ad) &&
      (!category || ad.category === category)
    );

    // Önceliğe göre sırala
    filteredAds.sort((a, b) => b.priority - a.priority);

    // Maksimum reklam sayısını uygula
    return filteredAds.slice(0, placement.maxAds);
  }

  // Reklamın aktif olup olmadığını kontrol et
  private static isAdActive(ad: Ad): boolean {
    const now = new Date();
    
    if (ad.startDate && now < ad.startDate) return false;
    if (ad.endDate && now > ad.endDate) return false;
    
    return true;
  }

  // Reklam gösterimini kaydet
  static recordImpression(adId: string): void {
    const ad = this.ads.find(a => a.id === adId);
    if (ad) {
      ad.impressions++;
      this.saveToStorage();
    }
  }

  // Reklam tıklamasını kaydet
  static recordClick(adId: string): void {
    const ad = this.ads.find(a => a.id === adId);
    if (ad) {
      ad.clicks++;
      this.saveToStorage();
      
      // Analytics'e gönder
      this.sendAnalytics('ad_click', {
        adId: ad.id,
        category: ad.category,
        sponsor: ad.sponsor,
        ctr: ad.clicks / ad.impressions
      });
    }
  }

  // Reklam performansını getir
  static getAdPerformance(adId: string): { impressions: number; clicks: number; ctr: number; cost: number } {
    const ad = this.ads.find(a => a.id === adId);
    if (!ad) return { impressions: 0, clicks: 0, ctr: 0, cost: 0 };

    const ctr = ad.impressions > 0 ? ad.clicks / ad.impressions : 0;
    const cost = ad.clicks * (ad.costPerClick || 0);

    return {
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: ctr,
      cost: cost
    };
  }

  // Yeni reklam ekle
  static addAd(ad: Omit<Ad, 'id' | 'impressions' | 'clicks'>): void {
    const newAd: Ad = {
      ...ad,
      id: `custom-${Date.now()}`,
      impressions: 0,
      clicks: 0
    };
    
    this.ads.push(newAd);
    this.saveToStorage();
  }

  // Reklamı güncelle
  static updateAd(adId: string, updates: Partial<Ad>): void {
    const adIndex = this.ads.findIndex(a => a.id === adId);
    if (adIndex !== -1) {
      this.ads[adIndex] = { ...this.ads[adIndex], ...updates };
      this.saveToStorage();
    }
  }

  // Reklamı sil
  static removeAd(adId: string): void {
    this.ads = this.ads.filter(a => a.id !== adId);
    this.saveToStorage();
  }

  // Tüm reklamları getir
  static getAllAds(): Ad[] {
    return [...this.ads];
  }

  // Kategori bazında reklamları getir
  static getAdsByCategory(category: string): Ad[] {
    return this.ads.filter(ad => ad.category === category && ad.isActive);
  }

  // Local storage'a kaydet
  private static saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ad-data', JSON.stringify({
        ads: this.ads,
        lastUpdated: new Date().toISOString()
      }));
    }
  }

  // Local storage'dan yükle
  static loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ad-data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.ads) {
            this.ads = data.ads;
          }
        } catch (e) {
          console.error('Ad data parse error:', e);
        }
      }
    }
  }

  // Analytics gönder
  private static sendAnalytics(event: string, data: any): void {
    // Google Analytics, Facebook Pixel, vs. entegrasyonu
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, data);
    }
    
    console.log('Ad Analytics:', event, data);
  }

  // A/B test için reklam varyantı seç
  static selectAdVariant(ads: Ad[]): Ad | null {
    if (ads.length === 0) return null;
    if (ads.length === 1) return ads[0];

    // Ağırlıklı rastgele seçim (öncelik bazında)
    const totalPriority = ads.reduce((sum, ad) => sum + ad.priority, 0);
    const random = Math.random() * totalPriority;
    
    let currentSum = 0;
    for (const ad of ads) {
      currentSum += ad.priority;
      if (random <= currentSum) {
        return ad;
      }
    }
    
    return ads[0];
  }
}

// Sayfa yüklendiğinde verileri yükle
if (typeof window !== 'undefined') {
  AdManager.loadFromStorage();
}