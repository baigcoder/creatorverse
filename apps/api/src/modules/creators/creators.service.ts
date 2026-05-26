import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: any) {
    const existing = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Creator profile already exists');

    return this.prisma.creatorProfile.create({
      data: {
        userId,
        brandName: dto.brandName,
        bio: dto.bio,
        logoUrl: dto.logoUrl,
        coverUrl: dto.coverUrl,
        customDomain: dto.customDomain,
        slug: dto.slug,
        socialLinks: dto.socialLinks ?? {},
        payoutSettings: dto.payoutSettings ?? {},
      },
    });
  }

  async findById(id: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { courses: true, workshops: true, communities: true, products: true } },
      },
    });
    if (!creator) throw new NotFoundException('Creator profile not found');
    return creator;
  }

  async update(id: string, userId: string, dto: any) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { id } });
    if (!creator) throw new NotFoundException('Creator profile not found');
    if (creator.userId !== userId) throw new ForbiddenException('You can only update your creator profile');

    return this.prisma.creatorProfile.update({
      where: { id },
      data: {
        brandName: dto.brandName,
        bio: dto.bio,
        logoUrl: dto.logoUrl,
        coverUrl: dto.coverUrl,
        customDomain: dto.customDomain,
        socialLinks: dto.socialLinks,
        payoutSettings: dto.payoutSettings,
      },
    });
  }

  async courses(id: string) {
    await this.findById(id);
    return this.prisma.course.findMany({
      where: { creatorId: id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { enrollments: true, lessons: true } } },
    });
  }

  async stats(id: string) {
    await this.findById(id);
    const [courses, students, orders, revenue] = await Promise.all([
      this.prisma.course.count({ where: { creatorId: id } }),
      this.prisma.enrollment.count({ where: { course: { creatorId: id } } }),
      this.prisma.order.count({ where: { creatorId: id } }),
      this.prisma.order.aggregate({ where: { creatorId: id, status: 'COMPLETED' }, _sum: { amount: true } }),
    ]);

    return {
      courses,
      students,
      orders,
      revenue: revenue._sum.amount ?? 0,
    };
  }
}
