import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-secondary/30">
        <header className="bg-background">
            <div className="container flex h-16 items-center">
                <Link href="/" className="mr-auto">
                    <Logo />
                </Link>
            </div>
        </header>
        <main className="container py-12">
            <div className="prose prose-invert mx-auto max-w-3xl bg-card p-8 rounded-lg">
                <h1 className="font-headline text-4xl font-bold">Kullanım Koşulları</h1>
                <p className="text-lg text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

                <p>Dinletiyo ("Hizmet") hizmetlerini kullandığınız için teşekkür ederiz. Bu hizmeti kullanarak, aşağıdaki koşulları kabul etmiş olursunuz.</p>

                <h2>1. Hizmetin Kullanımı</h2>
                <p>Bu hizmet yalnızca kişisel, ticari olmayan kullanım ve gösterim amaçlıdır. Hizmeti yasa dışı veya bu koşulları ihlal eden herhangi bir amaçla kullanamazsınız.</p>
                
                <h2>2. İçerik</h2>
                <p>Hizmette bulunan müzikler, albüm kapakları ve diğer içerikler, Last.fm gibi üçüncü taraf API'lerinden alınmıştır ve yalnızca gösterim amaçlıdır. Bu içeriklerin mülkiyeti ilgili hak sahiplerine aittir. Dinletiyo, bu içeriklerin doğruluğu veya kullanılabilirliği konusunda hiçbir garanti vermez.</p>

                <h2>3. Sorumluluk Reddi</h2>
                <p>Bu uygulama bir **demo projesidir** ve "olduğu gibi" sunulmaktadır. Hizmetin kesintisiz veya hatasız olacağını garanti etmiyoruz. Uygulamanın kullanımından kaynaklanan herhangi bir doğrudan veya dolaylı zarardan sorumlu değiliz.</p>
                
                <h2>4. Hesaplar</h2>
                <p>Hesap oluştururken sağladığınız bilgilerin doğru olmasından siz sorumlusunuz. Hesabınızın güvenliğini sağlamak sizin sorumluluğunuzdadır.</p>

                <h2>5. Koşulların Değiştirilmesi</h2>
                <p>Bu koşulları zaman zaman değiştirebiliriz. Değişiklikler bu sayfada yayınlandığı andan itibaren geçerli olacaktır.</p>

                <p>Hizmeti kullanmaya devam ederek, güncellenmiş koşulları kabul etmiş sayılırsınız.</p>
            </div>
        </main>
    </div>
  );
}
