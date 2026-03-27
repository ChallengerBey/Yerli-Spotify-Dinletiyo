'use client';

import Script from 'next/script';

export default function GoogleAdsense() {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7820068773492751"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}