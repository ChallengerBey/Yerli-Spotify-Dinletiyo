import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');

    const token = getBearerToken(request);
    if (!token) {
      console.error('No auth token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseWithAuth = createClient(token);
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, file.size, file.type);

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ error: 'File must be an audio file' }, { status: 400 });
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 100MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `podcast-${user.id}-${uuidv4()}.${fileExtension}`;

    console.log('Generated filename:', fileName);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('File converted to buffer, size:', buffer.length);

    // Upload to Supabase Storage using authenticated client
    console.log('Starting upload to Supabase...');
    const { data: uploadData, error: uploadError } = await supabaseWithAuth.storage
      .from('podcast-audio')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({
        error: 'Failed to upload file',
        details: uploadError.message
      }, { status: 500 });
    }

    console.log('Upload successful:', uploadData);

    // Get public URL using authenticated client
    const { data: { publicUrl } } = supabaseWithAuth.storage
      .from('podcast-audio')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Unexpected error in file upload:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
