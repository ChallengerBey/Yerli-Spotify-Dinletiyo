/**
 * Notification Service
 * Handles creating and managing notifications
 */

export interface NotificationPayload {
  user_id: string;
  notification_type: 'new_song' | 'friend_activity' | 'playlist_update' | 'achievement' | 'promotion' | 'system';
  title: string;
  message: string;
  actor_user_id?: string;
  related_content_type?: 'song' | 'playlist' | 'user' | 'album';
  related_content_id?: string;
  data?: Record<string, any>;
}

/**
 * Send notification to a user
 */
export async function sendNotification(payload: NotificationPayload) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Notify about a new song
 */
export async function notifyNewSong(
  userId: string,
  songTitle: string,
  songId: string,
  artist: string
) {
  return sendNotification({
    user_id: userId,
    notification_type: 'new_song',
    title: '🎵 Yeni Şarkı Yayınlandı',
    message: `"${songTitle}" - ${artist} dinleme listenize eklendi`,
    related_content_type: 'song',
    related_content_id: songId,
    data: { artist },
  });
}

/**
 * Notify about friend activity
 */
export async function notifyFriendActivity(
  userId: string,
  friendName: string,
  friendId: string,
  activity: string
) {
  return sendNotification({
    user_id: userId,
    notification_type: 'friend_activity',
    title: '👥 Arkadaş Aktivitesi',
    message: `${friendName} ${activity}`,
    actor_user_id: friendId,
    related_content_type: 'user',
    related_content_id: friendId,
  });
}

/**
 * Notify about playlist updates
 */
export async function notifyPlaylistUpdate(
  userId: string,
  playlistName: string,
  playlistId: string,
  updatedBy: string,
  change: string
) {
  return sendNotification({
    user_id: userId,
    notification_type: 'playlist_update',
    title: '📝 Playlist Güncellendi',
    message: `"${playlistName}" tarafından ${change} güncellendi`,
    actor_user_id: updatedBy,
    related_content_type: 'playlist',
    related_content_id: playlistId,
  });
}

/**
 * Notify about achievements
 */
export async function notifyAchievement(
  userId: string,
  achievementName: string,
  achievementIcon: string,
  description: string
) {
  return sendNotification({
    user_id: userId,
    notification_type: 'achievement',
    title: `${achievementIcon} Başarı Kazandın!`,
    message: `${achievementName}: ${description}`,
    data: { icon: achievementIcon },
  });
}

/**
 * Notify about special promotions
 */
export async function notifyPromotion(
  userId: string,
  title: string,
  message: string
) {
  return sendNotification({
    user_id: userId,
    notification_type: 'promotion',
    title,
    message,
  });
}

/**
 * Notify about system events
 */
export async function notifySystemEvent(
  userId: string,
  message: string
) {
  return sendNotification({
    user_id: userId,
    notification_type: 'system',
    title: '📢 Sistem Bildirimi',
    message,
  });
}

/**
 * Broadcast notification to multiple users
 */
export async function broadcastNotification(
  userIds: string[],
  payload: Omit<NotificationPayload, 'user_id'>
) {
  const promises = userIds.map((userId) =>
    sendNotification({ ...payload, user_id: userId })
  );

  return Promise.allSettled(promises);
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
  limit = 20,
  unreadOnly = false
) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(unreadOnly && { unread: 'true' }),
    });

    const response = await fetch(`/api/notifications?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}
