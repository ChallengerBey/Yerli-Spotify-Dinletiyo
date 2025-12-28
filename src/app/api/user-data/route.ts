import { NextRequest, NextResponse } from 'next/server';
import { 
  saveUserPreferences, 
  getUserPreferences, 
  saveFavoriteSong, 
  removeFavoriteSong, 
  getFavoriteSongs, 
  addRecentlyPlayedSong, 
  getRecentlyPlayedSongs 
} from '@/lib/auth';

// Kullanıcı tercihlerini kaydet
export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }
    
    const result = await saveUserPreferences(userId, preferences);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Kullanıcı tercihlerini getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ preferences: { artists: [], genres: [] } });
    }
    
    const preferences = await getUserPreferences(userId);
    return NextResponse.json({ preferences });
  } catch (error: any) {
    return NextResponse.json({ preferences: { artists: [], genres: [] } });
  }
}