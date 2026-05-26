import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';
import { CreateAffiliateDto, PayoutAffiliateDto } from './affiliates.dto';

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAffiliateDto) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return this.prisma.affiliate.create({
      data: {
        creatorId: creator.id,
        userId: dto.userId,
        code: dto.code ?? nanoid(10).toUpperCase(),
        commissionRate: dto.commissionRate ?? 20,
        commissionType: dto.commissionType ?? 'PERCENTAGE',
      },
    });
  }

  async findAll(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return this.prisma.affiliate.findMany({
      where: { creatorId: creator.id },
      include: { user: { select: { id: true, name: true, email: true } }, earnings: true },
    });
  }

  async earnings(id: string, userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { id } });
    if (!affiliate) throw new NotFoundException('Affiliate not found');
    if (affiliate.userId !== userId) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator || creator.id !== affiliate.creatorId) throw new ForbiddenException('Not your affiliate record');
    }
    return this.prisma.affiliateEarning.findMany({ where: { affiliateId: id }, orderBy: { createdAt: 'desc' } });
  }

  async payout(id: string, userId: string, dto: PayoutAffiliateDto) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { id }, include: { creator: true } });
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== affiliate.creatorId) throw new ForbiddenException('Only the creator can process this payout');

    const where = {
      affiliateId: id,
      status: 'PENDING',
      ...(dto.earningIds?.length ? { id: { in: dto.earningIds } } : {}),
    };

    const [earnings, update] = await this.prisma.$transaction([
      this.prisma.affiliateEarning.findMany({ where }),
      this.prisma.affiliateEarning.updateMany({
        where,
        data: { status: 'PAID', paidAt: new Date() },
      }),
    ]);

    const total = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'affiliate.payout',
        entityType: 'Affiliate',
        entityId: id,
        metadata: { count: update.count, total },
      },
    });

    return { paid: update.count, total };
  }
}
