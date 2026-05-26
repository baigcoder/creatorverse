import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMembershipDto, UpdateMembershipDto } from './memberships.dto';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  findAll(creatorId?: string) {
    return this.prisma.membershipPlan.findMany({
      where: { creatorId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id },
      include: { creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } } },
    });
    if (!plan || plan.status !== 'PUBLISHED') throw new NotFoundException('Membership plan not found');
    return plan;
  }

  async create(userId: string, dto: CreateMembershipDto) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return this.prisma.membershipPlan.create({
      data: {
        creatorId: creator.id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        currency: dto.currency ?? 'USD',
        interval: dto.interval ?? 'MONTHLY',
        benefits: dto.benefits ?? [],
        communityAccess: dto.communityAccess ?? false,
        courseIds: dto.courseIds ?? [],
        status: dto.status ?? 'DRAFT',
      },
    });
  }

  async update(id: string, userId: string, role: string, dto: UpdateMembershipDto) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Membership plan not found');
    await this.verifyOwnership(plan.creatorId, userId, role);
    return this.prisma.membershipPlan.update({ where: { id }, data: dto });
  }

  async subscribe(planId: string, userId: string) {
    const plan = await this.prisma.membershipPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'PUBLISHED') throw new NotFoundException('Membership plan not found');

    if (Number(plan.price) > 0) {
      return {
        checkoutRequired: true,
        orderType: 'MEMBERSHIP',
        referenceId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        message: 'Paid membership subscription requires checkout before access is granted.',
      };
    }

    const existing = await this.prisma.subscription.findFirst({
      where: { userId, planId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (plan.interval === 'YEARLY' ? 12 : 1));

    return this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  async cancel(subscriptionId: string, userId: string, role: string) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.userId !== userId && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Not your subscription');
    }

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELED', canceledAt: new Date() },
    });
  }

  private async verifyOwnership(creatorId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== creatorId) throw new ForbiddenException('Not your membership plan');
  }
}
