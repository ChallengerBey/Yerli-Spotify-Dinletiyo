import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9002/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  bpm: number;
  color?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  songs: Song[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Songs API
export const songsAPI = {
  getAll: () => apiClient.get<Song[]>('/songs'),
  getById: (id: string) => apiClient.get<Song>(`/songs/${id}`),
  search: (query: string) => apiClient.get<Song[]>('/songs/search', { params: { q: query } }),
  getRecommendations: (limit: number = 10) => 
    apiClient.get<Song[]>('/songs/recommendations', { params: { limit } }),
  getByCategory: (category: string) => 
    apiClient.get<Song[]>(`/songs/category/${category}`),
};

// Playlists API
export const playlistsAPI = {
  getAll: () => apiClient.get<Playlist[]>('/playlists'),
  getById: (id: string) => apiClient.get<Playlist>(`/playlists/${id}`),
  create: (data: Omit<Playlist, 'id' | 'createdAt'>) => 
    apiClient.post<Playlist>('/playlists', data),
  update: (id: string, data: Partial<Playlist>) => 
    apiClient.put<Playlist>(`/playlists/${id}`, data),
  delete: (id: string) => apiClient.delete(`/playlists/${id}`),
  addSong: (playlistId: string, songId: string) => 
    apiClient.post(`/playlists/${playlistId}/songs`, { songId }),
  removeSong: (playlistId: string, songId: string) => 
    apiClient.delete(`/playlists/${playlistId}/songs/${songId}`),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get<User>('/user/profile'),
  updateProfile: (data: Partial<User>) => 
    apiClient.put<User>('/user/profile', data),
  getFavorites: () => apiClient.get<Song[]>('/user/favorites'),
  addFavorite: (songId: string) => 
    apiClient.post('/user/favorites', { songId }),
  removeFavorite: (songId: string) => 
    apiClient.delete(`/user/favorites/${songId}`),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    apiClient.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) => 
    apiClient.post<{ token: string; user: User }>('/auth/register', { email, password, name }),
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
};

export default apiClient;
