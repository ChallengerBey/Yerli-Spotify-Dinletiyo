'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, X, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveAd {
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
}

interface ResponsiveAdBannerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  closeable?: boolean;
  category?: string;
}

const responsiveAds: ResponsiveAd[] = [
  {
    id: '1',
    title: 'Premium\'a Geç - Reklamsız Deneyim',
    description: 'Sınırsız müzik, yüksek kalite, offline dinleme',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    linkUrl: '/home/premium',
    backgroundColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-purple-600 hover:bg-gray-100',
    sponsor: 'Yerli Spotify Premium',
    category: 'premium'
  },
  {
    id: '2',
    title: 'Yeni Çıkan Türkçe Şarkılar',
    description: 'En güncel hits, trending müzikler',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    linkUrl: '/home/playlists',
    backgroundColor: 'from-blue-600 to-cyan-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-blue-600 hover:bg-gray-100',
    sponsor: 'Müzik Keşfi',
    category: 'music'
  },
  {
    id: '3',
    title: 'Arkadaşlarınla Müzik Keşfet',
    description: 'Ortak dinleme odaları, sosyal özellikler',
    imageUrl: '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
    linkUrl: '/home/friends',
    backgroundColor: 'from-green-600 to-emerald-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-green-600 hover:bg-gray-100',
    sponsor: 'Sosyal Müzik',
    category: 'social'
  },
  {
    id: '4',
    title: 'Podcast Dünyasını Keşfet',
    description: 'Binlerce podcast, her konuda içerik',
    imageUrl: '/Fotoğraflar/ODAKLANMA ZAMANI.013Z.png',
    linkUrl: '/home/podcasts',
    backgroundColor: 'from-orange-600 to-red-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-orange-600 hover:bg-gray-100',
    sponsor: 'Podcast Hub',
    category: 'podcast'
  },
  {
    id: '5',
    title: 'Canlı Yayın Başlat',
    description: 'Müziklerini paylaş, dinleyici kazan',
    imageUrl: '/Fotoğraflar/elektronik dans.885Z.png',
    linkUrl: '/home/yayinci',
    backgroundColor: 'from-red-600 to-pink-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-red-600 hover:bg-gray-100',
    sponsor: 'Yayıncı Platformu',
    category: 'streaming'
  },
  {
    id: '6',
    title: 'Liderlik Tablosunda Yüksel',
    description: 'Dinleme istatistiklerin, başarımların',
    imageUrl: '/Fotoğraflar/ANTREMANMODU.333Z.png',
    linkUrl: '/home/leaderboard',
    backgroundColor: 'from-yellow-600 to-orange-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-yellow-600 hover:bg-gray-100',
    sponsor: 'Gamification',
    category: 'gamification'
  }
];

export function ResponsiveAdBanner({
  className,
  size = 'medium',
  autoPlay = true,
  autoPlayInterval = 7000,
  showControls = false,
  showDots = true,
  closeable = true,
  category
}: ResponsiveAdBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Filter ads by category if specified
  const filteredAds = category 
    ? responsiveAds.filter(ad => ad.category === category)
    : responsiveAds;
  
  const ads = filteredAds.length > 0 ? filteredAds : responsiveAds;

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || !isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === ads.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, ads.length, isVisible]);

  const handleAdClick = (ad: ResponsiveAd) => {
    console.log('Responsive ad clicked:', ad.title);
    window.open(ad.linkUrl, '_blank');
  };

  const handleClose = () => {
    setIsVisible(false);
    // 60 saniye sonra tekrar göster
    setTimeout(() => setIsVisible(true), 60000);
  };

  if (!isVisible) return null;

  const currentAd = ads[currentIndex];

  // Size configurations
  const sizeConfig = {
    small: {
      height: 'h-16',
      imageSize: 'w-10 h-10',
      titleSize: 'text-xs',
      descSize: 'text-xs',
      buttonSize: 'px-2 py-1 text-xs',
      padding: 'p-2'
    },
    medium: {
      height: 'h-24',
      imageSize: 'w-14 h-14',
      titleSize: 'text-sm',
      descSize: 'text-xs',
      buttonSize: 'px-3 py-1.5 text-xs',
      padding: 'p-3'
    },
    large: {
      height: 'h-32',
      imageSize: 'w-16 h-16',
      titleSize: 'text-base',
      descSize: 'text-sm',
      buttonSize: 'px-4 py-2 text-sm',
      padding: 'p-4'
    }
  };

  const config = sizeConfig[size];

  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden rounded-lg shadow-lg group cursor-pointer",
        config.height,
        className
      )}
      onClick={() => handleAdClick(currentAd)}
    >
      {/* Background Gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-90",
          currentAd.backgroundColor
        )}
      />

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
      />

      {/* Close Button */}
      {closeable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Content */}
      <div className={cn("relative h-full flex items-center justify-between", config.padding)}>
        {/* Left Content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Ad Image */}
          <div className={cn("flex-shrink-0 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm", config.imageSize)}>
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Ad Text */}
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-bold leading-tight truncate mb-0.5", config.titleSize, currentAd.textColor)}>
              {currentAd.title}
            </h3>
            <p className={cn("opacity-90 truncate", config.descSize, currentAd.textColor)}>
              {currentAd.description}
            </p>
            {size === 'large' && (
              <span className={cn("text-xs opacity-75 block mt-0.5", currentAd.textColor)}>
                Sponsor: {currentAd.sponsor}
              </span>
            )}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex items-center gap-2">
          {/* CTA Button */}
          <button
            className={cn(
              "font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 flex-shrink-0",
              config.buttonSize,
              currentAd.buttonColor
            )}
          >
            {size === 'small' ? 'Git' : 'Keşfet'}
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Controls */}
          {showControls && size !== 'small' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors opacity-0 group-hover:opacity-100"
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 text-white" />
              ) : (
                <Volume2 className="w-3 h-3 text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      {showDots && ads.length > 1 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={cn(
                "rounded-full transition-all duration-200",
                size === 'small' ? 'w-1 h-1' : 'w-1.5 h-1.5',
                index === currentIndex 
                  ? "bg-white scale-125" 
                  : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20">
        <div 
          className="h-full bg-white/50 transition-all duration-100"
          style={{ 
            width: `${((currentIndex + 1) / ads.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
}