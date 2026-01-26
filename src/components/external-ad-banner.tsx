'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExternalAdBannerProps {
  className?: string;
  closeable?: boolean;
  adKey?: string;
  width?: number;
  height?: number;
  format?: string;
}

export function ExternalAdBanner({
  className,
  closeable = true,
  adKey = '11d743642e3d739d464e08abf24c248a',
  width = 728,
  height = 90,
  format = 'iframe'
}: ExternalAdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isVisible || !adRef.current) return;

    const loadAd = () => {
      try {
        // Önceki içeriği temizle
        if (adRef.current) {
          adRef.current.innerHTML = '';
        }

        // Unique ID oluştur
        const uniqueId = `ad_${adKey}_${Date.now()}`;
        
        // Ad container div'i oluştur
        const adContainer = document.createElement('div');
        adContainer.id = uniqueId;
        adContainer.style.width = `${width}px`;
        adContainer.style.height = `${height}px`;
        adContainer.style.margin = '0 auto';
        
        // Global options'ı ayarla
        (window as any)[`atOptions_${uniqueId}`] = {
          'key': adKey,
          'format': format,
          'height': height,
          'width': width,
          'params': {}
        };
        
        // Script'i oluştur ve yükle
        const script = document.createElement('script');
        script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
          setHasError(false);
        };
        
        script.onerror = () => {
          setHasError(true);
          setIsLoaded(false);
        };

        // DOM'a ekle
        if (adRef.current) {
          adRef.current.appendChild(adContainer);
          adRef.current.appendChild(script);
        }

        // Timeout ile fallback
        const timeout = setTimeout(() => {
          if (!isLoaded) {
            setHasError(true);
          }
        }, 10000); // 10 saniye timeout

        return () => {
          clearTimeout(timeout);
          if (adRef.current) {
            adRef.current.innerHTML = '';
          }
        };
      } catch (error) {
        console.error('Ad loading error:', error);
        setHasError(true);
      }
    };

    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [isVisible, adKey, format, height, width, isLoaded]);

  const handleClose = () => {
    setIsVisible(false);
    // 2 dakika sonra tekrar göster
    setTimeout(() => setIsVisible(true), 120000);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "relative w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group",
        className
      )}
      style={{ 
        minHeight: height,
        maxWidth: width,
        margin: '0 auto'
      }}
    >
      {/* Close Button */}
      {closeable && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Ad Container */}
      <div 
        ref={adRef}
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: height }}
      />

      {/* Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span className="text-sm">Reklam yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-2">📢</div>
            <p className="text-sm">Reklam yüklenemedi</p>
            <button 
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
              }}
              className="text-xs text-blue-500 hover:text-blue-600 mt-1"
            >
              Tekrar dene
            </button>
          </div>
        </div>
      )}

      {/* Ad Label */}
      <div className="absolute top-1 left-1 bg-gray-500/80 text-white text-xs px-2 py-0.5 rounded">
        Reklam
      </div>
    </div>
  );
}