
import { User } from '../types';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Ahmet Yılmaz', avatar: 'https://picsum.photos/seed/1/200', status: 'online', bio: 'Müzik ve kodlama aşığı.' },
  { id: '2', name: 'Zeynep Kaya', avatar: 'https://picsum.photos/seed/2/200', status: 'offline', bio: 'Gezgin ve fotoğrafçı.' },
  { id: '3', name: 'Can Demir', avatar: 'https://picsum.photos/seed/3/200', status: 'online', bio: 'Gamer ve tasarımcı.' },
  { id: '4', name: 'Merve Arslan', avatar: 'https://picsum.photos/seed/4/200', status: 'offline', bio: 'Kitap kurdu.' },
  { id: '5', name: 'Emre Yıldız', avatar: 'https://picsum.photos/seed/5/200', status: 'online', bio: 'Spor ve teknoloji.' },
];

export const dbService = {
  getUsers: async (search: string = ''): Promise<User[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const allUsers = [...INITIAL_USERS];
    const friends = JSON.parse(localStorage.getItem('friends') || '[]');
    
    return allUsers
      .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
      .map(u => ({
        ...u,
        isFriend: friends.includes(u.id)
      }));
  },

  getFriends: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    const friendsIds = JSON.parse(localStorage.getItem('friends') || '[]');
    return INITIAL_USERS
      .filter(u => friendsIds.includes(u.id))
      .map(u => ({ ...u, isFriend: true }));
  },

  addFriend: async (userId: string): Promise<void> => {
    const friends = JSON.parse(localStorage.getItem('friends') || '[]');
    if (!friends.includes(userId)) {
      friends.push(userId);
      localStorage.setItem('friends', JSON.stringify(friends));
    }
  },

  removeFriend: async (userId: string): Promise<void> => {
    let friends = JSON.parse(localStorage.getItem('friends') || '[]');
    friends = friends.filter((id: string) => id !== userId);
    localStorage.setItem('friends', JSON.stringify(friends));
  },

  getRandomUser: async (): Promise<User> => {
    const randomIndex = Math.floor(Math.random() * INITIAL_USERS.length);
    const user = INITIAL_USERS[randomIndex];
    const friends = JSON.parse(localStorage.getItem('friends') || '[]');
    return { ...user, isFriend: friends.includes(user.id) };
  }
};
