import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../lib/api';

export interface AuthUser {
  id?: number;
  sub?: number;
  name: string;
  email: string;
  role: 'super_admin' | 'editor';
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hff_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get<{ user: AuthUser }>('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('hff_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiClient.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    localStorage.setItem('hff_token', data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('hff_token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
