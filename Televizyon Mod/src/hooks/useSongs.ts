import { useQuery, UseQueryResult } from 'react-query';
import { songsAPI, Song } from '../lib/api';

export const useSongs = (): UseQueryResult<Song[], Error> => {
  return useQuery('songs', () => songsAPI.getAll().then(res => res.data), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSongById = (id: string): UseQueryResult<Song, Error> => {
  return useQuery(['song', id], () => songsAPI.getById(id).then(res => res.data), {
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSongSearch = (query: string): UseQueryResult<Song[], Error> => {
  return useQuery(['songs-search', query], () => songsAPI.search(query).then(res => res.data), {
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRecommendations = (limit: number = 10): UseQueryResult<Song[], Error> => {
  return useQuery(['recommendations', limit], () => songsAPI.getRecommendations(limit).then(res => res.data), {
    staleTime: 10 * 60 * 1000,
  });
};

export const useSongsByCategory = (category: string): UseQueryResult<Song[], Error> => {
  return useQuery(['songs-category', category], () => songsAPI.getByCategory(category).then(res => res.data), {
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};
