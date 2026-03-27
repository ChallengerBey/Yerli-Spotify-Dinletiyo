import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MaintenanceBanner } from "@/components/maintenance-banner";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { PWARegister } from "@/components/pwa-register";
import { GlobalContextMenu } from "@/components/global-context-menu";
import { AuthPromptModalWrapper } from "@/components/auth-prompt-modal-wrapper";
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://dinletiyo.com' : 'http://localhost:3000'),
  title: 'Dinletiyo - Reklamsız Ücretsiz Müzik Dinleme Sitesi 2026 | Spotify Alternatifi',
  description: 'Dinletiyo ile 2026\'nın en iyi reklamsız ücretsiz müzik dinleme deneyimini yaşayın. Bağımsız sanatçılar ve milyonlarca şarkı için en iyi Spotify alternatifi. İnternetsiz müzik dinleme özelliği ile her an yanınızda.',
  keywords: 'ücretsiz müzik, reklamsız müzik dinle, spotify alternatifi, en iyi müzik uygulaması 2026, türkçe müzik dinle, internetsiz müzik dinleme ücretsiz, playlist oluştur, yeni müzik keşfet',
  authors: [{ name: 'Semih Ergili', url: 'https://dinletiyo.com' }],
  creator: 'Semih Ergili',
  publisher: 'Topluyo Inc',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Dinletiyo - Reklamsız Ücretsiz Müzik Dinleme Sitesi 2026',
    description: 'Milyonlarca şarkıyı reklamsız ve ücretsiz dinleyin. 2026\'nın en iyi Spotify alternatifi müzik platformu.',
    url: 'https://dinletiyo.com',
    siteName: 'Dinletiyo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dinletiyo - Ücretsiz Müzik Platformu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dinletiyo - Reklamsız Ücretsiz Müzik Dinleme Sitesi 2026',
    description: 'Milyonlarca şarkıyı reklamsız ve ücretsiz dinleyin. 2026\'nın en iyi Spotify alternatifi.',
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
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7820068773492751"
          crossOrigin="anonymous"
        />
        
        <PWARegister />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Radix UI ContextMenu bileşeninin çalışmasına izin vermek için
            // varsayılan sağ tıklama menüsünü engelleme kodunu kaldırdık
            // Radix UI kendi sağ tıklama olayını yönetecek
          `
        }} />
        <MaintenanceBanner />
        <AnnouncementBanner />
        
        {children}
        
        <Toaster />
        <AuthPromptModalWrapper />
        <GlobalContextMenu />
      </body>
    </html>
  );
}
