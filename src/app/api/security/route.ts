import { NextResponse } from 'next/server';

// Global güvenlik logları (server memory'de)
let securityLogs: any[] = [];

export async function POST(request: Request) {
  try {
    const logData = await request.json();
    
    // Log ekle
    securityLogs.unshift(logData);
    
    // Son 100 logu tut
    securityLogs = securityLogs.slice(0, 100);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({ logs: securityLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    securityLogs = [];
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}