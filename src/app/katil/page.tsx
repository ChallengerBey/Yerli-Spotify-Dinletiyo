import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Katıl | Dinletiyo',
  description: 'Topluluğa katıl ve yeni özellikleri ilk sen dene.',
  alternates: { canonical: 'https://dinletiyo.com/katil' },
};

export default function KatilPage() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-auto"><Logo /></Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/destek" className="hover:underline">Destek</Link>
            <Link href="/market" className="hover:underline">Market</Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        <div className="prose prose-invert mx-auto max-w-3xl bg-card p-8 rounded-lg">
          <h1 className="font-headline text-4xl font-bold">Katıl</h1>
          <p className="text-lg text-muted-foreground">Topluluğumuza katıl.</p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://dinletiyo.com/' },
                { '@type': 'ListItem', position: 2, name: 'Katıl', item: 'https://dinletiyo.com/katil' },
              ],
            }),
          }}
        />
      </main>
    </div>
  );
}





