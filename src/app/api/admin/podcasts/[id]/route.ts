import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    // Delete episodes first (cascade should handle this, but being explicit)
    const { error: episodesError } = await supabase
      .from('podcast_episodes')
      .delete()
      .eq('podcast_id', id);

    if (episodesError) {
      console.error('Error deleting episodes:', episodesError);
    }

    // Delete podcast
    const { error: podcastError } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', id);

    if (podcastError) {
      console.error('Error deleting podcast:', podcastError);
      return NextResponse.json({ error: 'Failed to delete podcast' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Podcast deleted successfully' });

  } catch (error) {
    console.error('Error in delete podcast API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();

    const { error } = await supabase
      .from('podcasts')
      .update(body)
      .eq('id', id);

    if (error) {
      console.error('Error updating podcast:', error);
      return NextResponse.json({ error: 'Failed to update podcast' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Podcast updated successfully' });

  } catch (error) {
    console.error('Error in update podcast API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}