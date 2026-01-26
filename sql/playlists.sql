-- ============================================
-- PLAYLIST SYSTEM (Playlist Sistemi)
-- ============================================

-- Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    song_count INTEGER DEFAULT 0,
    total_duration_ms BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist songs table
CREATE TABLE IF NOT EXISTS public.playlist_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    song_data JSONB NOT NULL,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, position),
    UNIQUE(playlist_id, song_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON public.playlists(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON public.playlist_songs(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song ON public.playlist_songs(song_id);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlists (with IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlists' AND policyname = 'Users can view their own playlists'
    ) THEN
        CREATE POLICY "Users can view their own playlists"
            ON public.playlists FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlists' AND policyname = 'Users can view public playlists'
    ) THEN
        CREATE POLICY "Users can view public playlists"
            ON public.playlists FOR SELECT
            USING (is_public = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlists' AND policyname = 'Users can create their own playlists'
    ) THEN
        CREATE POLICY "Users can create their own playlists"
            ON public.playlists FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlists' AND policyname = 'Users can update their own playlists'
    ) THEN
        CREATE POLICY "Users can update their own playlists"
            ON public.playlists FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlists' AND policyname = 'Users can delete their own playlists'
    ) THEN
        CREATE POLICY "Users can delete their own playlists"
            ON public.playlists FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- RLS Policies for playlist_songs (with IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlist_songs' AND policyname = 'Users can view songs in their playlists'
    ) THEN
        CREATE POLICY "Users can view songs in their playlists"
            ON public.playlist_songs FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.playlists
                    WHERE id = playlist_id AND user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlist_songs' AND policyname = 'Users can view songs in public playlists'
    ) THEN
        CREATE POLICY "Users can view songs in public playlists"
            ON public.playlist_songs FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.playlists
                    WHERE id = playlist_id AND is_public = true
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlist_songs' AND policyname = 'Users can add songs to their playlists'
    ) THEN
        CREATE POLICY "Users can add songs to their playlists"
            ON public.playlist_songs FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.playlists
                    WHERE id = playlist_id AND user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlist_songs' AND policyname = 'Users can update songs in their playlists'
    ) THEN
        CREATE POLICY "Users can update songs in their playlists"
            ON public.playlist_songs FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.playlists
                    WHERE id = playlist_id AND user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'playlist_songs' AND policyname = 'Users can delete songs from their playlists'
    ) THEN
        CREATE POLICY "Users can delete songs from their playlists"
            ON public.playlist_songs FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM public.playlists
                    WHERE id = playlist_id AND user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Function to update playlist stats when songs are added/removed
CREATE OR REPLACE FUNCTION update_playlist_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.playlists
        SET 
            song_count = (
                SELECT COUNT(*) FROM public.playlist_songs 
                WHERE playlist_id = NEW.playlist_id
            ),
            total_duration_ms = (
                SELECT COALESCE(SUM((song_data->>'duration_ms')::bigint), 0)
                FROM public.playlist_songs 
                WHERE playlist_id = NEW.playlist_id
            ),
            updated_at = NOW()
        WHERE id = NEW.playlist_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.playlists
        SET 
            song_count = (
                SELECT COUNT(*) FROM public.playlist_songs 
                WHERE playlist_id = OLD.playlist_id
            ),
            total_duration_ms = (
                SELECT COALESCE(SUM((song_data->>'duration_ms')::bigint), 0)
                FROM public.playlist_songs 
                WHERE playlist_id = OLD.playlist_id
            ),
            updated_at = NOW()
        WHERE id = OLD.playlist_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update playlist stats
DROP TRIGGER IF EXISTS trigger_update_playlist_stats ON public.playlist_songs;
CREATE TRIGGER trigger_update_playlist_stats
    AFTER INSERT OR DELETE ON public.playlist_songs
    FOR EACH ROW
    EXECUTE FUNCTION update_playlist_stats();

-- Comments
COMMENT ON TABLE public.playlists IS 'User created playlists';
COMMENT ON TABLE public.playlist_songs IS 'Songs in playlists with position ordering';