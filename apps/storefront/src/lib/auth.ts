import { apiFetch } from './api';
import type { AuthResponse, AuthUser } from '@/types/api';

const TOKEN_KEY = 'ea_access_token';
const USER_KEY = 'ea_user';

export function saveSession(session: AuthResponse) {
  try {
    window.localStorage.setItem(TOKEN_KEY, session.accessToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    // localStorage unavailable (e.g. private browsing) — session just won't persist.
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function hasToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return false;
  }
}

export function register(input: { email: string; name: string; password: string }) {
  return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export function fetchMe() {
  return apiFetch<AuthUser>('/auth/me', { auth: true, noStore: true });
}
