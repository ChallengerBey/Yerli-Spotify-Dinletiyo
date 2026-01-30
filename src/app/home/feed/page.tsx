"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ListMusic, UserPlus, Music, Share2, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale/tr";

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

const activityIcons = {
  song_liked: Heart,
  playlist_created: ListMusic,
  friend_added: UserPlus,
  song_played: Music,
  playlist_shared: Share2,
  achievement_earned: Award,
};

const activityColors = {
  song_liked: "text-red-500",
  playlist_created: "text-blue-500",
  friend_added: "text-green-500",
  song_played: "text-purple-500",
  playlist_shared: "text-orange-500",
  achievement_earned: "text-yellow-500",
};

const getActivityMessage = (activity: Activity) => {
  const username = activity.profiles?.username || 'Bir kullanıcı';
  const data = activity.activity_data || {};

  switch (activity.activity_type) {
    case 'song_liked':
      return `${username} bir şarkıyı beğendi: ${data.title || 'Bilinmeyen şarkı'}`;
    case 'playlist_created':
      return `${username} yeni bir playlist oluşturdu: ${data.name || 'İsimsiz playlist'}`;
    case 'friend_added':
      return `${username} yeni bir arkadaş ekledi`;
    case 'song_played':
      return `${username} şu anda dinliyor: ${data.title || 'Bilinmeyen şarkı'}`;
    case 'playlist_shared':
      return `${username} bir playlist paylaştı: ${data.name || 'İsimsiz playlist'}`;
    case 'achievement_earned':
      return `${username} bir başarım kazandı: ${data.achievement_name || 'Başarım'}`;
    default:
      return `${username} bir aktivite gerçekleştirdi`;
  }
};

export default function FeedPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activity");
      const data = await response.json();
      if (data.activities) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Aktiviteler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aktivite Akışı</h1>
        <p className="text-muted-foreground">Arkadaşlarının son aktiviteleri</p>
      </div>

      {activities.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <Music className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Henüz aktivite yok</h3>
            <p className="text-sm text-muted-foreground">
              Arkadaşların aktivite gösterdiğinde burada görünecek
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || Music;
            const iconColor = activityColors[activity.activity_type as keyof typeof activityColors];

            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.profiles.avatar_url} />
                      <AvatarFallback>
                        {activity.profiles.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                        <div className="flex-1">
                          <p className="text-sm">{getActivityMessage(activity)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.created_at), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </p>
                        </div>
                      </div>

                      {activity.activity_data.thumbnail && (
                        <img
                          src={activity.activity_data.thumbnail}
                          alt="Activity"
                          className="mt-3 rounded-md w-full max-w-xs object-cover"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
