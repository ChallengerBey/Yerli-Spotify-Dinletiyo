/**
 * Offline Downloads Service
 * Handles downloading and managing offline content
 */

export interface DownloadContent {
  id: string;
  title: string;
  artist?: string;
  cover_url?: string;
  duration_ms?: number;
  file_size_bytes: number;
  [key: string]: any;
}

export interface Download {
  id: string;
  content_type: 'song' | 'podcast_episode' | 'playlist';
  content_id: string;
  content_data: DownloadContent;
  file_size_bytes: number;
  download_quality: string;
  created_at: string;
  expires_at: string;
}

export interface StorageQuota {
  total_quota_bytes: number;
  used_quota_bytes: number;
  available_bytes: number;
  usage_percentage: number;
}

/**
 * Get user's storage quota information
 */
export async function getStorageQuota(): Promise<StorageQuota> {
  try {
    const response = await fetch('/api/offline-downloads/quota');

    if (!response.ok) {
      throw new Error('Failed to fetch storage quota');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching storage quota:', error);
    throw error;
  }
}

/**
 * Download content for offline use
 */
export async function downloadContent(
  contentType: 'song' | 'podcast_episode' | 'playlist',
  content: DownloadContent,
  quality: 'low' | 'normal' | 'high' = 'high'
): Promise<Download> {
  try {
    // Check storage quota first
    const quota = await getStorageQuota();
    
    if (quota.used_quota_bytes + content.file_size_bytes > quota.total_quota_bytes) {
      throw new Error('Storage quota exceeded');
    }

    const response = await fetch('/api/offline-downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type: contentType,
        content_id: content.id,
        content_data: {
          title: content.title,
          artist: content.artist,
          cover_url: content.cover_url,
          duration_ms: content.duration_ms,
        },
        file_size_bytes: content.file_size_bytes,
        download_quality: quality,
      }),
    });

    if (response.status === 413) {
      throw new Error('Storage quota exceeded');
    }

    if (!response.ok) {
      throw new Error('Failed to download content');
    }

    return await response.json();
  } catch (error) {
    console.error('Error downloading content:', error);
    throw error;
  }
}

/**
 * Get all offline downloads
 */
export async function getOfflineDownloads(): Promise<Download[]> {
  try {
    const response = await fetch('/api/offline-downloads');

    if (!response.ok) {
      throw new Error('Failed to fetch downloads');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching downloads:', error);
    throw error;
  }
}

/**
 * Delete an offline download
 */
export async function deleteDownload(downloadId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/offline-downloads/${downloadId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete download');
    }

    return true;
  } catch (error) {
    console.error('Error deleting download:', error);
    throw error;
  }
}

/**
 * Check if content is available offline
 */
export async function isContentOffline(
  contentType: string,
  contentId: string
): Promise<boolean> {
  try {
    const downloads = await getOfflineDownloads();
    return downloads.some(
      (d) => d.content_type === contentType && d.content_id === contentId
    );
  } catch (error) {
    console.error('Error checking offline status:', error);
    return false;
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculate remaining storage
 */
export async function getRemainingStorage(): Promise<string> {
  try {
    const quota = await getStorageQuota();
    return formatBytes(quota.available_bytes);
  } catch (error) {
    console.error('Error calculating remaining storage:', error);
    return 'Unknown';
  }
}

/**
 * Clean up expired downloads
 */
export async function cleanupExpiredDownloads(): Promise<number> {
  try {
    const downloads = await getOfflineDownloads();
    const now = new Date();
    const expiredDownloads = downloads.filter(
      (d) => new Date(d.expires_at) < now
    );

    let deletedCount = 0;
    for (const download of expiredDownloads) {
      try {
        await deleteDownload(download.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete expired download ${download.id}:`, error);
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired downloads:', error);
    return 0;
  }
}

/**
 * Get download statistics
 */
export async function getDownloadStats(): Promise<{
  totalDownloads: number;
  totalSize: string;
  quotaUsagePercentage: number;
}> {
  try {
    const [downloads, quota] = await Promise.all([
      getOfflineDownloads(),
      getStorageQuota(),
    ]);

    const totalSize = downloads.reduce(
      (sum, d) => sum + d.file_size_bytes,
      0
    );

    return {
      totalDownloads: downloads.length,
      totalSize: formatBytes(totalSize),
      quotaUsagePercentage: quota.usage_percentage,
    };
  } catch (error) {
    console.error('Error fetching download stats:', error);
    throw error;
  }
}

/**
 * Resume interrupted download
 */
export async function resumeDownload(
  contentType: 'song' | 'podcast_episode' | 'playlist',
  content: DownloadContent,
  quality: 'low' | 'normal' | 'high' = 'high'
): Promise<Download> {
  // Check if already downloaded
  const isOffline = await isContentOffline(contentType, content.id);
  if (isOffline) {
    throw new Error('Content is already downloaded');
  }

  return downloadContent(contentType, content, quality);
}
