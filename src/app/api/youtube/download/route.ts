import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL gerekli' },
        { status: 400 }
      );
    }

    // İndirme klasörü
    const downloadDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // yt-dlp komutu
    const command = `yt-dlp -x --audio-format mp3 --audio-quality 192K -o "${downloadDir}/%(title)s.%(ext)s" "${url}"`;
    
    await execAsync(command);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Müzik başarıyla indirildi!' 
    });

  } catch (error) {
    console.error('İndirme hatası:', error);
    return NextResponse.json(
      { error: 'İndirme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}