import { NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a proper logging system)
let requestLogs: any[] = [];

export async function GET() {
  try {
    // Generate some sample request logs if empty
    if (requestLogs.length === 0) {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const urls = [
        '/api/songs',
        '/api/users',
        '/api/playlists',
        '/api/now-playing',
        '/api/favorites',
        '/api/analytics',
        '/api/admin/stats',
        '/home',
        '/home/search',
        '/home/library',
        '/overlay/123',
      ];
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      ];

      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 3600000); // Last hour
        const method = methods[Math.floor(Math.random() * methods.length)];
        const url = urls[Math.floor(Math.random() * urls.length)];
        const status = Math.random() > 0.1 ? 
          (Math.random() > 0.8 ? 201 : 200) : // 90% success, 10% error
          (Math.random() > 0.5 ? 404 : 500);
        
        requestLogs.push({
          id: `log-${i}`,
          method,
          url,
          status,
          response_time: Math.floor(Math.random() * 500) + 10,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
          timestamp: timestamp.toISOString(),
        });
      }
    }

    // Sort by timestamp (newest first) and return last 100
    const sortedLogs = requestLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);

    return NextResponse.json(sortedLogs);
  } catch (error) {
    console.error('Request logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request logs' },
      { status: 500 }
    );
  }
}

// Function to add new log entry (would be called by middleware in production)
export function addRequestLog(logEntry: any) {
  requestLogs.unshift(logEntry);
  // Keep only last 1000 logs
  if (requestLogs.length > 1000) {
    requestLogs = requestLogs.slice(0, 1000);
  }
}