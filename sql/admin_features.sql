-- ============================================
-- ADMIN PANEL & NOTIFICATIONS & OFFLINE MANAGEMENT
-- Comprehensive Admin Features
-- ============================================

-- Cleanup existing tables if they have issues
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_bans CASCADE;
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.user_storage_quota CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.admin_roles CASCADE;

-- ============================================
-- 1. NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('new_song', 'friend_activity', 'playlist_update', 'friend_request', 'achievement', 'promotion', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    related_content_type TEXT CHECK (related_content_type IN ('song', 'playlist', 'user', 'album')),
    related_content_id TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 2. USER BAN SYSTEM
-- ============================================

CREATE TABLE public.user_bans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    ban_reason TEXT NOT NULL,
    ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    appeal_submitted BOOLEAN DEFAULT false,
    appeal_reason TEXT,
    appeal_reviewed BOOLEAN DEFAULT false,
    appeal_decision TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX idx_user_bans_is_active ON public.user_bans(is_active);
CREATE INDEX idx_user_bans_expires_at ON public.user_bans(expires_at);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all bans"
    ON public.user_bans FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 3. ADMIN LOGS SYSTEM
-- ============================================

CREATE TABLE public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'upload_song', 'edit_song', 'delete_song',
        'ban_user', 'unban_user', 'delete_user',
        'upload_podcast', 'delete_podcast',
        'system_maintenance', 'settings_change',
        'user_verification', 'content_moderation'
    )),
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_content_type TEXT CHECK (target_content_type IN ('user', 'song', 'podcast', 'playlist')),
    target_content_id TEXT,
    description TEXT NOT NULL,
    changes JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action_type ON public.admin_logs(action_type);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_target_user_id ON public.admin_logs(target_user_id);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
    ON public.admin_logs FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 4. STORAGE MANAGEMENT
-- ============================================

CREATE TABLE public.user_storage_quota (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_quota_bytes BIGINT DEFAULT 5368709120, -- 5GB default
    used_quota_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_user_storage_quota_user_id ON public.user_storage_quota(user_id);

ALTER TABLE public.user_storage_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storage quota"
    ON public.user_storage_quota FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- 5. SONG MANAGEMENT METADATA
-- ============================================

CREATE TABLE public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover_url TEXT,
    duration_ms INTEGER,
    genre TEXT,
    year INTEGER,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    file_url TEXT,
    file_size_bytes BIGINT,
    play_count BIGINT DEFAULT 0,
    is_explicit BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_songs_artist ON public.songs(artist);
CREATE INDEX idx_songs_genre ON public.songs(genre);
CREATE INDEX idx_songs_uploaded_by ON public.songs(uploaded_by);
CREATE INDEX idx_songs_is_active ON public.songs(is_active);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active songs"
    ON public.songs FOR SELECT
    USING (is_active = true);

-- ============================================
-- 6. ADMIN PERMISSIONS ROLES
-- ============================================

CREATE TABLE public.admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL CHECK (role_name IN ('admin', 'moderator', 'content_manager')),
    permissions JSONB NOT NULL DEFAULT '{
        "manage_users": false,
        "manage_songs": false,
        "manage_podcasts": false,
        "ban_users": false,
        "view_analytics": false,
        "view_logs": false
    }',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_role_name ON public.admin_roles(role_name);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. FUNCTIONS FOR NOTIFICATIONS
-- ============================================

CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_notification_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_actor_user_id UUID DEFAULT NULL,
    p_related_content_type TEXT DEFAULT NULL,
    p_related_content_id TEXT DEFAULT NULL,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, notification_type, title, message, 
        actor_user_id, related_content_type, related_content_id, data
    ) VALUES (
        p_user_id, p_notification_type, p_title, p_message,
        p_actor_user_id, p_related_content_type, p_related_content_id, p_data
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. FUNCTION TO UPDATE STORAGE QUOTA
-- ============================================

CREATE OR REPLACE FUNCTION update_user_storage_quota(
    p_user_id UUID,
    p_bytes_added BIGINT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_storage_quota
    SET 
        used_quota_bytes = used_quota_bytes + p_bytes_added,
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND (used_quota_bytes + p_bytes_added) <= total_quota_bytes;
    
    IF FOUND THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. TRIGGER TO CREATE STORAGE QUOTA ON USER SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION create_user_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_storage_quota (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_storage_quota ON auth.users;
CREATE TRIGGER trigger_create_storage_quota
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_storage_quota();

-- ============================================
-- 10. COMMENTS
-- ============================================

COMMENT ON TABLE public.notifications IS 'Notification system for user events';
COMMENT ON TABLE public.user_bans IS 'User ban management with appeals';
COMMENT ON TABLE public.admin_logs IS 'Comprehensive admin action logs';
COMMENT ON TABLE public.user_storage_quota IS 'User storage quota management';
COMMENT ON TABLE public.songs IS 'Song metadata and management';
COMMENT ON TABLE public.admin_roles IS 'Admin role and permissions management';
