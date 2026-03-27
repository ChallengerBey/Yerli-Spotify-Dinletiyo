import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;

    if (!file || !title || !artist) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upload file to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('songs')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('songs')
      .getPublicUrl(fileName);

    // Create song record
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert({
        title,
        artist,
        uploaded_by: user.id,
        file_url: publicUrl.publicUrl,
        file_size_bytes: file.size,
        is_active: true,
      })
      .select();

    if (songError) throw songError;

    // Log the action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action_type: 'upload_song',
        target_content_type: 'song',
        target_content_id: songData?.[0].id,
        description: `Song uploaded: ${title} by ${artist}`,
      });

    return NextResponse.json(songData?.[0]);
  } catch (error) {
    console.error('Error uploading song:', error);
    return NextResponse.json({ error: 'Failed to upload song' }, { status: 500 });
  }
}
