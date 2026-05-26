import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

type MockPrisma = ReturnType<typeof createPrismaMock>;

function createPrismaMock() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    creatorProfile: {
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (operations: unknown[]) => Promise.all(operations)),
  };
}

function createConfigMock(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    'jwt.refreshSecret': 'test-refresh-secret',
    'jwt.accessExpiry': '15m',
    'jwt.refreshExpiry': '7d',
    'auth.tokenPepper': 'test-token-pepper',
    'auth.requireEmailVerification': false,
    'app.env': 'test',
    ...overrides,
  };

  return {
    get: vi.fn((key: string) => values[key]),
  };
}

function createEmailMock() {
  return {
    sendWelcomeEmail: vi.fn(),
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  };
}

function createSupabaseAuthMock() {
  return {
    verifyAccessToken: vi.fn(),
  };
}

function createService(prisma: MockPrisma, config = createConfigMock()) {
  const email = createEmailMock();
  return new AuthService(
    prisma as never,
    new JwtService({ secret: 'test-access-secret' }),
    config as never,
    email as never,
    createSupabaseAuthMock() as never,
  );
}

describe('AuthService', () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createPrismaMock();
  });

  it('registers active users with sanitized output and hashed refresh sessions', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user_1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    }));

    const service = createService(prisma);
    const result = await service.register(
      {
        name: '  Creator One  ',
        email: 'CREATOR@SkillMango.AI',
        password: 'Creator123!',
        role: 'CREATOR',
      },
      { ip: '127.0.0.1', userAgent: 'vitest' },
    );

    expect(result.user.email).toBe('creator@skillmango.ai');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(prisma.creatorProfile.create).toHaveBeenCalledOnce();
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user_1',
        tokenHash: expect.any(String),
        ip: '127.0.0.1',
        userAgent: 'vitest',
      }),
    });
  });

  it('blocks login for pending users when email verification is required', async () => {
    const passwordHash = await argon2.hash('Creator123!');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: 'creator@skillmango.ai',
      passwordHash,
      role: 'CREATOR',
      status: 'PENDING_VERIFICATION',
    });

    const service = createService(prisma, createConfigMock({ 'auth.requireEmailVerification': true }));

    await expect(
      service.login({ email: 'creator@skillmango.ai', password: 'Creator123!' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('rotates refresh tokens, revokes the old session, and creates a distinct replacement', async () => {
    const passwordHash = await argon2.hash('Creator123!');
    const user = {
      id: 'user_1',
      email: 'creator@skillmango.ai',
      passwordHash,
      role: 'CREATOR',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.user.findUnique.mockImplementation(async ({ where }) => {
      if ('email' in where || 'id' in where) return user;
      return null;
    });

    const service = createService(prisma);
    const login = await service.login({ email: 'creator@skillmango.ai', password: 'Creator123!' });
    const firstSessionCreate = prisma.session.create.mock.calls[0][0].data;

    prisma.session.findUnique.mockResolvedValue({
      id: 'session_1',
      userId: user.id,
      tokenHash: firstSessionCreate.tokenHash,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const refresh = await service.refreshTokens(login.refreshToken);
    const replacementSessionCreate = prisma.session.create.mock.calls[1][0].data;

    expect(refresh.refreshToken).not.toBe(login.refreshToken);
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 'session_1' },
      data: {
        revokedAt: expect.any(Date),
        replacedByTokenHash: replacementSessionCreate.tokenHash,
      },
    });
    expect(replacementSessionCreate.tokenHash).not.toBe(firstSessionCreate.tokenHash);
  });

  it('exchanges a verified Supabase token for a SkillMango session and links existing email users', async () => {
    const supabaseAuth = createSupabaseAuthMock();
    supabaseAuth.verifyAccessToken.mockResolvedValue({
      supabaseUserId: 'supabase_user_1',
      email: 'creator@skillmango.ai',
      emailVerified: true,
      name: 'Creator One',
    });

    const existingUser = {
      id: 'user_1',
      supabaseUserId: null,
      email: 'creator@skillmango.ai',
      name: 'Creator One',
      passwordHash: await argon2.hash('Creator123!'),
      role: 'CREATOR',
      status: 'ACTIVE',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.user.findUnique.mockImplementation(async ({ where }) => {
      if ('supabaseUserId' in where) return null;
      if ('email' in where) return existingUser;
      return null;
    });
    prisma.user.update.mockImplementation(async ({ data }) => ({ ...existingUser, ...data }));

    const email = createEmailMock();
    const service = new AuthService(
      prisma as never,
      new JwtService({ secret: 'test-access-secret' }),
      createConfigMock() as never,
      email as never,
      supabaseAuth as never,
    );

    const result = await service.exchangeSupabaseToken({ accessToken: 'supabase.jwt' });

    expect(result.user).toMatchObject({
      id: 'user_1',
      email: 'creator@skillmango.ai',
      supabaseUserId: 'supabase_user_1',
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'user_1', tokenHash: expect.any(String) }),
    });
  });

  it('creates new Supabase users with only learner or creator roles', async () => {
    const supabaseAuth = createSupabaseAuthMock();
    supabaseAuth.verifyAccessToken.mockResolvedValue({
      supabaseUserId: 'supabase_user_2',
      email: 'learner@skillmango.ai',
      emailVerified: true,
      name: 'Learner One',
    });

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user_2',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    }));

    const service = new AuthService(
      prisma as never,
      new JwtService({ secret: 'test-access-secret' }),
      createConfigMock() as never,
      createEmailMock() as never,
      supabaseAuth as never,
    );

    await service.exchangeSupabaseToken({
      accessToken: 'supabase.jwt',
      role: 'SUPER_ADMIN' as never,
      name: 'Learner One',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        supabaseUserId: 'supabase_user_2',
        role: 'LEARNER',
        status: 'ACTIVE',
      }),
    });
    expect(prisma.creatorProfile.create).not.toHaveBeenCalled();
  });
});
