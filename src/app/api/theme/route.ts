import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Kullanıcı yoksa default theme döndür
    if (userError || !user) {
      return NextResponse.json({ 
        theme: {
          theme_mode: 'dark',
          accent_color: '#ff0000',
          custom_theme: null
        }
      });
    }

    const { data, error } = await supabase
      .from('user_themes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      const { data: newTheme, error: insertError } = await supabase
        .from('user_themes')
        .insert({
          user_id: user.id,
          theme_mode: 'dark',
          accent_color: '#ff0000',
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ theme: newTheme });
    }

    return NextResponse.json({ theme: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theme_mode, accent_color, custom_theme } = body;

    const updateData: any = {};
    if (theme_mode) updateData.theme_mode = theme_mode;
    if (accent_color) updateData.accent_color = accent_color;
    if (custom_theme !== undefined) updateData.custom_theme = custom_theme;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_themes')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ theme: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
