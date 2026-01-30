import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's podcast subscriptions with podcast details
    const { data: subscriptions, error } = await supabase
      .from('user_podcast_subscriptions')
      .select(`
        id,
        created_at,
        podcasts (
          id,
          podcast_id,
          title,
          author,
          description,
          image_url,
          category,
          total_episodes,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error in subscriptions GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { podcast_id } = body;

    if (!podcast_id) {
      return NextResponse.json({ error: 'podcast_id is required' }, { status: 400 });
    }

    // Check if podcast exists
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('id')
      .eq('podcast_id', podcast_id)
      .eq('is_active', true)
      .single();

    if (podcastError || !podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    // Check if already subscribed
    const { data: existingSub } = await supabase
      .from('user_podcast_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('podcast_id', podcast.id)
      .single();

    if (existingSub) {
      return NextResponse.json({ error: 'Already subscribed to this podcast' }, { status: 409 });
    }

    // Create subscription
    const { data, error } = await supabase
      .from('user_podcast_subscriptions')
      .insert({
        user_id: user.id,
        podcast_id: podcast.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({
      ...data,
      message: 'Successfully subscribed to podcast'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in subscribe POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const podcastId = searchParams.get('podcast_id');

    if (!podcastId) {
      return NextResponse.json({ error: 'podcast_id query parameter is required' }, { status: 400 });
    }

    // Get podcast by podcast_id
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .select('id')
      .eq('podcast_id', podcastId)
      .single();

    if (podcastError || !podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    // Delete subscription
    const { error } = await supabase
      .from('user_podcast_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('podcast_id', podcast.id);

    if (error) {
      console.error('Error deleting subscription:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Successfully unsubscribed from podcast'
    });

  } catch (error) {
    console.error('Error in unsubscribe DELETE API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
