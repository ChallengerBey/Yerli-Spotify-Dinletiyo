import { NextRequest, NextResponse } from 'next/server';
import { getBlockedIPs, addBlockedIP, removeBlockedIP } from '@/lib/anti-ddos/vercel-adapter';

// Get blocked IPs
export async function GET(request: NextRequest) {
  try {
    const ips = await getBlockedIPs();
    return NextResponse.json(ips);
  } catch (error) {
    console.error('Error reading blocked IPs:', error);
    return NextResponse.json([]);
  }
}

// Add IP to blocked list
export async function POST(request: NextRequest) {
  try {
    const { ip, reason } = await request.json();
    
    if (!ip) {
      return NextResponse.json({ error: 'IP address required' }, { status: 400 });
    }
    
    const success = await addBlockedIP(ip, reason || 'Manual');
    
    if (success) {
      console.log(`🚫 IP ${ip} added to blocked list - Reason: ${reason || 'Manual'}`);
      return NextResponse.json({ success: true, ip, blocked: true });
    } else {
      return NextResponse.json({ error: 'Failed to block IP' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error blocking IP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Remove IP from blocked list
export async function DELETE(request: NextRequest) {
  try {
    const { ip } = await request.json();
    
    if (!ip) {
      return NextResponse.json({ error: 'IP address required' }, { status: 400 });
    }
    
    const success = await removeBlockedIP(ip);
    
    if (success) {
      console.log(`✅ IP ${ip} removed from blocked list`);
      return NextResponse.json({ success: true, ip, blocked: false });
    } else {
      return NextResponse.json({ success: false, message: 'IP not found in blocked list' });
    }
  } catch (error) {
    console.error('Error unblocking IP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}