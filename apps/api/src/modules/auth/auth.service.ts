import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHmac, randomBytes } from 'crypto';
import { nanoid } from 'nanoid';
import { RegisterDto, LoginDto, SupabaseExchangeDto } from './auth.dto';
import { EmailService } from '../../common/services/email.service';
import { SupabaseAuthService } from './supabase-auth.service';

type RequestContext = {
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly tokenPepper: string;
  private readonly requireEmailVerification: boolean;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private supabaseAuthService: SupabaseAuthService,
  ) {
    this.refreshSecret = this.configService.get<string>('jwt.refreshSecret') || 'change-me-in-production-refresh-secret';
    this.tokenPepper = this.configService.get<string>('auth.tokenPepper') || this.refreshSecret;
    this.requireEmailVerification = this.configService.get<boolean>('auth.requireEmailVerification') ?? false;
  }

  async register(dto: RegisterDto, context: RequestContext = {}) {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const verificationToken = this.createOpaqueToken();
    const status = this.requireEmailVerification ? 'PENDING_VERIFICATION' : 'ACTIVE';
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
        role: dto.role || 'LEARNER',
        status,
        emailVerified: !this.requireEmailVerification,
        emailVerificationTokenHash: this.hashOpaqueToken(verificationToken),
        emailVerificationExpiresAt: this.hoursFromNow(24),
      },
    });

    if (dto.role === 'CREATOR') {
      await this.createCreatorProfile(user.id, dto.name.trim());
    }

    await this.audit('auth.register', user.id, 'User', user.id, context, {
      role: user.role,
      emailVerificationRequired: this.requireEmailVerification,
    });

    if (this.requireEmailVerification) {
      await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
      return {
        user: this.sanitizeUser(user),
        accessToken: null,
        refreshToken: null,
        verificationToken: this.exposeDevToken(verificationToken),
      };
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, refreshToken, context);
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      verificationToken: this.exposeDevToken(verificationToken),
    };
  }

  async login(dto: LoginDto, context: RequestContext = {}) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended');
    }

    if (user.status === 'DELETED') {
      throw new UnauthorizedException('Account not found');
    }

    if (this.requireEmailVerification && user.status === 'PENDING_VERIFICATION') {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      await this.audit('auth.login_failed', user.id, 'User', user.id, context, { reason: 'bad_password' });
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueSessionForUser(user, context, 'auth.login');
  }

  async exchangeSupabaseToken(dto: SupabaseExchangeDto, context: RequestContext = {}) {
    const identity = await this.supabaseAuthService.verifyAccessToken(dto.accessToken);
    const existingBySupabaseId = await this.prisma.user.findUnique({
      where: { supabaseUserId: identity.supabaseUserId },
    });
    const existingByEmail = existingBySupabaseId
      ? null
      : await this.prisma.user.findUnique({ where: { email: identity.email } });

    if (existingByEmail?.supabaseUserId && existingByEmail.supabaseUserId !== identity.supabaseUserId) {
      throw new ConflictException('This email is already linked to another Supabase account');
    }

    const requestedRole = dto.role === 'CREATOR' ? 'CREATOR' : 'LEARNER';
    const displayName = (dto.name || identity.name || identity.email.split('@')[0] || 'SkillMango User').trim();
    let user = existingBySupabaseId ?? existingByEmail;

    if (user?.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended');
    }

    if (user?.status === 'DELETED') {
      throw new UnauthorizedException('Account not found');
    }

    if (user) {
      const shouldActivate = user.status === 'PENDING_VERIFICATION' && identity.emailVerified;
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          supabaseUserId: user.supabaseUserId ?? identity.supabaseUserId,
          emailVerified: user.emailVerified || identity.emailVerified,
          status: shouldActivate ? 'ACTIVE' : user.status,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          supabaseUserId: identity.supabaseUserId,
          name: displayName,
          email: identity.email,
          passwordHash: await argon2.hash(this.createOpaqueToken()),
          role: requestedRole,
          status: 'ACTIVE',
          emailVerified: identity.emailVerified,
        },
      });

      if (requestedRole === 'CREATOR') {
        await this.createCreatorProfile(user.id, displayName);
      }
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    return this.issueSessionForUser(user, context, 'auth.supabase_exchange', {
      supabaseUserId: identity.supabaseUserId,
      linkedExistingUser: Boolean(existingBySupabaseId || existingByEmail),
    });
  }

  async logout(userId: string, refreshToken?: string, context: RequestContext = {}) {
    if (refreshToken) {
      await this.prisma.session.updateMany({
        where: { userId, tokenHash: this.hashOpaqueToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    }
    await this.audit('auth.logout', userId, 'User', userId, context);
  }

  async logoutAll(userId: string, context: RequestContext = {}) {
    await this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit('auth.logout_all', userId, 'User', userId, context);
  }

  async refreshTokens(refreshToken: string, context: RequestContext = {}) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const tokenHash = this.hashOpaqueToken(refreshToken);
    const session = await this.prisma.session.findUnique({ where: { tokenHash } });

    let payload: { sub: string; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!session || session.revokedAt) {
      await this.prisma.session.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.audit('auth.refresh_reuse_detected', payload.sub, 'User', payload.sub, context);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date(session.expiresAt) < new Date()) {
      await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.status !== 'ACTIVE') {
      await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      throw new UnauthorizedException('User not found or inactive');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id, user.email, user.role);
    const newTokenHash = this.hashOpaqueToken(newRefreshToken);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), replacedByTokenHash: newTokenHash },
    });
    await this.storeRefreshToken(user.id, newRefreshToken, context, newTokenHash);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async forgotPassword(email: string, context: RequestContext = {}) {
    const user = await this.prisma.user.findUnique({ where: { email: this.normalizeEmail(email) } });
    if (!user || user.status === 'DELETED') return { resetToken: null };

    if (user.passwordResetRequestedAt && Date.now() - user.passwordResetRequestedAt.getTime() < 60_000) {
      return { resetToken: null };
    }

    const resetToken = this.createOpaqueToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: this.hashOpaqueToken(resetToken),
        passwordResetExpiresAt: this.hoursFromNow(1),
        passwordResetRequestedAt: new Date(),
        passwordResetAttempts: 0,
      },
    });
    await this.audit('auth.password_reset_requested', user.id, 'User', user.id, context);
    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return { resetToken: this.exposeDevToken(resetToken) };
  }

  async resetPassword(token: string, newPassword: string, context: RequestContext = {}) {
    const tokenHash = this.hashOpaqueToken(token);
    const user = await this.prisma.user.findFirst({ where: { passwordResetTokenHash: tokenHash } });
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new NotFoundException('Password reset token not found or expired');
    }

    if (user.passwordResetAttempts >= 5) {
      throw new BadRequestException('Password reset token has too many failed attempts');
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          passwordResetRequestedAt: null,
          passwordResetAttempts: 0,
        },
      }),
      this.prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await this.audit('auth.password_reset_completed', user.id, 'User', user.id, context);
  }

  async verifyEmail(token: string, context: RequestContext = {}) {
    const tokenHash = this.hashOpaqueToken(token);
    const user = await this.prisma.user.findFirst({ where: { emailVerificationTokenHash: tokenHash } });
    if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        status: user.status === 'PENDING_VERIFICATION' ? 'ACTIVE' : user.status,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    });
    await this.audit('auth.email_verified', user.id, 'User', user.id, context);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async issueSessionForUser(
    user: { id: string; email: string; role: string; [key: string]: unknown },
    context: RequestContext,
    auditAction: string,
    metadata: Record<string, unknown> = {},
  ) {
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, refreshToken, context);
    await this.audit(auditAction, user.id, 'User', user.id, context, metadata);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessExpiry = this.configService.get<string>('jwt.accessExpiry') || '15m';
    const refreshExpiry = this.configService.get<string>('jwt.refreshExpiry') || '7d';
    const accessOptions = { expiresIn: accessExpiry } as Parameters<JwtService['signAsync']>[1];
    const refreshOptions = {
      expiresIn: refreshExpiry,
      secret: this.refreshSecret,
    } as Parameters<JwtService['signAsync']>[1];

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role, jti: nanoid(16) },
      accessOptions,
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, type: 'refresh', jti: nanoid(16) },
      refreshOptions,
    );

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
    context: RequestContext,
    precomputedTokenHash?: string,
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenHash = precomputedTokenHash ?? this.hashOpaqueToken(token);

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        userAgent: context.userAgent,
        ip: context.ip,
        expiresAt,
      },
    });
  }

  private createOpaqueToken() {
    return randomBytes(32).toString('base64url');
  }

  private async createCreatorProfile(userId: string, brandName: string) {
    const slug = `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${nanoid(6)}`;
    await this.prisma.creatorProfile.create({
      data: {
        userId,
        brandName,
        slug,
      },
    });
  }

  private hashOpaqueToken(token: string) {
    return createHmac('sha256', this.tokenPepper).update(token).digest('hex');
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hoursFromNow(hours: number) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private exposeDevToken(token: string) {
    return this.configService.get<string>('app.env') === 'production' ? undefined : token;
  }

  private async audit(
    action: string,
    actorId: string | null,
    entityType: string,
    entityId: string | null,
    context: RequestContext,
    metadata: Record<string, unknown> = {},
  ) {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata as Prisma.InputJsonObject,
        ip: context.ip,
        userAgent: context.userAgent,
      },
    });
  }

  private sanitizeUser<T extends { passwordHash?: string; [key: string]: unknown }>(user: T) {
    const {
      passwordHash,
      emailVerificationTokenHash,
      emailVerificationExpiresAt,
      passwordResetTokenHash,
      passwordResetExpiresAt,
      passwordResetRequestedAt,
      passwordResetAttempts,
      ...result
    } = user;
    void passwordHash;
    void emailVerificationTokenHash;
    void emailVerificationExpiresAt;
    void passwordResetTokenHash;
    void passwordResetExpiresAt;
    void passwordResetRequestedAt;
    void passwordResetAttempts;
    return result;
  }
}
