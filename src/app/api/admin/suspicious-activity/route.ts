import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory suspicious activity tracking
const suspiciousActivity = new Map<string, { count: number; lastSeen: number; reasons: string[] }>();

export async function POST(request: NextRequest) {
  try {
    const { ip, url, reason, timestamp } = await request.json();
    
    // Create logs directory if it doesn't exist
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Log suspicious activity
    const logEntry = `${timestamp} - SUSPICIOUS: ${ip} -> ${url} - Reason: ${reason}\n`;
    const suspiciousLogFile = path.join(logDir, 'suspicious.log');
    fs.appendFileSync(suspiciousLogFile, logEntry);
    
    // Track in memory
    const now = Date.now();
    if (!suspiciousActivity.has(ip)) {
      suspiciousActivity.set(ip, { count: 1, lastSeen: now, reasons: [reason] });
    } else {
      const activity = suspiciousActivity.get(ip)!;
      activity.count++;
      activity.lastSeen = now;
      if (!activity.reasons.includes(reason)) {
        activity.reasons.push(reason);
      }
    }
    
    // Auto-block if too many suspicious activities
    const activity = suspiciousActivity.get(ip)!;
    if (activity.count >= 5) { // 5 suspicious activities = auto-block
      console.log(`🚨 Auto-blocking IP ${ip} due to ${activity.count} suspicious activities: ${activity.reasons.join(', ')}`);
      
      // Add to blocked list
      const blockedFile = path.join(logDir, 'blocked-ips.json');
      let blockedIPs = [];
      
      if (fs.existsSync(blockedFile)) {
        const data = fs.readFileSync(blockedFile, 'utf8');
        blockedIPs = JSON.parse(data);
      }
      
      if (!blockedIPs.includes(ip)) {
        blockedIPs.push(ip);
        fs.writeFileSync(blockedFile, JSON.stringify(blockedIPs, null, 2));
        
        // Log the auto-block
        const blockLogEntry = `${new Date().toISOString()} - AUTO-BLOCKED: ${ip} - Suspicious activities: ${activity.reasons.join(', ')}\n`;
        const blockedLogFile = path.join(logDir, 'blocked.log');
        fs.appendFileSync(blockedLogFile, blockLogEntry);
      }
      
      // Clear from suspicious activity tracking
      suspiciousActivity.delete(ip);
    }
    
    return NextResponse.json({ success: true, autoBlocked: activity.count >= 5 });
  } catch (error) {
    console.error('Error logging suspicious activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get suspicious activity stats
export async function GET(request: NextRequest) {
  try {
    const stats = Array.from(suspiciousActivity.entries()).map(([ip, activity]) => ({
      ip,
      count: activity.count,
      lastSeen: new Date(activity.lastSeen).toISOString(),
      reasons: activity.reasons
    }));
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting suspicious activity stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}