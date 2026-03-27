-- Anti-DDoS için Supabase tabloları

-- Blocked IPs tablosu
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  reason TEXT DEFAULT 'Manual',
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IP için unique index
CREATE UNIQUE INDEX IF NOT EXISTS blocked_ips_ip_active_idx ON blocked_ips (ip) WHERE is_active = true;

-- Suspicious activities tablosu
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  url TEXT,
  reason TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance için index
CREATE INDEX IF NOT EXISTS suspicious_activities_ip_timestamp_idx ON suspicious_activities (ip, timestamp);
CREATE INDEX IF NOT EXISTS suspicious_activities_timestamp_idx ON suspicious_activities (timestamp);

-- DDoS logs tablosu
CREATE TABLE IF NOT EXISTS ddos_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  ip TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request logs tablosu (opsiyonel - çok veri olabilir)
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  url TEXT,
  method TEXT DEFAULT 'GET',
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance için index
CREATE INDEX IF NOT EXISTS request_logs_ip_timestamp_idx ON request_logs (ip, timestamp);
CREATE INDEX IF NOT EXISTS request_logs_timestamp_idx ON request_logs (timestamp);

-- Eski kayıtları temizlemek için (opsiyonel)
-- 7 günden eski suspicious activities
-- DELETE FROM suspicious_activities WHERE timestamp < NOW() - INTERVAL '7 days';

-- 24 saatten eski request logs  
-- DELETE FROM request_logs WHERE timestamp < NOW() - INTERVAL '1 day';

-- Row Level Security (RLS) - Güvenlik için
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri temizle (hata verirse devam eder)
DROP POLICY IF EXISTS "Admin can manage blocked_ips" ON blocked_ips;
DROP POLICY IF EXISTS "Admin can view suspicious_activities" ON suspicious_activities;
DROP POLICY IF EXISTS "Admin can view ddos_logs" ON ddos_logs;
DROP POLICY IF EXISTS "Admin can view request_logs" ON request_logs;
DROP POLICY IF EXISTS "Service role full access blocked_ips" ON blocked_ips;
DROP POLICY IF EXISTS "Service role full access suspicious_activities" ON suspicious_activities;
DROP POLICY IF EXISTS "Service role full access ddos_logs" ON ddos_logs;
DROP POLICY IF EXISTS "Service role full access request_logs" ON request_logs;

-- Admin erişimi için policy (authenticated users)
CREATE POLICY "Admin can manage blocked_ips" ON blocked_ips
  FOR ALL USING (true);

CREATE POLICY "Admin can view suspicious_activities" ON suspicious_activities
  FOR ALL USING (true);

CREATE POLICY "Admin can view ddos_logs" ON ddos_logs
  FOR ALL USING (true);

CREATE POLICY "Admin can view request_logs" ON request_logs
  FOR ALL USING (true);