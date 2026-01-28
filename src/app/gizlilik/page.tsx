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
            <p className="text-lg text-muted-foreground">Son Güncelleme: 28.01.2026</p>
            
            <p>Dinletiyo'ya hoş geldiniz. Gizliliğiniz, iş modelimizin merkezinde yer almaktadır. Bu politika, hizmetlerimizi kullandığınızda verilerinizi nasıl topladığımızı, işlediğimizi ve paylaştığımızı şeffaf bir şekilde açıklamaktadır.</p>

            <h2>1. Topladığımız Bilgiler</h2>
            <p><strong>Hesap Bilgileri:</strong> Kullanıcı adı, e-posta adresi, şifre (hash'lenmiş).</p>
            <p><strong>Kullanım Verileri:</strong> Dinlenen şarkılar, oluşturulan çalma listeleri, yayıncı botu etkileşimleri ve favori türler.</p>
            <p><strong>Cihaz ve Teknik Veriler:</strong> IP adresi, tarayıcı türü, işletim sistemi ve cihaz modeli gibi anonim teknik bilgiler.</p>

            <h2>2. Bilgilerinizi Nasıl ve Neden Kullanırız?</h2>
            <p><strong>Hizmeti Sağlamak ve İyileştirmek:</strong> Platformun stabil çalışması, hata tespiti ve performans optimizasyonu için.</p>
            <p><strong>Kişiselleştirme:</strong> Size özel müzik ve podcast önerileri sunan algoritmalarımızı eğitmek için.</p>
            <p><strong>İletişim:</strong> Hizmet güncellemeleri ve kullanıcı desteği sağlamak için.</p>
            <p><strong>Pazar Analizi ve B2B Raporlama (Önemli):</strong> Topladığımız kullanım verilerini anonimleştirerek ve toplu hale getirerek, müzik endüstrisi ve yapay zeka şirketleri için trend analizleri ve pazar içgörüleri oluştururuz. Bu raporlar, hiçbir şekilde kişisel kimliğinizi ifşa etmez veya tekil kullanıcı davranışlarını içermez.</p>

            <h2>3. Bilgi Paylaşımı</h2>
            <p>Kişisel bilgileriniz, izniniz olmadan veya yasal bir zorunluluk bulunmadıkça pazarlama amacıyla üçüncü taraflarla kesinlikle paylaşılmaz. Veri paylaşımı şu durumlarla sınırlıdır:</p>
            <p><strong>Yasal Yükümlülükler:</strong> Mahkeme kararları gibi yasal talepler doğrultusunda.</p>
            <p><strong>Hizmet Sağlayıcılar:</strong> Altyapımızı destekleyen bulut servisleri (Vercel, Supabase vb.) gibi iş ortaklarımızla, sadece hizmetin gerektirdiği ölçüde.</p>
            <p><strong>Anonimleştirilmiş Veri Analitiği:</strong> Müzik trendleri hakkında hazırladığımız, kişisel veri içermeyen toplu analiz raporları, iş ortaklarımızla paylaşılabilir.</p>

            <h2>4. Kullanıcı Haklarınız (KVKK)</h2>
            <p>KVKK kapsamında verilerinize erişme, onları düzeltme, silme ve işlenmesine itiraz etme hakkına sahipsiniz. Bu haklarınızı kullanmak için <a href="mailto:destek@dinletiyo.com" className="text-primary hover:underline">destek@dinletiyo.com</a> adresinden bize ulaşabilirsiniz.</p>

            <h2>5. Veri Güvenliği</h2>
            <p>Bilgilerinizi korumak için sektör standardı güvenlik önlemleri (şifreleme, erişim kontrolü vb.) alıyoruz. Ancak %100 güvenliğin garanti edilemeyeceğini unutmayın.</p>

            <h2>6. Değişiklikler ve İletişim</h2>
            <p>Bu politikayı zaman zaman güncelleyebiliriz. Tüm değişiklikler bu sayfada yayınlanacaktır. Sorularınız için <a href="mailto:ergilisemih7@gmail.com" className="text-primary hover:underline">ergilisemih7@gmail.com</a> adresinden bize ulaşabilirsiniz.</p>
            </div>
        </main>
    </div>
  );
}
