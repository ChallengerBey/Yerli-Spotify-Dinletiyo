'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      savedUser = sessionStorage.getItem('currentUser');
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Hem localStorage hem sessionStorage'dan kontrol et
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.length === 0) {
        users = JSON.parse(sessionStorage.getItem('users') || '[]');
      }
    } catch (e) { console.error('Error parsing users:', e); users = []; }

    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      throw new Error('E-posta veya şifre hatalı');
    }

    const userData = { id: foundUser.id, email: foundUser.email };
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const signUp = async (email: string, password: string) => {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) { users = []; }

    if (users.find((u: any) => u.email === email)) {
      throw new Error('Bu e-posta zaten kullanımda');
    }

    if (password.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalıdır');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('users', JSON.stringify(users));

    const userData = { id: newUser.id, email: newUser.email };
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}