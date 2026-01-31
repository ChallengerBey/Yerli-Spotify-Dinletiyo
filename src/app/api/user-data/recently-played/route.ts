import { NextRequest, NextResponse } from 'next/server';

// Son çalınan şarkıları getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ recentlyPlayed: [] });
    }
    
    // LocalStorage'dan son çalınanları al (şimdilik)
    // Gerçek implementasyonda database'den alınacak
    const recentlyPlayed = JSON.parse(
      typeof window !== 'undefined' 
        ? localStorage.getItem('recentlyPlayed') || '[]'
        : '[]'
    );
    
    return NextResponse.json({ recentlyPlayed: recentlyPlayed.slice(0, 20) });
  } catch (error: any) {
    return NextResponse.json({ recentlyPlayed: [] });
  }
}

// Son çalınan şarkı ekle
export async function POST(request: NextRequest) {
  try {
    const { userId, song } = await request.json();
    
    if (!userId || !song) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı bilgileri gerekli' }, { status: 400 });
    }
    
    // Şimdilik localStorage'a ekle
    // Gerçek implementasyonda database'e eklenecek
    if (typeof window !== 'undefined') {
      const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      
      // Aynı şarkı varsa kaldır
      const filtered = recentlyPlayed.filter((s: any) => s.id !== song.id);
      
      // Başa ekle ve 50 ile sınırla
      const updated = [song, ...filtered].slice(0, 50);
      
      localStorage.setItem('recentlyPlayed', JSON.stringify(updated));
    }
    
    return NextResponse.json({ success: true, message: 'Son çalınanlar güncellendi' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}