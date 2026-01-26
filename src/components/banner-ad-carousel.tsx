'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  sponsor: string;
}

interface BannerAdCarouselProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  muted?: boolean;
}

const defaultAds: BannerAd[] = [
  {
    id: '1',
    title: 'Premium\'a Geç - Reklamsız Müzik',
    description: 'Sınırsız müzik, yüksek kalite, offline dinleme',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    linkUrl: '/home/premium',
    backgroundColor: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-purple-600 hover:bg-gray-100',
    sponsor: 'Yerli Spotify Premium'
  },
  {
    id: '2',
    title: 'Yeni Çıkan Türkçe Pop Hits',
    description: 'En güncel şarkılar, en sevilen sanatçılar',
    imageUrl: '/Fotoğraflar/TÜRKÇE POP HİTS.063Z.png',
    linkUrl: '/home/playlists',
    backgroundColor: 'from-blue-600 to-cyan-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-blue-600 hover:bg-gray-100',
    sponsor: 'Müzik Keşfi'
  },
  {
    id: '3',
    title: 'Arkadaşlarınla Birlikte Dinle',
    description: 'Ortak dinleme odaları oluştur, müziği paylaş',
    imageUrl: '/Fotoğraflar/YOLCULUK ŞARKILARI.740Z.png',
    linkUrl: '/home/rooms',
    backgroundColor: 'from-green-600 to-emerald-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-green-600 hover:bg-gray-100',
    sponsor: 'Sosyal Müzik'
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
    sponsor: 'Podcast Hub'
  },
  {
    id: '5',
    title: 'Yayıncı Modu - Canlı Yayın',
    description: 'Müziklerini canlı yayınla, dinleyici kazan',
    imageUrl: '/Fotoğraflar/elektronik dans.885Z.png',
    linkUrl: '/home/yayinci',
    backgroundColor: 'from-red-600 to-pink-600',
    textColor: 'text-white',
    buttonColor: 'bg-white text-red-600 hover:bg-gray-100',
    sponsor: 'Yayıncı Platformu'
  }
];

export function BannerAdCarousel({
  className,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showDots = true,
  muted = true
}: BannerAdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [ads] = useState<BannerAd[]>(defaultAds);

  // Auto play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === ads.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, autoPlayInterval, ads.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? ads.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === ads.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleAdClick = (ad: BannerAd) => {
    // Analytics tracking burada yapılabilir
    console.log('Ad clicked:', ad.title);
    window.open(ad.linkUrl, '_blank');
  };

  const currentAd = ads[currentIndex];

  return (
    <div 
      className={cn(
        "relative w-full h-[90px] overflow-hidden rounded-lg shadow-lg group",
        className
      )}
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

      {/* Content */}
      <div className="relative h-full flex items-center justify-between px-6">
        {/* Left Content */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Ad Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Ad Text */}
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-bold text-lg leading-tight truncate", currentAd.textColor)}>
              {currentAd.title}
            </h3>
            <p className={cn("text-sm opacity-90 truncate", currentAd.textColor)}>
              {currentAd.description}
            </p>
            <span className={cn("text-xs opacity-75", currentAd.textColor)}>
              Sponsor: {currentAd.sponsor}
            </span>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex items-center gap-3">
          {/* CTA Button */}
          <button
            onClick={() => handleAdClick(currentAd)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 hover:scale-105",
              currentAd.buttonColor
            )}
          >
            Keşfet
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Controls */}
          {showControls && (
            <div className="flex items-center gap-1">
              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      {showDots && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex 
                  ? "bg-white scale-125" 
                  : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
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