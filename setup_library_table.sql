-- Create library_items table to store followed artists and playlists
create table if not exists library_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'artist' or 'playlist'
  title text not null,
  subtitle text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table library_items enable row level security;

-- Create permissive policy as requested (fixing previous issues)
drop policy if exists "Public library access" on library_items;
create policy "Public library access" on library_items for all using (true);
