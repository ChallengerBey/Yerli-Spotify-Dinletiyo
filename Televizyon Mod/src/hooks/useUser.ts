import { useQuery, useMutation, UseQueryResult } from 'react-query';
import { userAPI, User, Song } from '../lib/api';

export const useUserProfile = (): UseQueryResult<User, Error> => {
  return useQuery('userProfile', () => userAPI.getProfile().then(res => res.data), {
    staleTime: 10 * 60 * 1000,
  });
};

export const useUserFavorites = (): UseQueryResult<Song[], Error> => {
  return useQuery('userFavorites', () => userAPI.getFavorites().then(res => res.data), {
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddFavorite = () => {
  return useMutation((songId: string) => userAPI.addFavorite(songId));
};

export const useRemoveFavorite = () => {
  return useMutation((songId: string) => userAPI.removeFavorite(songId));
};

export const useUpdateProfile = () => {
  return useMutation((data: Partial<User>) => userAPI.updateProfile(data));
};
