-- RLS Politikalarını Düzenle (Verilerin silinmesini/görünmemesini düzeltir)

-- Favorites tablosu için RLS politikasını kaldır ve herkese aç (Server-side erişim için)
alter table favorites enable row level security;
drop policy if exists "Users can view their own favorites" on favorites;
drop policy if exists "Users can insert their own favorites" on favorites;
drop policy if exists "Users can delete their own favorites" on favorites;

create policy "Public favorites access" on favorites for all using (true);


-- Recently Played tablosu için RLS politikasını kaldır ve herkese aç
alter table recently_played enable row level security;
drop policy if exists "Users can view their own history" on recently_played;
drop policy if exists "Users can insert their own history" on recently_played;

create policy "Public history access" on recently_played for all using (true);


-- Profiles tablosu için RLS politikasını kaldır ve herkese aç
alter table profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Public profiles access" on profiles for all using (true);
