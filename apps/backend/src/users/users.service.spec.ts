import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('UsersService', () => {
  let prisma: PrismaMock;
  let usersService: UsersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    usersService = new UsersService(prisma as any);
  });

  it('hashes the password and never stores it in plain text', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }: any) => ({ id: 'u1', ...data }));

    const user = await usersService.createCustomer('new@example.com', 'New User', 'PlainPassw0rd!');

    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe('PlainPassw0rd!');
    expect(user.passwordHash.length).toBeGreaterThan(20);
  });

  it('rejects registration when the email is already taken', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(
      usersService.createCustomer('taken@example.com', 'Someone', 'Password123!'),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException for a missing user id', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(usersService.findById('missing')).rejects.toThrow(NotFoundException);
  });

  it('verifies a correct password and rejects an incorrect one', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }: any) => ({ id: 'u1', ...data }));
    const user = await usersService.createCustomer('a@example.com', 'A', 'CorrectHorse1!');

    await expect(usersService.verifyPassword(user, 'CorrectHorse1!')).resolves.toBe(true);
    await expect(usersService.verifyPassword(user, 'WrongPassword')).resolves.toBe(false);
  });
});
