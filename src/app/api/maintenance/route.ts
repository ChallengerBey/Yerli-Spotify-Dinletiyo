import { NextResponse } from 'next/server';

// Global bakım modu durumu
let maintenanceMode = false;

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      maintenanceMode
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
    const { action } = await request.json();
    
    if (action === 'toggle') {
      maintenanceMode = !maintenanceMode;
      return NextResponse.json({
        success: true,
        maintenanceMode,
        message: `Bakım modu ${maintenanceMode ? 'açıldı' : 'kapatıldı'}`
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