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
                <p className="text-lg text-muted-foreground">Son Güncelleme: 28.01.2026</p>

                <h2>1. Taraflar ve Tanımlar</h2>
                <p>Bu Kullanım Koşulları ("Koşullar"), Dinletiyo platformu ("Hizmet") ile siz değerli kullanıcılarımız ("Kullanıcı") arasındaki yasal anlaşmayı oluşturur. Hizmetimize erişerek veya kullanarak bu Koşulları kabul etmiş sayılırsınız.</p>

                <h2>2. Hizmetin Kapsamı ve Kullanımı</h2>
                <p>Dinletiyo, bir medya teknolojisi platformu olup, kullanıcılara müzik ve podcast içeriklerine erişim ve yayıncılar için interaktif araçlar sunar. Hizmeti yasa dışı amaçlarla veya bu koşulları ihlal edecek şekilde kullanamazsınız. Hizmeti kullanmak için 18 yaşından büyük olmanız veya yasal velinizin iznine sahip olmanız gerekmektedir.</p>
                
                <h2>3. İçerik ve Fikri Mülkiyet</h2>
                <p><strong>Üçüncü Taraf İçerikleri:</strong> Hizmetimiz aracılığıyla erişilen müzikler ve diğer medya içerikleri, platformumuz tarafından erişilen ve indekslenen halka açık üçüncü taraf kaynaklardan elde edilebilir. Bu içeriklerin fikri mülkiyet hakları ilgili sahiplerine aittir. Dinletiyo, bu içeriklerin sahibi değildir ve yasal uygunluğu konusunda bir garanti vermez. İçeriklerin kullanımından doğacak her türlü hukuki sorumluluk Kullanıcı'ya aittir.</p>
                <p><strong>Dinletiyo Mülkiyeti:</strong> Dinletiyo logosu, arayüz tasarımları, yazılım kodları ve markası ("Dinletiyo Mülkiyeti") tamamen şirketimize aittir ve izinsiz kullanılamaz.</p>

                <h2>4. Sorumluluk Reddi (Disclaimer of Warranties)</h2>
                <p>Hizmetimiz, "olduğu gibi" ve "mevcut olduğu şekliyle" sunulmaktadır. Platformun kesintisiz, hatasız veya tamamen güvenli olacağını taahhüt etmiyoruz. Hizmetin kullanımından kaynaklanabilecek veri kayıpları veya dolaylı zararlardan Dinletiyo sorumlu tutulamaz.</p>

                <h2>5. Yasaklı Faaliyetler</h2>
                <p>Kullanıcılar; platforma virüs bulaştıramaz, tersine mühendislik yapamaz, scraping altyapısını kopyalayamaz veya hizmeti spam amacıyla kullanamaz. Bu tür faaliyetler, hesabın derhal sonlandırılmasına neden olacaktır.</p>
                
                <h2>6. Hesabın Askıya Alınması ve Sonlandırılması</h2>
                <p>Dinletiyo, bu koşulların ihlali durumunda herhangi bir kullanıcının hesabını önceden haber vermeksizin askıya alma veya kalıcı olarak sonlandırma hakkını saklı tutar.</p>

                <h2>7. Koşulların Değiştirilmesi</h2>
                <p>Bu koşulları zaman zaman değiştirebiliriz. Değişiklikler bu sayfada yayınlandığı andan itibaren geçerli olacaktır. Hizmeti kullanmaya devam ederek, güncellenmiş koşulları kabul etmiş sayılırsınız.</p>

                <h2>8. İletişim</h2>
                <p>Koşullarla ilgili sorularınız için <a href="mailto:ergilisemih7@gmail.com" className="text-primary hover:underline">ergilisemih7@gmail.com</a> adresinden bize ulaşabilirsiniz.</p>
            </div>
        </main>
    </div>
  );
}
