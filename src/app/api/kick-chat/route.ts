import { NextRequest, NextResponse } from 'next/server';

// Şarkı isteği anahtar kelimeleri
const SONG_KEYWORDS = ['!istekşarkı', '!istek', '!song', '!request', '!şarkı', '!sarki', '!music'];

// In-memory storage (production'da Redis kullan)
const chatConnections = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel');
  const action = searchParams.get('action');

  if (!channel) {
    return NextResponse.json({ error: 'Channel required' }, { status: 400 });
  }

  try {
    if (action === 'connect') {
      // Kick WebSocket'e bağlan
      const chatroomId = await getChatroomId(channel);
      
      if (!chatroomId) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        chatroomId,
        message: 'Connected to channel'
      });
    }

    if (action === 'messages') {
      // Son mesajları getir (demo)
      return NextResponse.json({
        success: true,
        messages: []
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Kick chat error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function getChatroomId(channelName: string): Promise<string | null> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };

    const endpoints = [
      `https://kick.com/api/v2/channels/${channelName}`,
      `https://kick.com/api/v1/channels/${channelName}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { headers });
        
        if (response.ok) {
          const data = await response.json();
          return data.chatroom?.id || data.id || null;
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting chatroom ID:', error);
    return null;
  }
}

export const runtime = 'edge';
