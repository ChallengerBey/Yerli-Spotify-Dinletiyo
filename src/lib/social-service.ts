import { SocialUser } from '@/types/social';
import { supabase } from '@/lib/supabase';

const DEMO_USERS: SocialUser[] = [
  { id: '1', name: 'Ahmet Yılmaz', avatar: 'https://picsum.photos/seed/1/200', status: 'online', bio: 'Müzik ve kodlama aşığı.' },
  { id: '2', name: 'Zeynep Kaya', avatar: 'https://picsum.photos/seed/2/200', status: 'offline', bio: 'Gezgin ve fotoğrafçı.' },
  { id: '3', name: 'Can Demir', avatar: 'https://picsum.photos/seed/3/200', status: 'online', bio: 'Gamer ve tasarımcı.' },
  { id: '4', name: 'Merve Arslan', avatar: 'https://picsum.photos/seed/4/200', status: 'offline', bio: 'Kitap kurdu.' },
  { id: '5', name: 'Emre Yıldız', avatar: 'https://picsum.photos/seed/5/200', status: 'online', bio: 'Spor ve teknoloji.' },
  { id: '6', name: 'Selin Özkan', avatar: 'https://picsum.photos/seed/6/200', status: 'online', bio: 'Sanat ve müzik tutkunu.' },
  { id: '7', name: 'Burak Çelik', avatar: 'https://picsum.photos/seed/7/200', status: 'offline', bio: 'Yazılım geliştirici.' },
  { id: '8', name: 'Ayşe Güneş', avatar: 'https://picsum.photos/seed/8/200', status: 'online', bio: 'Doğa sevgisi.' },
];

export const socialService = {
  getUsers: async (search: string = '', currentUserId?: string): Promise<SocialUser[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      // Try to get real users from database first
      if (currentUserId && currentUserId !== 'undefined') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .ilike('username', `%${search}%`)
          .neq('id', currentUserId)
          .limit(10);

        if (!error && profiles && profiles.length > 0) {
          const friends = await socialService.getFriendIds(currentUserId);
          return profiles.map(p => ({
            id: p.id,
            name: p.username || 'Anonim',
            username: p.username,
            avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`,
            avatar_url: p.avatar_url,
            status: Math.random() > 0.5 ? 'online' : 'offline' as const,
            bio: 'Müzik sevgisi paylaşıyor.',
            isFriend: friends.includes(p.id)
          }));
        }
      }
    } catch (error) {
      console.log('Database error, using demo data:', error);
    }

    // Fallback to demo users
    const friends = JSON.parse(localStorage.getItem('social_friends') || '[]');
    return DEMO_USERS
      .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
      .map(u => ({
        ...u,
        isFriend: friends.includes(u.id)
      }));
  },

  getFriends: async (currentUserId?: string): Promise<SocialUser[]> => {
    console.log('socialService.getFriends called with currentUserId:', currentUserId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (currentUserId && currentUserId !== 'undefined') {
        // Try to get real friends from database
        console.log('Attempting to get friends from database...');
        const { data: friendships, error } = await supabase
          .from('friendships')
          .select(`
            friend_id,
            profiles:friend_id (
              id, username, avatar_url
            )
          `)
          .eq('user_id', currentUserId)
          .eq('status', 'accepted');

        if (!error && friendships && friendships.length > 0) {
          console.log('Found friends in database:', friendships);
          return friendships.map((f: any) => ({
            id: f.profiles.id,
            name: f.profiles.username || 'Anonim',
            username: f.profiles.username,
            avatar: f.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.profiles.username}`,
            avatar_url: f.profiles.avatar_url,
            status: Math.random() > 0.5 ? 'online' : 'offline' as const,
            bio: 'Müzik sevgisi paylaşıyor.',
            isFriend: true
          }));
        } else {
          console.log('No friends found in database or error:', error);
        }
      }
    } catch (error) {
      console.log('Database error, using demo friends:', error);
    }

    // Always check localStorage as fallback
    console.log('Checking localStorage for friends...');
    const friendsIds = JSON.parse(localStorage.getItem('social_friends') || '[]');
    console.log('Friends IDs from localStorage:', friendsIds);
    
    if (friendsIds.length > 0) {
      // Try to get friend details from database first
      try {
        if (currentUserId && currentUserId !== 'undefined') {
          console.log('Trying to get friend details from database...');
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', friendsIds);

          if (!error && profiles && profiles.length > 0) {
            console.log('Found friend profiles in database:', profiles);
            return profiles.map(p => ({
              id: p.id,
              name: p.username || 'Anonim',
              username: p.username,
              avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`,
              avatar_url: p.avatar_url,
              status: Math.random() > 0.5 ? 'online' : 'offline' as const,
              bio: 'Müzik sevgisi paylaşıyor.',
              isFriend: true
            }));
          }
        }
      } catch (error) {
        console.log('Error getting friend profiles:', error);
      }
    }
    
    // Final fallback to demo friends
    const demoFriends = DEMO_USERS
      .filter(u => friendsIds.includes(u.id))
      .map(u => ({ ...u, isFriend: true }));
    
    console.log('Demo friends found:', demoFriends);
    return demoFriends;
  },

  getFriendIds: async (currentUserId?: string): Promise<string[]> => {
    try {
      if (currentUserId && currentUserId !== 'undefined') {
        const { data: friendships, error } = await supabase
          .from('friendships')
          .select('friend_id')
          .eq('user_id', currentUserId)
          .eq('status', 'accepted');

        if (!error && friendships) {
          return friendships.map(f => f.friend_id);
        }
      }
    } catch (error) {
      console.log('Database error, using demo friend IDs:', error);
    }

    return JSON.parse(localStorage.getItem('social_friends') || '[]');
  },

  addFriend: async (userId: string, currentUserId?: string): Promise<void> => {
    console.log('socialService.addFriend called with:', { userId, currentUserId });
    
    let addedToDatabase = false;
    
    try {
      if (currentUserId && currentUserId !== 'undefined' && userId !== currentUserId) {
        // Try to add to database first
        console.log('Attempting to add to database...');
        const { error } = await supabase
          .from('friendships')
          .insert([
            { user_id: currentUserId, friend_id: userId, status: 'accepted' },
            { user_id: userId, friend_id: currentUserId, status: 'accepted' }
          ]);

        if (!error) {
          console.log('Successfully added to database');
          addedToDatabase = true;
        } else {
          console.log('Database error:', error);
        }
      }
    } catch (error) {
      console.log('Database error, using local storage for friends:', error);
    }

    // Always add to localStorage as backup/cache
    console.log('Adding to localStorage as backup...');
    const friends = JSON.parse(localStorage.getItem('social_friends') || '[]');
    console.log('Current friends in localStorage:', friends);
    
    if (!friends.includes(userId)) {
      friends.push(userId);
      localStorage.setItem('social_friends', JSON.stringify(friends));
      console.log('Added friend to localStorage, new list:', friends);
    } else {
      console.log('Friend already exists in localStorage');
    }
  },

  removeFriend: async (userId: string, currentUserId?: string): Promise<void> => {
    try {
      if (currentUserId && currentUserId !== 'undefined') {
        // Try to remove from database first
        await supabase
          .from('friendships')
          .delete()
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`);
      }
    } catch (error) {
      console.log('Database error, using local storage for friend removal:', error);
    }

    // Fallback to localStorage
    let friends = JSON.parse(localStorage.getItem('social_friends') || '[]');
    friends = friends.filter((id: string) => id !== userId);
    localStorage.setItem('social_friends', JSON.stringify(friends));
  },

  getRandomUser: async (currentUserId?: string): Promise<SocialUser> => {
    try {
      // Try to get random user from database first
      if (currentUserId && currentUserId !== 'undefined') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .neq('id', currentUserId)
          .limit(50);

        if (!error && profiles && profiles.length > 0) {
          const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
          const friends = await socialService.getFriendIds(currentUserId);
          
          return {
            id: randomProfile.id,
            name: randomProfile.username || 'Anonim',
            username: randomProfile.username,
            avatar: randomProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomProfile.username}`,
            avatar_url: randomProfile.avatar_url,
            status: Math.random() > 0.5 ? 'online' : 'offline' as const,
            bio: 'Müzik sevgisi paylaşıyor.',
            isFriend: friends.includes(randomProfile.id)
          };
        }
      }
    } catch (error) {
      console.log('Database error, using demo data:', error);
    }

    // Fallback to demo users
    const randomIndex = Math.floor(Math.random() * DEMO_USERS.length);
    const user = DEMO_USERS[randomIndex];
    const friends = JSON.parse(localStorage.getItem('social_friends') || '[]');
    return { ...user, isFriend: friends.includes(user.id) };
  }
};