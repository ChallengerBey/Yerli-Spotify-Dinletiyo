import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Uploads klasörünü oluştur
export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Dosya adını güvenli hale getir
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// Benzersiz dosya adı oluştur
export function generateUniqueFileName(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedName = sanitizeFileName(originalName);
  const nameWithoutExt = sanitizedName.split('.').slice(0, -1).join('.');
  const ext = sanitizedName.split('.').pop();
  
  return `${prefix}${timestamp}_${random}_${nameWithoutExt}.${ext}`;
}

// Dosyayı kaydet ve URL döndür
export async function saveFile(buffer: Buffer, fileName: string, subDir: string = ''): Promise<string> {
  await ensureUploadDir();
  
  const targetDir = subDir ? join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
  
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }
  
  const filePath = join(targetDir, fileName);
  await writeFile(filePath, buffer);
  
  // URL'yi döndür - /uploads/ dizinine göre
  const relativePath = subDir ? `${subDir}/${fileName}` : fileName;
  return `/uploads/${relativePath}`;
}

// Görsel dosyası kaydet
export async function saveImageFile(buffer: Buffer, originalName: string): Promise<string> {
  const fileName = generateUniqueFileName(originalName, 'img_');
  return await saveFile(buffer, fileName, 'images');
}

// Ses dosyası kaydet
export async function saveAudioFile(buffer: Buffer, originalName: string): Promise<string> {
  const fileName = generateUniqueFileName(originalName, 'audio_');
  return await saveFile(buffer, fileName, 'audio');
}
