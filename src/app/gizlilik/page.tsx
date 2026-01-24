import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            <h1 className="font-headline text-4xl font-bold">Gizlilik Politikası</h1>
            <p className="text-lg text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            
            <p>Dinletiyo'ya hoş geldiniz. Gizliliğiniz bizim için önemlidir. Bu gizlilik politikası, hizmetlerimizi kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklamaktadır.</p>

            <h2>Topladığımız Bilgiler</h2>
            <p>Sizden aşağıdaki bilgileri toplayabiliriz:</p>
            <ul>
                <li><strong>Hesap Bilgileri:</strong> Kaydolduğunuzda kullanıcı adınız, e-posta adresiniz ve şifreniz (güvenli bir şekilde hash'lenmiş olarak) gibi bilgileri toplarız.</li>
                <li><strong>Kullanım Bilgileri:</strong> Dinlediğiniz şarkılar, oluşturduğunuz çalma listeleri ve etkileşimde bulunduğunuz diğer içerikler hakkında bilgi toplarız.</li>
                <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü ve işletim sistemi gibi standart web günlük bilgilerini toplarız.</li>
            </ul>

            <h2>Bilgilerinizi Nasıl Kullanırız?</h2>
            <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul>
                <li>Hizmetlerimizi sağlamak, sürdürmek ve iyileştirmek.</li>
                <li>Deneyiminizi kişiselleştirmek ve size özel müzik önerileri sunmak.</li>
                <li>Sizinle iletişim kurmak.</li>
                <li>Hizmetlerimizin güvenliğini ve bütünlüğünü korumak.</li>
            </ul>

            <h2>Bilgi Paylaşımı</h2>
            <p>Yasal zorunluluklar olmadıkça, kişisel bilgilerinizi izniniz olmadan üçüncü taraflarla paylaşmayız. (Bu bir demo uygulamasıdır ve hiçbir veri ticari olarak kullanılmaz veya paylaşılmaz.)</p>

            <h2>Veri Güvenliği</h2>
            <p>Bilgilerinizi korumak için makul güvenlik önlemleri alıyoruz. Ancak, internet üzerinden hiçbir iletim yönteminin veya elektronik depolama yönteminin %100 güvenli olmadığını unutmayın.</p>

            <h2>Değişiklikler</h2>
            <p>Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada yayınlanacaktır.</p>

            <p>Sorularınız varsa, lütfen bizimle iletişime geçin.</p>
            </div>
        </main>
    </div>
  );
}
