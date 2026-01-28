import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate system metrics (in production, you'd get these from actual system monitoring)
    const metrics = {
      cpu_usage: Math.random() * 80 + 10, // 10-90%
      memory_usage: Math.random() * 70 + 20, // 20-90%
      disk_usage: Math.random() * 60 + 30, // 30-90%
      network_in: Math.random() * 1024 * 1024, // Random bytes/s
      network_out: Math.random() * 1024 * 1024, // Random bytes/s
      active_connections: Math.floor(Math.random() * 100) + 50, // 50-150 connections
      response_time: Math.floor(Math.random() * 200) + 50, // 50-250ms
      uptime: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7), // Up to 7 days
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('System metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}