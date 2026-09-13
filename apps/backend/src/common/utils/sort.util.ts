import { BadRequestException } from '@nestjs/common';

/**
 * Validates a client-supplied `sort` field against an allow-list so arbitrary
 * database columns can never be reached through query parameters.
 */
export function resolveSortField<T extends string>(
  requested: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!requested) return fallback;
  if (!(allowed as readonly string[]).includes(requested)) {
    throw new BadRequestException(
      `Invalid sort field "${requested}". Allowed values: ${allowed.join(', ')}`,
    );
  }
  return requested as T;
}
