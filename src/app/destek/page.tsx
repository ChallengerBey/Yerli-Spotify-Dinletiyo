import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Destek | Dinletiyo',
  description: 'Dinletiyo için yardım ve destek merkezi. Sık sorulan sorular, iletişim ve geri bildirim.',
  alternates: { canonical: 'https://dinletiyo.com/destek' },
};

export default function DestekPage() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-auto"><Logo /></Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/market" className="hover:underline">Market</Link>
            <Link href="/katil" className="hover:underline">Katıl</Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        <div className="prose prose-invert mx-auto max-w-3xl bg-card p-8 rounded-lg">
          <h1 className="font-headline text-4xl font-bold">Destek</h1>
          <p className="text-lg text-muted-foreground">Sorunun mu var? Buradayız.</p>
          <h2>SSS</h2>
          <ul>
            <li>Giriş yapamıyorum → E-postandaki doğrulama bağlantısını kontrol et.</li>
            <li>İçerik akmıyor → Tarayıcı önbelleğini temizle ve tekrar dene.</li>
          </ul>
          <h2>İletişim</h2>
          <p>destek@dinletiyo.com</p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://dinletiyo.com/' },
                { '@type': 'ListItem', position: 2, name: 'Destek', item: 'https://dinletiyo.com/destek' },
              ],
            }),
          }}
        />
      </main>
    </div>
  );
}





