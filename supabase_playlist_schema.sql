-- Playlist tablosunu oluştur
create table if not exists public.user_playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  image_url text,
  is_public boolean default false,
  songs jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) aktif et
alter table public.user_playlists enable row level security;

-- Okuma politikası: Herkes kendi playlistini görebilir, kamuya açık olanları herkes görebilir
create policy "Public playlists are viewable by everyone."
  on public.user_playlists for select
  using ( is_public = true or auth.uid() = user_id );

-- Ekleme politikası: Sadece giriş yapmış kullanıcılar kendi adına ekleyebilir
create policy "Users can insert their own playlists."
  on public.user_playlists for insert
  with check ( auth.uid() = user_id );

-- Güncelleme politikası: Sadece sahibi güncelleyebilir
create policy "Users can update own playlists."
  on public.user_playlists for update
  using ( auth.uid() = user_id );

-- Silme politikası: Sadece sahibi silebilir
create policy "Users can delete own playlists."
  on public.user_playlists for delete
  using ( auth.uid() = user_id );

-- Storage bucket oluştur (Playlist kapak resimleri için - opsiyonel)
insert into storage.buckets (id, name, public)
values ('playlist-covers', 'playlist-covers', true)
on conflict (id) do nothing;

-- Storage politikası (Kapak resimleri için)
create policy "Playlist covers are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'playlist-covers' );

create policy "Users can upload playlist covers."
  on storage.objects for insert
  with check ( bucket_id = 'playlist-covers' and auth.uid() = owner );
