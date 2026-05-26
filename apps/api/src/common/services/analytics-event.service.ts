import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsEventService {
  private readonly logger = new Logger(AnalyticsEventService.name);

  constructor(private prisma: PrismaService) {}

  async track(userId: string | null, creatorId: string | null, eventType: string, metadata?: Record<string, unknown>) {
    return this.prisma.analyticsEvent.create({
      data: { userId, creatorId, eventType, metadata: (metadata ?? {}) as Prisma.InputJsonObject },
    });
  }

  async trackPageView(userId: string | null, creatorId: string | null, page: string) {
    return this.track(userId, creatorId, 'PAGE_VIEW', { page });
  }

  async trackEnrollment(userId: string, creatorId: string, courseId: string, amount: number) {
    return this.track(userId, creatorId, 'ENROLLMENT', { courseId, amount });
  }

  async trackCourseComplete(userId: string, creatorId: string, courseId: string) {
    return this.track(userId, creatorId, 'COURSE_COMPLETE', { courseId });
  }

  async trackCheckoutStarted(userId: string, creatorId: string, orderType: string, referenceId: string) {
    return this.track(userId, creatorId, 'CHECKOUT_STARTED', { orderType, referenceId });
  }

  async trackPaymentComplete(userId: string, creatorId: string, orderId: string, amount: number) {
    return this.track(userId, creatorId, 'PAYMENT_COMPLETE', { orderId, amount });
  }

  async aggregateDailyStats(creatorId: string, date: Date) {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const events = await this.prisma.analyticsEvent.findMany({
      where: { creatorId, createdAt: { gte: dayStart, lt: dayEnd } },
    });

    const revenue = await this.prisma.order.aggregate({
      where: { creatorId, status: 'COMPLETED', createdAt: { gte: dayStart, lt: dayEnd } },
      _sum: { amount: true },
    });

    const enrollments = await this.prisma.enrollment.count({
      where: { course: { creatorId }, enrolledAt: { gte: dayStart, lt: dayEnd } },
    });

    const activeLearners = await this.prisma.enrollment.count({
      where: { course: { creatorId }, status: 'ACTIVE' },
    });

    const communityPosts = await this.prisma.post.count({
      where: { room: { community: { creatorId } }, createdAt: { gte: dayStart, lt: dayEnd } },
    });

    return this.prisma.dailyCreatorAnalytics.upsert({
      where: { creatorId_date: { creatorId, date: dayStart } },
      update: { revenue: revenue._sum.amount ?? 0, enrollments, activeLearners, communityPosts },
      create: { creatorId, date: dayStart, revenue: revenue._sum.amount ?? 0, enrollments, activeLearners, communityPosts },
    });
  }
}
