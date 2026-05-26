import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  leaderboard() {
    return this.prisma.pointsLedger.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 20,
    });
  }

  badges() {
    return this.prisma.badge.findMany({ orderBy: { createdAt: 'desc' } });
  }

  achievements(userId: string) {
    return this.prisma.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { earnedAt: 'desc' } });
  }

  async streak(userId: string) {
    return this.prisma.streak.upsert({
      where: { userId },
      update: {},
      create: { userId, currentStreak: 0, longestStreak: 0 },
    });
  }

  challenges() {
    return this.prisma.challenge.findMany({ orderBy: { startDate: 'desc' } });
  }

  async joinChallenge(challengeId: string, userId: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return this.prisma.challengeParticipation.upsert({
      where: { challengeId_userId: { challengeId, userId } },
      update: {},
      create: { challengeId, userId },
    });
  }
}
