// Vercel için Anti-DDoS adapter
import { supabase } from '@/lib/supabase';

// Blocked IPs için Supabase tablosu
export async function getBlockedIPs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('ip')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching blocked IPs:', error);
      return [];
    }
    
    return data?.map(row => row.ip) || [];
  } catch (error) {
    console.error('Error in getBlockedIPs:', error);
    return [];
  }
}

export async function addBlockedIP(ip: string, reason: string = 'Manual'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('blocked_ips')
      .upsert({
        ip,
        reason,
        blocked_at: new Date().toISOString(),
        is_active: true
      });
    
    if (error) {
      console.error('Error adding blocked IP:', error);
      return false;
    }
    
    // Log the block
    await logActivity('BLOCK_IP', ip, reason);
    return true;
  } catch (error) {
    console.error('Error in addBlockedIP:', error);
    return false;
  }
}

export async function removeBlockedIP(ip: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('blocked_ips')
      .update({ is_active: false })
      .eq('ip', ip);
    
    if (error) {
      console.error('Error removing blocked IP:', error);
      return false;
    }
    
    // Log the unblock
    await logActivity('UNBLOCK_IP', ip, 'Manual unblock');
    return true;
  } catch (error) {
    console.error('Error in removeBlockedIP:', error);
    return false;
  }
}

// Suspicious activity için Supabase
export async function logSuspiciousActivity(ip: string, url: string, reason: string): Promise<void> {
  try {
    // Add to suspicious activity log
    await supabase
      .from('suspicious_activities')
      .insert({
        ip,
        url,
        reason,
        timestamp: new Date().toISOString()
      });
    
    // Check if should auto-block
    const { data, error } = await supabase
      .from('suspicious_activities')
      .select('id')
      .eq('ip', ip)
      .gte('timestamp', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
      .limit(5);
    
    if (!error && data && data.length >= 5) {
      console.log(`🚨 Auto-blocking IP ${ip} due to ${data.length} suspicious activities`);
      await addBlockedIP(ip, `Auto-block: ${reason}`);
    }
  } catch (error) {
    console.error('Error logging suspicious activity:', error);
  }
}

export async function getSuspiciousActivities(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('suspicious_activities')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching suspicious activities:', error);
      return [];
    }
    
    // Group by IP
    const grouped = data?.reduce((acc: any, activity: any) => {
      if (!acc[activity.ip]) {
        acc[activity.ip] = {
          ip: activity.ip,
          count: 0,
          lastSeen: activity.timestamp,
          reasons: []
        };
      }
      acc[activity.ip].count++;
      if (!acc[activity.ip].reasons.includes(activity.reason)) {
        acc[activity.ip].reasons.push(activity.reason);
      }
      return acc;
    }, {});
    
    return Object.values(grouped || {});
  } catch (error) {
    console.error('Error in getSuspiciousActivities:', error);
    return [];
  }
}

// General activity logging
export async function logActivity(action: string, ip: string, details: string): Promise<void> {
  try {
    await supabase
      .from('ddos_logs')
      .insert({
        action,
        ip,
        details,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Request logging for analysis
export async function logRequest(ip: string, url: string, method: string, userAgent: string): Promise<void> {
  try {
    await supabase
      .from('request_logs')
      .insert({
        ip,
        url,
        method,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    // Silent fail for request logging
  }
}