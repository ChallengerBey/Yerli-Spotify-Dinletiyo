-- Create a table for public profiles (extends default auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  preferences jsonb default '{"artists": [], "genres": []}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create favorites table
create table favorites (
  user_id uuid references auth.users(id) on delete cascade not null,
  song_id text not null,
  song_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, song_id)
);
alter table favorites enable row level security;
create policy "Users can view own favorites" on favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on favorites for delete using (auth.uid() = user_id);

-- Create recently_played table
create table recently_played (
  user_id uuid references auth.users(id) on delete cascade not null,
  song_id text not null,
  song_data jsonb not null,
  played_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, song_id)
);
alter table recently_played enable row level security;
create policy "Users can view own recently played" on recently_played for select using (auth.uid() = user_id);
create policy "Users can insert own recently played" on recently_played for insert with check (auth.uid() = user_id);
create policy "Users can update own recently played" on recently_played for update using (auth.uid() = user_id);
