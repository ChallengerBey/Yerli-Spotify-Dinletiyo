import React from "react";
import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: 'Dinletiyo - Reklamsız Ücretsiz Müzik Dinleme Sitesi 2026',
  description: 'Dinletiyo ile 2026\'nın en iyi reklamsız ücretsiz müzik dinleme deneyimini yaşayın. Milyonlarca şarkı ve playlist sizi bekliyor.',
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicService",
    "name": "Dinletiyo",
    "description": "Ücretsiz ve reklamsız müzik dinleme platformu.",
    "url": "https://dinletiyo.com/home",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://dinletiyo.com/home/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
