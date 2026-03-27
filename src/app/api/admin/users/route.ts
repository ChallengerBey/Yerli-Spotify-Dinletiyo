import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Handle missing environment variables gracefully
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Uygunsuz kelimeleri filtrele
const filterInappropriateContent = (username: string) => {
  const inappropriateWords = [
    'sikis', 'sik', 'amk', 'orospu', 'piç', 'göt', 'yarrak', 'am', 'pussy', 'fuck', 'shit', 'bitch',
    'sex', 'porn', 'xxx', 'anal', 'oral', 'nude', 'naked', 'dick', 'cock', 'ass', 'boob', 'tit'
  ];
  
  const lowerUsername = username.toLowerCase();
  return inappropriateWords.some(word => lowerUsername.includes(word));
};

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase yapılandırılmadı' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, user_metadata, created_at');

    if (error) throw error;

    // Kullanıcı adlarını kontrol et ve işaretle
    const usersWithFlags = (data || []).map(user => ({
      ...user,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'Unknown',
      is_inappropriate: filterInappropriateContent(user.user_metadata?.username || user.email?.split('@')[0] || '')
    }));

    return NextResponse.json(usersWithFlags);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Kullanıcı adını güncelle
export async function PUT(request: NextRequest) {
  try {
    const { userId, newUsername } = await request.json();

    if (!userId || !newUsername) {
      return NextResponse.json({ error: 'User ID and new username are required' }, { status: 400 });
    }

    if (filterInappropriateContent(newUsername)) {
      return NextResponse.json({ error: 'New username contains inappropriate content' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ message: 'Username updated successfully (mock)' });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}
