import { create } from 'zustand';
import type { AuthUser } from '@/types/api';
import { clearSession, fetchMe, getStoredUser, hasToken, saveSession } from '@/lib/auth';
import * as authApi from '@/lib/auth';

interface AuthState {
  user: AuthUser | null;
  isInitialized: boolean;
  isLoading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  isLoading: false,

  init: async () => {
    if (!hasToken()) {
      set({ isInitialized: true });
      return;
    }
    // Optimistically render the cached user, then verify with the server.
    set({ user: getStoredUser() });
    try {
      const user = await fetchMe();
      set({ user, isInitialized: true });
    } catch {
      clearSession();
      set({ user: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const session = await authApi.login({ email, password });
      saveSession(session);
      set({ user: session.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, name, password) => {
    set({ isLoading: true });
    try {
      const session = await authApi.register({ email, name, password });
      saveSession(session);
      set({ user: session.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearSession();
    set({ user: null });
  },
}));
