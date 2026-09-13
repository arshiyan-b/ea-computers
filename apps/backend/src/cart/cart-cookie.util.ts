import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * Resolves the guest cart session id from a signed cookie, creating and
 * setting one if it's missing. Returns `undefined` when the caller is an
 * authenticated user (no guest session is needed in that case).
 */
export function resolveGuestSessionId(
  req: Request,
  res: Response,
  cookieName: string,
  isAuthenticated: boolean,
): string | undefined {
  if (isAuthenticated) return undefined;

  const existing = (req.signedCookies ?? {})[cookieName] as string | undefined;
  if (existing) return existing;

  const sessionId = randomUUID();
  res.cookie(cookieName, sessionId, {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
  });
  return sessionId;
}

export function readGuestSessionId(req: Request, cookieName: string): string | undefined {
  return (req.signedCookies ?? {})[cookieName] as string | undefined;
}

export function clearGuestSessionCookie(res: Response, cookieName: string): void {
  res.clearCookie(cookieName);
}
