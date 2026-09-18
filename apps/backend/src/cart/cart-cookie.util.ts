import { randomUUID } from 'crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Resolves the guest cart session id from a signed cookie, creating and
 * setting one if it's missing. Returns `undefined` when the caller is an
 * authenticated user (no guest session is needed in that case).
 */
export function resolveGuestSessionId(
  req: FastifyRequest,
  res: FastifyReply,
  cookieName: string,
  isAuthenticated: boolean,
): string | undefined {
  if (isAuthenticated) return undefined;

  const existing = readGuestSessionId(req, cookieName);
  if (existing) return existing;

  const sessionId = randomUUID();
  res.setCookie(cookieName, sessionId, {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: '/',
  });
  return sessionId;
}

export function readGuestSessionId(req: FastifyRequest, cookieName: string): string | undefined {
  const raw = req.cookies[cookieName];
  if (!raw) return undefined;
  const unsigned = req.unsignCookie(raw);
  return unsigned.valid && unsigned.value ? unsigned.value : undefined;
}

export function clearGuestSessionCookie(res: FastifyReply, cookieName: string): void {
  res.clearCookie(cookieName, { path: '/' });
}
