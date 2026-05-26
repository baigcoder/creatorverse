import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './coupons.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return this.prisma.coupon.findMany({ where: { creatorId: creator.id }, orderBy: { createdAt: 'desc' } });
  }

  async create(userId: string, dto: CreateCouponDto) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return this.prisma.coupon.create({
      data: {
        creatorId: creator.id,
        code: String(dto.code).toUpperCase(),
        discountType: dto.discountType ?? 'PERCENTAGE',
        discountValue: dto.discountValue,
        maxRedemptions: dto.maxRedemptions,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        applicableType: dto.applicableType,
        applicableId: dto.applicableId,
        courseId: dto.courseId,
        status: dto.status ?? 'DRAFT',
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== coupon.creatorId) throw new ForbiddenException('Not your coupon');
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    return this.update(id, userId, { status: 'ARCHIVED' });
  }

  async validate(code: string, reference?: { type?: string; id?: string }) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || coupon.status !== 'PUBLISHED') return { valid: false, reason: 'Coupon is not active' };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, reason: 'Coupon expired' };
    if (coupon.maxRedemptions && coupon.usedCount >= coupon.maxRedemptions) {
      return { valid: false, reason: 'Coupon redemption limit reached' };
    }
    if (coupon.applicableType && reference?.type && coupon.applicableType !== reference.type) {
      return { valid: false, reason: 'Coupon does not apply to this item' };
    }
    if (coupon.applicableId && reference?.id && coupon.applicableId !== reference.id) {
      return { valid: false, reason: 'Coupon does not apply to this item' };
    }
    return { valid: true, coupon };
  }
}
