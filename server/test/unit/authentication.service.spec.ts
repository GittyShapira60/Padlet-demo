import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationService } from '../../src/authentication/authentication.service';
import { createPasswordHash } from '../helpers/password-hash';

describe('AuthenticationService', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const configService = {
    get: vi.fn((key: string, defaultValue?: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret';
      }

      if (key === 'JWT_EXPIRES_IN') {
        return '1h';
      }

      return defaultValue;
    }),
  };

  let service: AuthenticationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthenticationService(prisma as never, configService as never);
  });

  describe('login', () => {
    it('returns token when credentials are valid', async () => {
      const password = 'correct-password';
      const passwordHash = await createPasswordHash(password);

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        username: 'alice',
        password_hash: passwordHash,
      });

      const result = await service.login({
        username: 'alice',
        password,
      });

      expect(result.token).toEqual(expect.any(String));
      expect(result.user).toEqual({ id: '1', username: 'alice' });
    });

    it('throws when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ username: 'missing-user', password: 'any-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when password is incorrect', async () => {
      const passwordHash = await createPasswordHash('real-password');

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        username: 'alice',
        password_hash: passwordHash,
      });

      await expect(
        service.login({ username: 'alice', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('creates user and returns token when username is available', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '2',
        username: 'bob',
      });

      const result = await service.register({
        username: 'bob',
        password: 'secret-password',
      });

      expect(prisma.user.create).toHaveBeenCalledOnce();
      expect(result.user).toEqual({ id: '2', username: 'bob' });
      expect(result.token).toEqual(expect.any(String));
    });

    it('throws when username already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        username: 'alice',
        password_hash: 'hash',
      });

      await expect(
        service.register({ username: 'alice', password: 'secret-password' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
