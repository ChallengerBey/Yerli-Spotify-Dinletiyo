import { NextRequest, NextResponse } from 'next/server';
import { saveFavoriteSong, removeFavoriteSong, getFavoriteSongs } from '@/lib/auth';

// Favori şarkıları getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ favorites: [] });
    }
    
    const favorites = await getFavoriteSongs(userId);
    return NextResponse.json({ favorites });
  } catch (error: any) {
    return NextResponse.json({ favorites: [] });
  }
}

// Favori şarkı ekle
export async function POST(request: NextRequest) {
  try {
    const { userId, song } = await request.json();
    
    if (!userId || !song) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı bilgileri gerekli' }, { status: 400 });
    }
    
    const result = await saveFavoriteSong(userId, song);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Favori şarkı kaldır
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const songId = request.nextUrl.searchParams.get('songId');
    
    if (!userId || !songId) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı ID gerekli' }, { status: 400 });
    }
    
    const result = await removeFavoriteSong(userId, songId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}