import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthenticatedUser } from '../types/authenticated-user.interface';

/** Extracts the authenticated user attached by JwtAuthGuard (undefined for guests). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user?: AuthenticatedUser }>();
    return request.user;
  },
);
