import { Injectable, Logger } from '@nestjs/common';
import { BadgeType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GamificationTriggerService {
  private readonly logger = new Logger(GamificationTriggerService.name);

  constructor(private prisma: PrismaService) {}

  async awardBadge(userId: string, badgeType: BadgeType, criteria: Record<string, unknown>) {
    const badge = await this.prisma.badge.findFirst({ where: { type: badgeType, criteria: criteria as Prisma.InputJsonObject } });
    if (!badge) return null;
    const existing = await this.prisma.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } });
    if (existing) return existing;
    return this.prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
  }

  async addPoints(userId: string, points: number, reason: string, referenceType?: string, referenceId?: string) {
    await this.prisma.pointsLedger.create({ data: { userId, points, reason, referenceType, referenceId } });
  }

  async updateStreak(userId: string) {
    const streak = await this.prisma.streak.upsert({
      where: { userId },
      update: {},
      create: { userId, currentStreak: 0, longestStreak: 0 },
    });

    const now = new Date();
    const lastActive = streak.lastActiveAt;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);

    if (lastActiveAt(lastActive, today)) return streak;
    if (lastActiveAt(lastActive, yesterday)) {
      const newStreak = streak.currentStreak + 1;
      return this.prisma.streak.update({ where: { userId }, data: { currentStreak: newStreak, longestStreak: Math.max(newStreak, streak.longestStreak), lastActiveAt: now } });
    }
    return this.prisma.streak.update({ where: { userId }, data: { currentStreak: 1, longestStreak: Math.max(1, streak.longestStreak), lastActiveAt: now } });
  }

  async onCourseEnrollment(userId: string, courseId: string) {
    await this.addPoints(userId, 10, 'Course enrollment', 'COURSE', courseId);
    await this.updateStreak(userId);
    const enrollments = await this.prisma.enrollment.count({ where: { userId } });
    if (enrollments === 1) await this.awardBadge(userId, 'COURSE_COMPLETION', { type: 'first_enrollment' });
    if (enrollments === 5) await this.awardBadge(userId, 'COURSE_COMPLETION', { type: 'five_enrollments' });
  }

  async onLessonComplete(userId: string, lessonId: string, courseId: string) {
    await this.addPoints(userId, 5, 'Lesson completed', 'LESSON', lessonId);
    await this.updateStreak(userId);
  }

  async onCourseComplete(userId: string, courseId: string) {
    await this.addPoints(userId, 50, 'Course completed', 'COURSE', courseId);
    await this.awardBadge(userId, 'COURSE_COMPLETION', { type: 'course_completed' });
  }

  async onQuizPass(userId: string, quizId: string) {
    await this.addPoints(userId, 15, 'Quiz passed', 'QUIZ', quizId);
  }

  async onCommunityPost(userId: string, postId: string) {
    await this.addPoints(userId, 3, 'Community post', 'POST', postId);
    await this.updateStreak(userId);
  }

  async onWorkshopAttendance(userId: string, workshopId: string) {
    await this.addPoints(userId, 20, 'Workshop attendance', 'WORKSHOP', workshopId);
    await this.updateStreak(userId);
  }
}

function lastActiveAt(lastActive: Date, date: Date): boolean {
  const a = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return a.getTime() === b.getTime();
}
