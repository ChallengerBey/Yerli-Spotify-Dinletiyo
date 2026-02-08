-- Anti-DDoS için Supabase tabloları (Basit versiyon)

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