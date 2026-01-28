'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AdsterraBanner() {
  useEffect(() => {
    // Inject Adsterra configuration onto window object
    (window as any).atOptions = {
      'key': '11d743642e3d739d464e08abf24c248a',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };
  }, []);

  return (
    <div className="flex justify-center my-4">
      <Script
        src="https://www.highperformanceformat.com/11d743642e3d739d464e08abf24c248a/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}