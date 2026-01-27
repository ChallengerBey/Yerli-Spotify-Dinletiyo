import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      const files = await readdir(uploadsDir);
      const fileDetails = await Promise.all(
        files
          .filter(file => !file.startsWith('.') && file !== 'README.md') // Gizli dosyaları ve README'yi filtrele
          .map(async (file) => {
            const filePath = path.join(uploadsDir, file);
            const stats = await stat(filePath);
            
            // Dosya türünü belirle
            const ext = path.extname(file).toLowerCase();
            let type: string;
            let category: string;
            
            if (ext === '.pdf') {
              type = 'pdf';
              category = file.toLowerCase().includes('finansal') ? 'finansal' :
                        file.toLowerCase().includes('pazarlama') ? 'pazarlama' :
                        file.toLowerCase().includes('sunum') ? 'sunum' : 'sunum';
            } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
              type = 'video';
              category = 'demo';
            } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
              type = 'audio';
              category = 'sunum';
            } else if (['.pptx', '.ppt'].includes(ext)) {
              type = 'presentation';
              category = file.toLowerCase().includes('analitik') ? 'teknik' : 'sunum';
            } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
              type = 'image';
              category = 'pazarlama';
            } else {
              type = 'document';
              category = 'sunum';
            }
            
            // Dosya boyutunu formatla
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
            
            // Açıklama oluştur
            let description = '';
            const fileName = file.toLowerCase();
            if (fileName.includes('sunum')) {
              description = 'Ana yatırımcı sunumu - iş modeli, büyüme planları';
            } else if (fileName.includes('finansal')) {
              description = '3 yıllık finansal tahminler ve gelir modeli';
            } else if (fileName.includes('demo')) {
              description = 'Dinletiyo platformunun canlı demo gösterimi';
            } else if (fileName.includes('pitch')) {
              description = 'CEO\'nun 5 dakikalık elevator pitch\'i';
            } else if (fileName.includes('analitik')) {
              description = 'Kullanıcı davranışları ve büyüme metrikleri';
            } else if (fileName.includes('pazarlama')) {
              description = 'Kullanıcı kazanım ve pazarlama planları';
            } else {
              description = 'Yatırımcı sunumu için hazırlanmış dosya';
            }
            
            return {
              id: file,
              name: file,
              type,
              category,
              size: `${sizeInMB} MB`,
              uploadDate: stats.mtime.toISOString().split('T')[0],
              url: `/uploads/${file}`,
              description
            };
          })
      );
      
      return NextResponse.json({ files: fileDetails });
    } catch (error) {
      // Klasör yoksa boş liste döndür
      return NextResponse.json({ files: [] });
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Failed to read uploads' }, { status: 500 });
  }
}