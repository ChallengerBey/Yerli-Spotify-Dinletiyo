import { useMutation } from 'react-query';
import { authAPI, User } from '../lib/api';

export const useLogin = () => {
  return useMutation(
    ({ email, password }: { email: string; password: string }) =>
      authAPI.login(email, password).then(res => {
        localStorage.setItem('authToken', res.data.token);
        return res.data;
      })
  );
};

export const useRegister = () => {
  return useMutation(
    ({ email, password, name }: { email: string; password: string; name: string }) =>
      authAPI.register(email, password, name).then(res => {
        localStorage.setItem('authToken', res.data.token);
        return res.data;
      })
  );
};

export const useLogout = () => {
  return useMutation(() => authAPI.logout());
};

export const useIsAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};
