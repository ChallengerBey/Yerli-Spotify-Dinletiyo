import { NextResponse } from 'next/server';

// Reklam filtreleme istatistikleri için mock data
export async function GET() {
  try {
    // Gerçek uygulamada bu veriler bir veritabanından gelecek
    const stats = {
      total_searches: 1247,
      total_videos_found: 18653,
      advertisements_filtered: 3421,
      child_content_filtered: 1876,
      suspicious_channels_blocked: 234,
      filter_success_rate: 92.3,
      top_filtered_keywords: [
        { keyword: 'reklam', count: 456 },
        { keyword: 'advertisement', count: 234 },
        { keyword: 'kids songs', count: 189 },
        { keyword: 'commercial', count: 167 },
        { keyword: 'cocomelon', count: 145 }
      ],
      daily_filter_activity: [
        { date: '2024-01-20', filtered: 234 },
        { date: '2024-01-21', filtered: 189 },
        { date: '2024-01-22', filtered: 267 },
        { date: '2024-01-23', filtered: 198 },
        { date: '2024-01-24', filtered: 245 },
        { date: '2024-01-25', filtered: 223 },
        { date: '2024-01-26', filtered: 289 }
      ]
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Filter stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter stats' },
      { status: 500 }
    );
  }
}