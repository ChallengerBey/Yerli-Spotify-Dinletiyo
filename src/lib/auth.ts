'use server';

import { supabase } from './supabase';
import { User } from 'firebase/auth'; // Using generic types or define own if needed, but here we construct objects.

// Defines types locally since we aren't importing from detailed Prisma/DB types yet
interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  preferences?: UserPreferences;
}

interface UserPreferences {
  artists: string[];
  genres: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  aiHint?: string;
}

// Signup function
export async function signup(userData: { username: string; email: string; password: string }) {
  // 1. Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        username: userData.username,
      }
    }
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Kayıt oluşturulamadı.');
  }

  // 2. Create profile entry in 'profiles' table
  // Note: If you set up a trigger in Supabase (handle_new_user), this might be redundant, 
  // but explicit insertion ensures we control the data if triggers aren't set.
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user.id,
        username: userData.username,
        email: userData.email, // Store email in profile for easier access if needed, though strictly it's in auth.users
        preferences: { artists: [], genres: [] }
      }
    ]);

  if (profileError) {
    // If profile creation fails, we should ideally rollback auth (delete user), 
    // but manually deleting auth user requires service_role key.
    // For now, warn or throw.
    console.error('Profile creation error:', profileError);
    // Proceeding implies the user exists in Auth but has no profile.
  }

  return { message: 'Kayıt başarılı! Hoş geldiniz.' };
}

// Login function
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('Giriş başarısız: ' + error.message);
  }

  if (!data.user) {
    throw new Error('Kullanıcı bulunamadı.');
  }

  // Fetch additional profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email || '',
    username: profile?.username || data.user.user_metadata?.username || email.split('@')[0],
    avatar: profile?.avatar_url,
    registeredAt: data.user.created_at
  };
}

export async function updateProfile(userId: string, data: { username?: string; avatar?: string }) {
  const updates: any = {};
  if (data.username) updates.username = data.username;
  if (data.avatar) updates.avatar_url = data.avatar;
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    throw new Error('Profil güncellenemedi: ' + error.message);
  }

  return { success: true };
}

export async function saveUserPreferences(userId: string, preferences: UserPreferences) {
  const { error } = await supabase
    .from('profiles')
    .update({ preferences: preferences })
    .eq('id', userId);

  if (error) {
    throw new Error('Tercihler kaydedilemedi: ' + error.message);
  }

  return { success: true, message: 'Kullanıcı tercihleri kaydedildi.' };
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Return empty if not found
    return { artists: [], genres: [] };
  }

  return data.preferences || { artists: [], genres: [] };
}

export async function saveFavoriteSong(userId: string, song: Song) {
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, song_id: song.id, song_data: song }, { onConflict: 'user_id, song_id' });

  if (error) {
    throw new Error('Favori eklenemedi: ' + error.message);
  }

  return { success: true, message: 'Şarkı favorilere eklendi.' };
}

export async function removeFavoriteSong(userId: string, songId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('song_id', songId);

  if (error) {
    throw new Error('Favori kaldırılamadı: ' + error.message);
  }

  return { success: true, message: 'Şarkı favorilerden kaldırıldı.' };
}

export async function getFavoriteSongs(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('song_data')
    .eq('user_id', userId);

  if (error) {
    console.error('Favoriler getirilemedi:', error);
    return [];
  }

  return data.map((item: any) => item.song_data);
}

export async function addRecentlyPlayedSong(userId: string, song: Song) {
  // Upsert into recently_played
  const { error } = await supabase
    .from('recently_played')
    .upsert({
      user_id: userId,
      song_id: song.id,
      song_data: song,
      played_at: new Date().toISOString()
    }, { onConflict: 'user_id, song_id' });

  // Note: To strictly limit to 20 per user, we'd typically use a Trigger in SQL 
  // or a specialized Rpc call. Doing it purely client-side (searching and deleting) 
  // is expensive and race-condition prone. For MVP, we just upsert.

  if (error) {
    console.error('Son çalınan eklenemedi:', error);
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Son çalınan şarkı eklendi.' };
}

export async function getRecentlyPlayedSongs(userId: string) {
  const { data, error } = await supabase
    .from('recently_played')
    .select('song_data')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Geçmiş getirilemedi:', error);
    return [];
  }

  return data.map((item: any) => item.song_data);
}

// Admin helper or unused
export async function getUsers() {
  // This probably shouldn't be exposed or possible in RLS unless admin
  return [];
}