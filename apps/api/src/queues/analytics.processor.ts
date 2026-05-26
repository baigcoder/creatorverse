import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export interface AnalyticsJobData {
  type: 'track_event' | 'aggregate_daily';
  payload: Record<string, any>;
}

@Processor('analytics')
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<AnalyticsJobData>) {
    this.logger.log(`Processing analytics job ${job.id} (${job.data.type})`);

    if (job.data.type === 'track_event') {
      const { userId, creatorId, eventType, metadata } = job.data.payload;
      await this.prisma.analyticsEvent.create({
        data: { userId, creatorId, eventType, metadata: (metadata ?? {}) as Prisma.InputJsonObject },
      });
      return { tracked: true };
    }

    if (job.data.type === 'aggregate_daily') {
      const { creatorId, date } = job.data.payload;
      const dayStart = new Date(date);
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const [revenue, enrollments, activeLearners, communityPosts] = await Promise.all([
        this.prisma.order.aggregate({ where: { creatorId, status: 'COMPLETED', createdAt: { gte: dayStart, lt: dayEnd } }, _sum: { amount: true } }),
        this.prisma.enrollment.count({ where: { course: { creatorId }, enrolledAt: { gte: dayStart, lt: dayEnd } } }),
        this.prisma.enrollment.count({ where: { course: { creatorId }, status: 'ACTIVE' } }),
        this.prisma.post.count({ where: { room: { community: { creatorId } }, createdAt: { gte: dayStart, lt: dayEnd } } }),
      ]);

      await this.prisma.dailyCreatorAnalytics.upsert({
        where: { creatorId_date: { creatorId, date: dayStart } },
        update: { revenue: revenue._sum.amount ?? 0, enrollments, activeLearners, communityPosts },
        create: { creatorId, date: dayStart, revenue: revenue._sum.amount ?? 0, enrollments, activeLearners, communityPosts },
      });

      return { aggregated: true, creatorId, date: dayStart };
    }

    return { unknown: true };
  }
}
