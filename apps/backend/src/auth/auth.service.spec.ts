import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const dbUser = {
    id: 'user-1',
    email: 'ali@example.com',
    name: 'Ali Raza',
    role: 'CUSTOMER' as const,
    passwordHash: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    usersService = {
      createCustomer: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      verifyPassword: jest.fn(),
      toResponse: jest.fn((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt })),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') } as unknown as jest.Mocked<JwtService>;

    authService = new AuthService(usersService, jwtService);
  });

  describe('register', () => {
    it('creates a customer and returns a signed token + user', async () => {
      usersService.createCustomer.mockResolvedValue(dbUser);

      const result = await authService.register({
        email: dbUser.email,
        name: dbUser.name,
        password: 'StrongPassw0rd!',
      });

      expect(usersService.createCustomer).toHaveBeenCalledWith(
        dbUser.email,
        dbUser.name,
        'StrongPassw0rd!',
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe(dbUser.email);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: dbUser.id, email: dbUser.email }),
      );
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        authService.login({ email: 'nobody@example.com', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an incorrect password', async () => {
      usersService.findByEmail.mockResolvedValue(dbUser);
      usersService.verifyPassword.mockResolvedValue(false);
      await expect(authService.login({ email: dbUser.email, password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns a token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(dbUser);
      usersService.verifyPassword.mockResolvedValue(true);

      const result = await authService.login({ email: dbUser.email, password: 'correct' });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.id).toBe(dbUser.id);
    });
  });
});
