import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';

/**
 * Marks a route as usable by both guests and authenticated users: a valid JWT
 * populates `request.user`, but its absence is not an error (used by the cart,
 * which supports guest sessions).
 */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);
