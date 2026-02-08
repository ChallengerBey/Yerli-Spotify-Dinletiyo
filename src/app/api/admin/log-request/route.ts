import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { ip, url, method, userAgent, timestamp } = await request.json();
    
    // Create logs directory if it doesn't exist
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Create Apache-style log entry
    const logEntry = `${ip} - - [${new Date(timestamp).toUTCString().replace('GMT', '+0000')}] "${method} ${url} HTTP/1.1" 200 - "-" "${userAgent}"\n`;
    
    // Write to access log
    const accessLogFile = path.join(logDir, 'access.log');
    fs.appendFileSync(accessLogFile, logEntry);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}