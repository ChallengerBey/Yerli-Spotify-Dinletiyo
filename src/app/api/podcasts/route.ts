import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific podcast with episodes
      const { data: podcast, error: podcastError } = await supabase
        .from('podcasts')
        .select('*')
        .eq('podcast_id', id)
        .eq('is_active', true)
        .single();

      if (podcastError) {
        return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
      }

      const { data: episodes, error: episodesError } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('podcast_id', podcast.id)
        .order('publish_date', { ascending: false });

      if (episodesError) {
        console.error('Error fetching episodes:', episodesError);
      }

      return NextResponse.json({
        ...podcast,
        episodes: episodes || []
      });
    } else {
      // Get all podcasts
      const { data: podcasts, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching podcasts:', error);
        return NextResponse.json({ error: 'Failed to fetch podcasts' }, { status: 500 });
      }

      return NextResponse.json(podcasts);
    }
  } catch (error) {
    console.error('Error in podcasts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { podcast_id, title, author, description, image_url, rss_feed_url, category, language } = body;

    if (!podcast_id || !title || !author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('podcasts')
      .insert({
        podcast_id,
        title,
        author,
        description,
        image_url,
        rss_feed_url,
        category,
        language: language || 'tr'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating podcast:', error);
      return NextResponse.json({ error: 'Failed to create podcast' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in podcasts POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
