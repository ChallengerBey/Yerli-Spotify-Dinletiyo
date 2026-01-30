-- Analytics tablosu oluştur
CREATE TABLE IF NOT EXISTS analytics (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    song_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(100),
    country_code VARCHAR(2),
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    additional_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_country_code ON analytics(country_code);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ip ON analytics(ip_address);

-- RLS politikaları (sadece admin erişimi)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için tam erişim (users tablosu yoksa bu politikayı kaldır)
-- CREATE POLICY "Admins can view all analytics" ON analytics
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE users.id = auth.uid()::text 
--             AND users.role = 'admin'
--         )
--     );

-- Geçici olarak herkese okuma izni ver (production'da kaldırılmalı)
CREATE POLICY "Allow analytics read" ON analytics
    FOR SELECT USING (true);

-- Analytics ekleme için genel erişim (API üzerinden)
CREATE POLICY "Allow analytics insert" ON analytics
    FOR INSERT WITH CHECK (true);

-- Eski verileri temizleme fonksiyonu (30 günden eski)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    DELETE FROM analytics 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Günlük temizleme için cron job (Supabase Pro gerekli)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics();');

-- Analytics özet view'ı
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    DATE(created_at) as date,
    event_type,
    country,
    country_code,
    COUNT(*) as event_count,
    COUNT(DISTINCT ip_address) as unique_visitors,
    COUNT(DISTINCT user_id) as unique_users
FROM analytics 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), event_type, country, country_code
ORDER BY date DESC, event_count DESC;

-- Ülke bazlı özet
CREATE OR REPLACE VIEW country_stats AS
SELECT 
    country,
    country_code,
    COUNT(*) as total_events,
    COUNT(DISTINCT ip_address) as unique_visitors,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(latitude) as avg_latitude,
    AVG(longitude) as avg_longitude,
    MAX(created_at) as last_activity
FROM analytics 
WHERE created_at >= NOW() - INTERVAL '7 days'
AND country_code IS NOT NULL
GROUP BY country, country_code
ORDER BY total_events DESC;

-- Gerçek zamanlı aktif kullanıcılar
CREATE OR REPLACE VIEW realtime_users AS
SELECT 
    COUNT(DISTINCT ip_address) as active_users,
    COUNT(*) as recent_events
FROM analytics 
WHERE created_at >= NOW() - INTERVAL '1 hour';

COMMENT ON TABLE analytics IS 'Kullanıcı aktivitelerini ve konum bilgilerini takip eder';
COMMENT ON VIEW analytics_summary IS 'Günlük analytics özeti';
COMMENT ON VIEW country_stats IS 'Ülke bazlı kullanıcı istatistikleri';
COMMENT ON VIEW realtime_users IS 'Son 1 saatteki aktif kullanıcı sayısı';