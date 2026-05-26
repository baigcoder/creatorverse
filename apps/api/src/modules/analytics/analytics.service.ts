import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AnalyticsQueryDto, TrackEventDto } from './analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async creatorOverview(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');

    const [revenue, enrollments, activeLearners, communityPosts, recentOrders] = await Promise.all([
      this.prisma.order.aggregate({ where: { creatorId: creator.id, status: 'COMPLETED' }, _sum: { amount: true } }),
      this.prisma.enrollment.count({ where: { course: { creatorId: creator.id } } }),
      this.prisma.enrollment.count({ where: { course: { creatorId: creator.id }, status: 'ACTIVE' } }),
      this.prisma.post.count({ where: { room: { community: { creatorId: creator.id } } } }),
      this.prisma.order.findMany({ where: { creatorId: creator.id }, take: 8, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true } } } }),
    ]);

    return {
      revenue: revenue._sum.amount ?? 0,
      enrollments,
      activeLearners,
      communityPosts,
      recentOrders,
    };
  }

  course(id: string) {
    return this.prisma.courseAnalytics.findMany({ where: { courseId: id }, orderBy: { date: 'asc' } });
  }

  async funnel(userId: string, query?: AnalyticsQueryDto) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');

    const [pageViews, startedCheckout, completedPayment, enrollments] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { creatorId: creator.id, eventType: 'PAGE_VIEW' } }),
      this.prisma.analyticsEvent.count({ where: { creatorId: creator.id, eventType: 'CHECKOUT_STARTED' } }),
      this.prisma.order.count({ where: { creatorId: creator.id, status: 'COMPLETED' } }),
      this.prisma.enrollment.count({ where: { course: { creatorId: creator.id } } }),
    ]);

    return { pageViews: pageViews || 0, startedCheckout, completedPayment, enrollments };
  }

  async community(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return this.prisma.community.findMany({
      where: { creatorId: creator.id },
      include: { rooms: { include: { _count: { select: { posts: true } } } } },
    });
  }

  async trackEvent(userId: string, dto: TrackEventDto) {
    const creatorId = typeof dto.metadata?.creatorId === 'string' ? dto.metadata.creatorId : null;
    return this.prisma.analyticsEvent.create({
      data: {
        userId,
        creatorId,
        eventType: dto.eventType,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonObject,
      },
    });
  }
}
