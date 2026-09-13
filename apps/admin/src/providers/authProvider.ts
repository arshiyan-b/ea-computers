import type { AuthProvider } from '@refinedev/core';
import { clearToken, HttpError, request, setToken } from './http';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; name: string; role: 'CUSTOMER' | 'ADMIN' };
}

const USER_KEY = 'ea_admin_user';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const res = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });

      if (res.user.role !== 'ADMIN') {
        return {
          success: false,
          error: { name: 'Access denied', message: 'This account does not have admin access.' },
        };
      }

      setToken(res.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      return { success: true, redirectTo: '/' };
    } catch (err) {
      return {
        success: false,
        error: {
          name: 'Login failed',
          message: err instanceof HttpError ? err.message : 'Invalid email or password',
        },
      };
    }
  },

  logout: async () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    return { success: true, redirectTo: '/login' };
  },

  check: async () => {
    const token = localStorage.getItem('ea_admin_token');
    if (!token) return { authenticated: false, redirectTo: '/login' };

    try {
      const user = await request<{ role: string }>('/auth/me');
      if (user.role !== 'ADMIN') {
        clearToken();
        return { authenticated: false, redirectTo: '/login' };
      }
      return { authenticated: true };
    } catch {
      clearToken();
      return { authenticated: false, redirectTo: '/login' };
    }
  },

  onError: async (error) => {
    if (error?.statusCode === 401) {
      clearToken();
      return { logout: true, redirectTo: '/login' };
    }
    return { error };
  },

  getIdentity: async () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return { id: user.id, name: user.name, email: user.email };
  },
};
