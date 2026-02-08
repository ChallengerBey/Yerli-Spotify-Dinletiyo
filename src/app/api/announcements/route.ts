import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Anonim client - auth sistemini tamamen devre dışı bırak
    const supabase = createClient();
    
    // Sadece aktif duyuruları döndür - hiçbir auth kontrolü yok
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('Announcements fetch error:', error);
      // Hata olursa boş array döndür
      return NextResponse.json({
        success: true,
        announcements: []
      });
    }
    
    return NextResponse.json({
      success: true,
      announcements: announcements || []
    });
  } catch (error: any) {
    console.error('Announcements GET error:', error);
    // Her türlü hatada boş array döndür
    return NextResponse.json({
      success: true,
      announcements: []
    });
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: Request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}