'use client'; // Next.js 15'te bu şart kanka

import Script from 'next/script';

export default function AdBanner() {
  return (
    <div className="flex justify-center my-4 min-h-[90px] w-full">
      {/* 1. Ayar Scripti: atOptions'ı tanımlıyoruz */}
      <Script 
        id="adsterra-config" 
        strategy="afterInteractive"
      >
        {`
          window.atOptions = {
            'key' : '11d743642e3d739d464e08abf24c248a',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        `}
      </Script>

      {/* 2. Motor Scripti: Reklamı getiren invoke.js */}
      <Script 
        src="https://www.highperformanceformat.com/11d743642e3d739d464e08abf24c248a/invoke.js" 
        strategy="afterInteractive"
      />
    </div>
  );
}