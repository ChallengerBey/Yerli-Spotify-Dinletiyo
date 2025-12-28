import { NextResponse } from 'next/server';

// Global duyurular
let announcements: any[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'all') {
      // Tüm duyurular (admin için)
      return NextResponse.json({
        success: true,
        announcements
      });
    }
    
    // Sadece son duyuru (banner için)
    return NextResponse.json({
      success: true,
      announcements: announcements.slice(0, 1)
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();
    
    const newAnnouncement = {
      id: Date.now(),
      title,
      content,
      timestamp: new Date().toISOString(),
      author: 'Admin'
    };
    
    announcements.unshift(newAnnouncement);
    announcements = announcements.slice(0, 10); // Son 10 duyuru
    
    return NextResponse.json({
      success: true,
      message: 'Duyuru başarıyla gönderildi',
      announcement: newAnnouncement
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Belirli duyuruyu sil
      announcements = announcements.filter(a => a.id !== parseInt(id));
      return NextResponse.json({
        success: true,
        message: 'Duyuru silindi'
      });
    } else {
      // Tüm duyuruları sil
      announcements = [];
      return NextResponse.json({
        success: true,
        message: 'Tüm duyurular silindi'
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}