'use client';

import Script from 'next/script';
import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlexibleAdBannerProps {
  className?: string;
  adKey?: string;
  width?: number;
  height?: number;
  format?: string;
  closeable?: boolean;
  showLabel?: boolean;
}

export default function FlexibleAdBanner({
  className,
  adKey = '11d743642e3d739d464e08abf24c248a',
  width = 728,
  height = 90,
  format = 'iframe',
  closeable = true,
  showLabel = true
}: FlexibleAdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const uniqueId = `ad-${adKey}-${Date.now()}`;

  const handleClose = () => {
    setIsVisible(false);
    // 2 dakika sonra tekrar göster
    setTimeout(() => setIsVisible(true), 120000);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "relative flex justify-center items-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group",
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

      {/* Ad Label */}
      {showLabel && (
        <div className="absolute top-1 left-1 bg-gray-500/80 text-white text-xs px-2 py-0.5 rounded z-10">
          Reklam
        </div>
      )}

      {/* Ad Scripts */}
      <Script 
        id={`adsterra-config-${uniqueId}`}
        strategy="afterInteractive"
      >
        {`
          window.atOptions = {
            'key': '${adKey}',
            'format': '${format}',
            'height': ${height},
            'width': ${width},
            'params': {}
          };
        `}
      </Script>

      <Script 
        src={`https://www.highperformanceformat.com/${adKey}/invoke.js`}
        strategy="afterInteractive"
      />
    </div>
  );
}