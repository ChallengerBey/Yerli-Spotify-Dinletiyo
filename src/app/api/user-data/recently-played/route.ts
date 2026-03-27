import { NextRequest, NextResponse } from 'next/server';

// Son çalınan şarkıları getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ recentlyPlayed: [] });
    }
    
    // Not: Server route localStorage okuyamaz.
    // Şimdilik client local veriyi kullanıyoruz; bu endpoint boş dönebilir.
    return NextResponse.json({ recentlyPlayed: [] }, { headers: { 'Cache-Control': 'no-store' } });
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
    
    // Not: Server route localStorage yazamaz.
    // Gerçek implementasyonda DB/Supabase ile saklanmalı.
    return NextResponse.json({ success: true, message: 'OK' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}