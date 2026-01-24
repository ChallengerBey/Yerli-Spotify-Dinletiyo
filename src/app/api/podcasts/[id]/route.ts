import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const podcastId = id;

    console.log('Fetching podcast:', podcastId);

    // Get podcast details
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('podcast_id', podcastId)
      .single();

    if (podcastError || !podcast) {
      console.error('Podcast not found:', podcastError);
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    console.log('Found podcast:', podcast.id);

    // Get episodes for this podcast
    const { data: episodes, error: episodesError } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('podcast_id', podcast.id)
      .order('episode_number', { ascending: false });

    console.log('Episodes query result:', { episodes, episodesError });

    if (episodesError) {
      console.error('Error fetching episodes:', episodesError);
    }

    const result = {
      ...podcast,
      episodes: episodes || []
    };

    console.log('Returning podcast with episodes:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in podcast detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}