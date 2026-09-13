const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'ea_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

/** Thin authenticated fetch wrapper shared by the auth and data providers. */
export async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const token = getToken();

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };
  if (!(rest.body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token && !skipAuth) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : (body?.message ?? res.statusText);
    throw new HttpError(res.status, message);
  }
  return body as T;
}

export { API_URL };
