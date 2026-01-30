import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getBearerToken(request: Request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Podcast create API called');

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

    // Use authenticated client for all operations
    const body = await request.json();
    console.log('Request body:', body);

    const {
      podcast_id,
      title,
      author,
      description,
      image_url,
      rss_feed_url,
      category,
      language,
      episodes = []
    } = body;

    if (!podcast_id || !title || !author) {
      return NextResponse.json({
        error: 'Missing required fields: podcast_id, title, author'
      }, { status: 400 });
    }

    // Check if podcast already exists
    const { data: existingPodcast, error: checkError } = await supabaseWithAuth
      .from('podcasts')
      .select('id')
      .eq('podcast_id', podcast_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing podcast:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingPodcast) {
      return NextResponse.json({
        error: 'Podcast with this ID already exists'
      }, { status: 409 });
    }

    // Create podcast
    const { data: podcast, error: podcastError } = await supabaseWithAuth
      .from('podcasts')
      .insert({
        podcast_id,
        title,
        author,
        description,
        image_url,
        rss_feed_url,
        category,
        language: language || 'tr',
        total_episodes: episodes.length
      })
      .select()
      .single();

    if (podcastError) {
      console.error('Error creating podcast:', podcastError);
      return NextResponse.json({ error: 'Failed to create podcast' }, { status: 500 });
    }

    // Create episodes if provided
    if (episodes.length > 0) {
      console.log('Creating episodes:', episodes.length);
      const episodesData = episodes.map((episode: any) => ({
        podcast_id: podcast.id,
        episode_id: episode.episode_id || `${podcast_id}-${Date.now()}-${Math.random()}`,
        title: episode.title,
        description: episode.description,
        audio_url: episode.audio_url,
        duration_ms: episode.duration_ms,
        episode_number: episode.episode_number,
        season_number: episode.season_number,
        publish_date: episode.publish_date,
        image_url: episode.image_url
      }));

      console.log('Episodes data to insert:', episodesData);

      const { data: insertedEpisodes, error: episodesError } = await supabaseWithAuth
        .from('podcast_episodes')
        .insert(episodesData)
        .select();

      console.log('Episodes insert result:', { insertedEpisodes, episodesError });

      if (episodesError) {
        console.error('Error creating episodes:', episodesError);
        // Don't fail the whole request if episodes fail
      }
    }

    return NextResponse.json({
      ...podcast,
      message: 'Podcast created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in create podcast API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
