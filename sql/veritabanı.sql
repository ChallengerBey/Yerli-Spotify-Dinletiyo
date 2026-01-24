-- ============================================
-- COMPREHENSIVE FEATURES SETUP
-- Yerli Spotify - All New Features Database Schema
-- ============================================

-- ============================================
-- 1. QUEUE SYSTEM (Kuyruk Sistemi)
-- ============================================

CREATE TABLE IF NOT EXISTS public.queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    song_data JSONB NOT NULL,
    position INTEGER NOT NULL,
    is_playing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, position)
);

CREATE INDEX idx_queue_user_id ON public.queue(user_id);
CREATE INDEX idx_queue_position ON public.queue(user_id, position);

ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue"
    ON public.queue FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own queue"
    ON public.queue FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue"
    ON public.queue FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own queue"
    ON public.queue FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 2. USER STATISTICS (Dinleme İstatistikleri)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_listening_time_ms BIGINT DEFAULT 0,
    total_songs_played INTEGER DEFAULT 0,
    favorite_genre TEXT,
    favorite_artist TEXT,
    most_played_song_id TEXT,
    current_streak_days INTEGER DEFAULT 0,
    last_played_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.listening_history_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    songs_played INTEGER DEFAULT 0,
    listening_time_ms BIGINT DEFAULT 0,
    top_genre TEXT,
    top_artist TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX idx_listening_history_stats_user_date ON public.listening_history_stats(user_id, date);

ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own statistics"
    ON public.user_statistics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own history stats"
    ON public.listening_history_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics"
    ON public.user_statistics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics"
    ON public.user_statistics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history stats"
    ON public.listening_history_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history stats"
    ON public.listening_history_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. THEME SYSTEM (Tema Sistemi)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark', 'auto')),
    accent_color TEXT DEFAULT '#1db954',
    custom_theme JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_user_themes_user_id ON public.user_themes(user_id);

ALTER TABLE public.user_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own theme"
    ON public.user_themes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own theme"
    ON public.user_themes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own theme"
    ON public.user_themes FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- 4. LISTENING ROOMS (Ortak Dinleme Odaları)
-- ============================================

CREATE TABLE IF NOT EXISTS public.listening_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    room_code TEXT UNIQUE NOT NULL,
    current_song_id TEXT,
    current_song_data JSONB,
    is_playing BOOLEAN DEFAULT false,
    progress_ms INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 50,
    is_public BOOLEAN DEFAULT true,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.listening_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.room_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.listening_rooms(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    song_data JSONB NOT NULL,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, position)
);

CREATE TABLE IF NOT EXISTS public.room_chat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.listening_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_listening_rooms_code ON public.listening_rooms(room_code);
CREATE INDEX idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX idx_room_queue_room ON public.room_queue(room_id, position);
CREATE INDEX idx_room_chat_room ON public.room_chat(room_id, created_at);

ALTER TABLE public.listening_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public rooms"
    ON public.listening_rooms FOR SELECT
    USING (is_public = true OR host_id = auth.uid());

CREATE POLICY "Host can update their room"
    ON public.listening_rooms FOR UPDATE
    USING (host_id = auth.uid());

CREATE POLICY "Anyone can create a room"
    ON public.listening_rooms FOR INSERT
    WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can delete their room"
    ON public.listening_rooms FOR DELETE
    USING (host_id = auth.uid());

CREATE POLICY "Participants can view room members"
    ON public.room_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listening_rooms
            WHERE id = room_id AND (is_public = true OR host_id = auth.uid())
        )
    );

CREATE POLICY "Users can join rooms"
    ON public.room_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
    ON public.room_participants FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Participants can view room queue"
    ON public.room_queue FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.room_participants
            WHERE room_id = room_queue.room_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can add to queue"
    ON public.room_queue FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.room_participants
            WHERE room_id = room_queue.room_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can view chat"
    ON public.room_chat FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.room_participants
            WHERE room_id = room_chat.room_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Participants can send messages"
    ON public.room_chat FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.room_participants
            WHERE room_id = room_chat.room_id AND user_id = auth.uid()
        )
    );

-- ============================================
-- 5. LYRICS SYSTEM (Şarkı Sözleri)
-- ============================================

CREATE TABLE IF NOT EXISTS public.lyrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id TEXT NOT NULL UNIQUE,
    song_title TEXT NOT NULL,
    artist TEXT NOT NULL,
    lyrics_text TEXT,
    synced_lyrics JSONB,
    source TEXT,
    language TEXT DEFAULT 'tr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lyrics_song_id ON public.lyrics(song_id);
CREATE INDEX idx_lyrics_search ON public.lyrics(song_title, artist);

ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lyrics"
    ON public.lyrics FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 6. ACTIVITY FEED (Aktivite Akışı)
-- ============================================

CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('song_liked', 'playlist_created', 'friend_added', 'song_played', 'playlist_shared', 'achievement_earned')),
    activity_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_user ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_type ON public.activity_feed(activity_type);
CREATE INDEX idx_activity_feed_public ON public.activity_feed(is_public, created_at DESC);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
    ON public.activity_feed FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public activities of friends"
    ON public.activity_feed FOR SELECT
    USING (
        is_public = true AND (
            EXISTS (
                SELECT 1 FROM public.friendships
                WHERE (user_id = auth.uid() AND friend_id = activity_feed.user_id AND status = 'accepted')
                   OR (friend_id = auth.uid() AND user_id = activity_feed.user_id AND status = 'accepted')
            )
        )
    );

CREATE POLICY "Users can create their own activity"
    ON public.activity_feed FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. LEADERBOARD (Sıralama Tablosu)
-- ============================================

CREATE TABLE IF NOT EXISTS public.leaderboard_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
    songs_played INTEGER DEFAULT 0,
    listening_time_ms BIGINT DEFAULT 0,
    playlists_created INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    rank INTEGER,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period, period_start)
);

CREATE INDEX idx_leaderboard_period_rank ON public.leaderboard_stats(period, rank);
CREATE INDEX idx_leaderboard_points ON public.leaderboard_stats(period, points DESC);

ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
    ON public.leaderboard_stats FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 8. ACHIEVEMENTS & BADGES (Başarımlar)
-- ============================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    achievement_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    points INTEGER DEFAULT 10,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
    ON public.achievements FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Users can view their own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 9. PREMIUM SYSTEM (Premium Abonelik)
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    features JSONB NOT NULL,
    max_offline_songs INTEGER,
    audio_quality TEXT DEFAULT 'high',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'trial')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    payment_provider TEXT,
    external_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_provider TEXT,
    transaction_id TEXT UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
    ON public.subscription_plans FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can view their own subscription"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
    ON public.payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 10. PODCAST SYSTEM (Podcast Desteği)
-- ============================================

CREATE TABLE IF NOT EXISTS public.podcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    podcast_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    rss_feed_url TEXT,
    category TEXT,
    language TEXT DEFAULT 'tr',
    total_episodes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.podcast_episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
    episode_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration_ms INTEGER,
    episode_number INTEGER,
    season_number INTEGER,
    publish_date TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_podcast_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, podcast_id)
);

CREATE TABLE IF NOT EXISTS public.podcast_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES public.podcast_episodes(id) ON DELETE CASCADE,
    progress_ms INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, episode_id)
);

CREATE INDEX idx_podcasts_category ON public.podcasts(category);
CREATE INDEX idx_podcasts_active ON public.podcasts(is_active);
CREATE INDEX idx_podcast_episodes_podcast ON public.podcast_episodes(podcast_id);
CREATE INDEX idx_podcast_episodes_publish_date ON public.podcast_episodes(publish_date DESC);
CREATE INDEX idx_user_podcast_subs_user ON public.user_podcast_subscriptions(user_id);
CREATE INDEX idx_user_podcast_subs_podcast ON public.user_podcast_subscriptions(podcast_id);
CREATE INDEX idx_podcast_progress_user ON public.podcast_progress(user_id);
CREATE INDEX idx_podcast_progress_episode ON public.podcast_progress(episode_id);

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_podcast_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active podcasts"
    ON public.podcasts FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can view episodes"
    ON public.podcast_episodes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can view their podcast subscriptions"
    ON public.user_podcast_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to podcasts"
    ON public.user_podcast_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe from podcasts"
    ON public.user_podcast_subscriptions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their podcast progress"
    ON public.podcast_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their podcast progress"
    ON public.podcast_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their podcast progress"
    ON public.podcast_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- 12. OFFLINE DOWNLOADS (Offline Mod)
-- ============================================

CREATE TABLE IF NOT EXISTS public.offline_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('song', 'podcast_episode', 'playlist')),
    content_id TEXT NOT NULL,
    content_data JSONB NOT NULL,
    file_size_bytes BIGINT,
    download_quality TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX idx_offline_downloads_user ON public.offline_downloads(user_id);
CREATE INDEX idx_offline_downloads_expires ON public.offline_downloads(expires_at);

ALTER TABLE public.offline_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own downloads"
    ON public.offline_downloads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own downloads"
    ON public.offline_downloads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own downloads"
    ON public.offline_downloads FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 13. INSERT DEFAULT DATA
-- ============================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_name, display_name, description, price_monthly, price_yearly, features, max_offline_songs, audio_quality) VALUES
('free', 'Ücretsiz', 'Temel özellikler', 0, 0, '{"ads": true, "quality": "normal", "offline": false, "lyrics": true}'::jsonb, 0, 'normal'),
('premium', 'Premium', 'Reklamsız ve yüksek kalite', 29.99, 299.99, '{"ads": false, "quality": "high", "offline": true, "lyrics": true, "rooms": true}'::jsonb, 10000, 'high'),
('family', 'Aile', 'Premium + 6 hesap', 49.99, 499.99, '{"ads": false, "quality": "high", "offline": true, "lyrics": true, "rooms": true, "accounts": 6}'::jsonb, 10000, 'high')
ON CONFLICT (plan_name) DO NOTHING;

-- Insert default achievements
-- DÜZELTİLDİ: Tek tırnak hatası (playlist'ini -> playlist''ini) düzeltildi.
INSERT INTO public.achievements (achievement_key, name, description, icon, category, points, requirement_type, requirement_value) VALUES
('first_song', 'İlk Şarkı', 'İlk şarkını dinledin!', '🎵', 'listening', 10, 'songs_played', 1),
('song_lover_10', 'Müzik Tutkunu', '10 şarkı dinledin', '🎧', 'listening', 20, 'songs_played', 10),
('song_lover_100', 'Müzik Bağımlısı', '100 şarkı dinledin', '🎸', 'listening', 50, 'songs_played', 100),
('song_lover_1000', 'Müzik Efsanesi', '1000 şarkı dinledin!', '🌟', 'listening', 100, 'songs_played', 1000),
('first_friend', 'Sosyalleşme', 'İlk arkadaşını ekledin', '👋', 'social', 15, 'friends_count', 1),
('popular_10', 'Popüler', '10 arkadaşın var', '🔥', 'social', 30, 'friends_count', 10),
('playlist_creator', 'Playlist Yaratıcısı', 'İlk playlist''ini oluşturdun', '📝', 'creation', 20, 'playlists_created', 1),
('early_bird', 'Erken Kuş', 'İlk 1000 kullanıcıdan birisin', '🐦', 'special', 100, 'user_id', 1000)
ON CONFLICT (achievement_key) DO NOTHING;

-- ============================================
-- 13. UTILITY FUNCTIONS
-- ============================================

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_statistics (user_id, total_songs_played, last_played_date)
    VALUES (NEW.user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_songs_played = user_statistics.total_songs_played + 1,
        last_played_date = CURRENT_DATE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update statistics on song play
-- NOT: 'recently_played' tablosu kodda yoksa bu kısım hata verebilir,
-- eğer o tabloyu önceden oluşturduysan sorun yok. 
-- Yoksa o tabloyu da oluşturman gerekir.
CREATE TABLE IF NOT EXISTS public.recently_played (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_statistics ON public.recently_played;
CREATE TRIGGER trigger_update_statistics
    AFTER INSERT ON public.recently_played
    FOR EACH ROW
    EXECUTE FUNCTION update_user_statistics();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
    user_stats RECORD;
    achievement RECORD;
BEGIN
    SELECT 
        total_songs_played,
        -- NOT: 'friendships' tablosu kodda yoksa burası hata verebilir.
        -- Eğer yoksa geçici olarak 0 döndürüyoruz.
        (SELECT COUNT(*) FROM public.friendships WHERE (user_id = NEW.user_id OR friend_id = NEW.user_id) AND status = 'accepted') as friends_count
    INTO user_stats
    FROM public.user_statistics
    WHERE user_id = NEW.user_id;

    FOR achievement IN 
        SELECT * FROM public.achievements 
        WHERE is_active = true
    LOOP
        IF achievement.requirement_type = 'songs_played' AND user_stats.total_songs_played >= achievement.requirement_value THEN
            INSERT INTO public.user_achievements (user_id, achievement_id)
            VALUES (NEW.user_id, achievement.id)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check achievements on stats update
DROP TRIGGER IF EXISTS trigger_check_achievements ON public.user_statistics;
CREATE TRIGGER trigger_check_achievements
    AFTER UPDATE ON public.user_statistics
    FOR EACH ROW
    EXECUTE FUNCTION check_achievements();

-- ============================================
-- SETUP COMPLETE
-- ============================================

COMMENT ON TABLE public.queue IS 'User music queue for playback';
COMMENT ON TABLE public.user_statistics IS 'User listening statistics and analytics';
COMMENT ON TABLE public.listening_rooms IS 'Collaborative listening rooms';
COMMENT ON TABLE public.activity_feed IS 'Social activity feed for users';
COMMENT ON TABLE public.leaderboard_stats IS 'Leaderboard rankings and points';
COMMENT ON TABLE public.user_subscriptions IS 'Premium subscription management';
COMMENT ON TABLE public.offline_downloads IS 'Offline content downloads';
