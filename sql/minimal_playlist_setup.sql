-- ============================================
-- MINIMAL PLAYLIST SETUP - Only playlist tables
-- ============================================

-- Check if playlists table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'playlists') THEN
        CREATE TABLE public.playlists (
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
        
        -- Create indexes
        CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
        CREATE INDEX idx_playlists_public ON public.playlists(is_public, created_at DESC);
        
        -- Enable RLS
        ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created playlists table with indexes and RLS';
    ELSE
        RAISE NOTICE 'Playlists table already exists';
    END IF;
END $$;

-- Check if playlist_songs table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'playlist_songs') THEN
        CREATE TABLE public.playlist_songs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
            song_id TEXT NOT NULL,
            song_data JSONB NOT NULL,
            position INTEGER NOT NULL,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(playlist_id, position),
            UNIQUE(playlist_id, song_id)
        );
        
        -- Create indexes
        CREATE INDEX idx_playlist_songs_playlist ON public.playlist_songs(playlist_id, position);
        CREATE INDEX idx_playlist_songs_song ON public.playlist_songs(song_id);
        
        -- Enable RLS
        ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created playlist_songs table with indexes and RLS';
    ELSE
        RAISE NOTICE 'Playlist_songs table already exists';
    END IF;
END $$;

-- Create policies only if they don't exist
DO $$ 
BEGIN
    -- Playlists policies
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

    -- Playlist songs policies
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
    
    RAISE NOTICE 'All playlist policies created or already exist';
END $$;

-- Create or replace the update function
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

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_playlist_stats'
    ) THEN
        CREATE TRIGGER trigger_update_playlist_stats
            AFTER INSERT OR DELETE ON public.playlist_songs
            FOR EACH ROW
            EXECUTE FUNCTION update_playlist_stats();
        RAISE NOTICE 'Created trigger: trigger_update_playlist_stats';
    ELSE
        RAISE NOTICE 'Trigger already exists';
    END IF;
END $$;

-- Final message
RAISE NOTICE '=== PLAYLIST SETUP COMPLETED ===';
RAISE NOTICE 'Playlist system is ready to use!';