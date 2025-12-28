import { NextResponse } from 'next/server';

// Global IP ban listesi (server memory'de)
let bannedIPs: string[] = [];

export async function POST(request: Request) {
  try {
    const { action, ip } = await request.json();
    
    if (action === 'ban') {
      if (!bannedIPs.includes(ip)) {
        bannedIPs.push(ip);
      }
      return NextResponse.json({ success: true, message: `IP ${ip} banlandı!` });
    }
    
    if (action === 'unban') {
      bannedIPs = bannedIPs.filter(bannedIP => bannedIP !== ip);
      return NextResponse.json({ success: true, message: `IP ${ip} ban kaldırıldı!` });
    }
    
    if (action === 'check') {
      const isBanned = bannedIPs.includes(ip);
      return NextResponse.json({ banned: isBanned });
    }
    
    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({ bannedIPs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    bannedIPs = [];
    return NextResponse.json({ success: true, message: 'Tüm IP banları kaldırıldı!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}