import { Injectable, Logger } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AppGateway } from '../../gateway/app.gateway';

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
  ) {}

  async send(userId: string, type: NotificationType, title: string, body: string, data?: Record<string, unknown>) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, body, data: (data ?? {}) as Prisma.InputJsonObject },
    });
    this.gateway.sendToUser(userId, 'notification:new', notification);
    this.logger.log(`Notification created: ${notification.id} for user ${userId} - ${title}`);
    return notification;
  }

  async sendEnrollmentConfirmation(userId: string, courseTitle: string, courseId: string) {
    return this.send(userId, 'ENROLLMENT', 'Enrollment Confirmed', `You've been enrolled in ${courseTitle}`, { courseId });
  }

  async sendCourseCompleted(userId: string, courseTitle: string, courseId: string) {
    return this.send(userId, 'ACHIEVEMENT', 'Course Completed!', `Congratulations! You've completed ${courseTitle}`, { courseId });
  }

  async sendNewCommunityPost(userId: string, communityName: string, postId: string) {
    return this.send(userId, 'COMMUNITY_MENTION', 'New Post', `There's a new post in ${communityName}`, { postId });
  }

  async sendPaymentReceived(userId: string, amount: number, currency: string) {
    return this.send(userId, 'PAYMENT', 'Payment Received', `You received ${currency} ${amount.toFixed(2)}`, { amount, currency });
  }

  async sendWorkshopReminder(userId: string, workshopTitle: string, workshopId: string) {
    return this.send(userId, 'WORKSHOP_REMINDER', 'Workshop Starting Soon', `${workshopTitle} is starting soon!`, { workshopId });
  }

  async sendBadgeEarned(userId: string, badgeName: string, badgeId: string) {
    return this.send(userId, 'ACHIEVEMENT', 'Badge Earned!', `You earned the ${badgeName} badge!`, { badgeId });
  }

  async sendStreakMilestone(userId: string, streakDays: number) {
    return this.send(userId, 'STREAK', 'Streak Milestone!', `You're on a ${streakDays}-day streak! Keep it up!`, { streakDays });
  }
}
