import { createClient } from '@/lib/supabase/server';

export async function uploadToSupabaseStorage(
  file: Buffer,
  fileName: string,
  bucket: string = 'podcasts'
): Promise<string> {
  const supabase = createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: getContentType(fileName),
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Public URL'i al
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4'
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

export async function deleteFromSupabaseStorage(
  fileName: string,
  bucket: string = 'podcasts'
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    throw error;
  }
}
