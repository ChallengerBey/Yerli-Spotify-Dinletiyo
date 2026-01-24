import { NextResponse } from 'next/server';

// Sistem durumu (mock data)
let systemStatus = {
  maintenanceMode: false,
  serverStats: {
    cpu: Math.floor(Math.random() * 100),
    ram: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
    network: (Math.random() * 5).toFixed(1),
    connections: Math.floor(Math.random() * 2000),
    uptime: '15g 7s 23dk'
  }
};

// Duyurular
let announcements: any[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'status') {
      // Sunucu durumunu güncelle
      systemStatus.serverStats = {
        cpu: Math.floor(Math.random() * 100),
        ram: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        network: (Math.random() * 5).toFixed(1),
        connections: Math.floor(Math.random() * 2000),
        uptime: '15g 7s 23dk'
      };
      
      return NextResponse.json({
        success: true,
        data: systemStatus
      });
    }
    
    if (action === 'announcements') {
      return NextResponse.json({
        success: true,
        data: announcements
      });
    }
    
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    
    if (action === 'maintenance') {
      systemStatus.maintenanceMode = !systemStatus.maintenanceMode;
      return NextResponse.json({
        success: true,
        message: `Bakım modu ${systemStatus.maintenanceMode ? 'açıldı' : 'kapatıldı'}`,
        maintenanceMode: systemStatus.maintenanceMode
      });
    }
    
    if (action === 'cache-clear') {
      // Cache temizleme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({
        success: true,
        message: 'Cache başarıyla temizlendi'
      });
    }
    
    if (action === 'backup') {
      // Yedekleme simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        success: true,
        message: 'Veritabanı yedekleme başlatıldı'
      });
    }
    
    if (action === 'emergency-stop') {
      return NextResponse.json({
        success: true,
        message: '🚨 ACİL DURDURMA AKTİF! Tüm işlemler durduruldu.'
      });
    }
    
    if (action === 'announcement') {
      const newAnnouncement = {
        id: Date.now(),
        title: data.title,
        content: data.content,
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
    }
    
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}