import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface QueuedSong {
  song: any;
  userId: string;
  queuedAt: string;
  playNext: boolean; // true for play next, false for add to queue
}

// Kuyruğa şarkı ekle
export async function POST(request: NextRequest) {
  try {
    const { userId, song, playNext } = await request.json();
    
    if (!userId || !song) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı bilgileri gerekli' }, { status: 400 });
    }
    
    // Kuyruk verisini dosyadan oku
    const queuePath = path.join(process.cwd(), 'data', 'queue.json');
    let queueData: QueuedSong[] = [];
    
    if (fs.existsSync(queuePath)) {
      const data = fs.readFileSync(queuePath, 'utf8');
      queueData = JSON.parse(data);
    }
    
    // Yeni şarkı ekle
    const newEntry: QueuedSong = {
      song,
      userId,
      queuedAt: new Date().toISOString(),
      playNext: playNext || false
    };
    
    // Eğer playNext true ise, şarkıyı listenin başına ekle
    if (playNext) {
      queueData.unshift(newEntry);
    } else {
      // Aksi takdirde listenin sonuna ekle
      queueData.push(newEntry);
    }
    
    // Kuyruk verisini dosyaya yaz
    const dataDir = path.dirname(queuePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(queuePath, JSON.stringify(queueData, null, 2));
    
    return NextResponse.json({ success: true, message: playNext ? 'Şarkı bir sonraki sıraya eklendi.' : 'Şarkı kuyruğa eklendi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Kullanıcının kuyruğunu getir
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }
    
    // Kuyruk verisini dosyadan oku
    const queuePath = path.join(process.cwd(), 'data', 'queue.json');
    let queueData: QueuedSong[] = [];
    
    if (fs.existsSync(queuePath)) {
      const data = fs.readFileSync(queuePath, 'utf8');
      queueData = JSON.parse(data);
    }
    
    // Sadece bu kullanıcıya ait olanları filtrele
    const userQueue = queueData.filter(item => item.userId === userId);
    
    return NextResponse.json({ queue: userQueue.map(item => item.song) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Kuyruktan şarkı kaldır
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const songId = request.nextUrl.searchParams.get('songId');
    
    if (!userId || !songId) {
      return NextResponse.json({ error: 'Kullanıcı ID ve şarkı ID gerekli' }, { status: 400 });
    }
    
    // Kuyruk verisini dosyadan oku
    const queuePath = path.join(process.cwd(), 'data', 'queue.json');
    let queueData: QueuedSong[] = [];
    
    if (fs.existsSync(queuePath)) {
      const data = fs.readFileSync(queuePath, 'utf8');
      queueData = JSON.parse(data);
    }
    
    // Şarkıyı kuyruktan kaldır
    queueData = queueData.filter(item => !(item.userId === userId && item.song.id === songId));
    
    // Güncellenmiş kuyruk verisini dosyaya yaz
    fs.writeFileSync(queuePath, JSON.stringify(queueData, null, 2));
    
    return NextResponse.json({ success: true, message: 'Şarkı kuyruktan kaldırıldı.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}