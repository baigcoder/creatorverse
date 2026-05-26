import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AdminQueryDto, ModerateContentDto, UpdatePlatformSettingDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async users(query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, role: true, status: true, avatarUrl: true, createdAt: true } }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async updateUserStatus(id: string, status: UserStatus, actorId?: string) {
    const user = await this.prisma.user.update({ where: { id }, data: { status } });
    await this.audit(actorId, 'admin.user_status_updated', 'User', id, { status });
    return user;
  }

  async creators() {
    return this.prisma.creatorProfile.findMany({ include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { courses: true, orders: true } } } });
  }

  async courses(query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.prisma.course.findMany({ include: { creator: { select: { id: true, brandName: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit });
  }

  async payments(query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.prisma.order.findMany({ include: { payments: true, refunds: true, user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit });
  }

  async reports(query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.prisma.analyticsEvent.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit });
  }

  async moderation(query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.prisma.post.findMany({ include: { author: { select: { id: true, name: true, email: true } }, room: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit });
  }

  async logs(query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.prisma.auditLog.findMany({ include: { actor: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit });
  }

  async systemHealth() {
    const [users, courses, orders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.order.count(),
    ]);
    const redisHost = this.configService.get<string>('redis.host');
    const redisPort = this.configService.get<number>('redis.port');
    const stripeSecret = this.configService.get<string>('stripe.secretKey');
    const razorpayKeyId = this.configService.get<string>('razorpay.keyId');
    const razorpayKeySecret = this.configService.get<string>('razorpay.keySecret');
    const s3Bucket = this.configService.get<string>('storage.bucket');
    const s3AccessKey = this.configService.get<string>('storage.accessKey');
    const s3SecretKey = this.configService.get<string>('storage.secretKey');
    const resendKey = this.configService.get<string>('email.resendApiKey');
    const openaiKey = this.configService.get<string>('ai.openaiApiKey');
    const geminiKey = this.configService.get<string>('ai.geminiApiKey');
    const anthropicKey = this.configService.get<string>('ai.anthropicApiKey');

    return {
      status: 'ok',
      database: 'connected',
      redis: redisHost && redisPort ? 'configured' : 'missing',
      queues: redisHost && redisPort ? 'configured' : 'missing',
      providers: {
        stripeConfigured: Boolean(stripeSecret),
        razorpayConfigured: Boolean(razorpayKeyId && razorpayKeySecret),
        s3Configured: Boolean(s3Bucket && s3AccessKey && s3SecretKey),
        resendConfigured: Boolean(resendKey),
        aiConfigured: Boolean(openaiKey || geminiKey || anthropicKey),
      },
      users,
      courses,
      orders,
      checkedAt: new Date(),
    };
  }

  async moderateContent(id: string, actorId: string, dto: ModerateContentDto) {
    if (dto.action === 'DELETE') {
      await this.prisma.post.delete({ where: { id } });
      await this.audit(actorId, 'admin.moderation.delete', 'Post', id, { reason: dto.reason });
      return { id, action: dto.action };
    }

    const data: Prisma.PostUpdateInput = {};
    if (dto.action === 'PIN') data.pinned = true;
    if (dto.action === 'UNPIN') data.pinned = false;
    if (dto.action === 'REJECT') data.content = '[removed by moderation]';

    const post = await this.prisma.post.update({ where: { id }, data });
    await this.audit(actorId, `admin.moderation.${dto.action.toLowerCase()}`, 'Post', id, { reason: dto.reason });
    return post;
  }

  settings() {
    return this.prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async updateSetting(actorId: string, dto: UpdatePlatformSettingDto) {
    const setting = await this.prisma.platformSetting.upsert({
      where: { key: dto.key },
      update: { value: dto.value as Prisma.InputJsonObject, updatedBy: actorId },
      create: { key: dto.key, value: dto.value as Prisma.InputJsonObject, updatedBy: actorId },
    });
    await this.audit(actorId, 'admin.setting_updated', 'PlatformSetting', setting.id, { key: dto.key });
    return setting;
  }

  private audit(actorId: string | undefined, action: string, entityType: string, entityId: string, metadata: Record<string, unknown>) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata as Prisma.InputJsonObject,
      },
    });
  }
}
