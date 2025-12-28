import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MaintenanceBanner } from "@/components/maintenance-banner";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dinletiyo - Türkiye\'nin En Büyük Müzik Platformu | Ücretsiz Müzik Dinle',
  description: 'Dinletiyo ile milyonlarca Türkçe ve yabancı şarkıyı ücretsiz dinleyin. Pop, rock, rap, arabesk ve daha fazlası. Arkadaşlarınızla playlist paylaşın, yeni müzikler keşfedin.',
  keywords: 'müzik dinle, ücretsiz müzik, Türkçe müzik, playlist, şarkı dinle, müzik platformu, online müzik, Türkiye müzik, pop müzik, rock müzik',
  authors: [{ name: 'Semih Ergili', url: 'https://dinletiyo.com' }],
  creator: 'Semih Ergili',
  publisher: 'Topluyo Inc',
  robots: 'index, follow',
  openGraph: {
    title: 'Dinletiyo - Türkiye\'nin En Büyük Müzik Platformu',
    description: 'Milyonlarca şarkıyı ücretsiz dinleyin, playlist oluşturun ve arkadaşlarınızla paylaşın.',
    url: 'https://dinletiyo.com',
    siteName: 'Dinletiyo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dinletiyo - Müzik Platformu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dinletiyo - Türkiye\'nin En Büyük Müzik Platformu',
    description: 'Milyonlarca şarkıyı ücretsiz dinleyin, playlist oluşturun ve arkadaşlarınızla paylaşın.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://dinletiyo.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

        {/* SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Dinletiyo',
              description: 'Türkiye\'nin en büyük müzik platformu',
              url: 'https://dinletiyo.com',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'TRY'
              },
              author: {
                '@type': 'Person',
                name: 'Semih Ergili'
              },
              publisher: {
                '@type': 'Organization',
                name: 'Topluyo Inc'
              }
            })
          }}
        />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background context-menu-area")} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Radix UI ContextMenu bileşeninin çalışmasına izin vermek için
            // varsayılan sağ tıklama menüsünü engelleme kodunu kaldırdık
            // Radix UI kendi sağ tıklama olayını yönetecek
          `
        }} />
        <MaintenanceBanner />
        <AnnouncementBanner />
        <div className="pt-0">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
