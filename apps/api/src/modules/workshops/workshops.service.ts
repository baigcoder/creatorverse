import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';
import { GamificationTriggerService } from '../../common/services/gamification-trigger.service';
import { NotificationDispatcher } from '../../common/services/notification-dispatcher.service';

@Injectable()
export class WorkshopsService {
  private readonly logger = new Logger(WorkshopsService.name);

  constructor(
    private prisma: PrismaService,
    private gamification: GamificationTriggerService,
    private notifications: NotificationDispatcher,
  ) {}

  async findAll(params: { page: number; limit: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkshopWhereInput = {};
    if (status) where.status = status as Prisma.WorkshopWhereInput['status'];
    else where.status = { in: ['SCHEDULED', 'LIVE'] };

    const [data, total] = await Promise.all([
      this.prisma.workshop.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
          _count: { select: { registrations: true } },
        },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.workshop.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
        _count: { select: { registrations: true } },
      },
    });

    if (!workshop || !['SCHEDULED', 'LIVE', 'COMPLETED'].includes(workshop.status)) {
      throw new NotFoundException('Workshop not found');
    }
    return workshop;
  }

  async findBySlug(slug: string) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { slug },
      include: {
        creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
        _count: { select: { registrations: true } },
      },
    });
    if (!workshop || !['SCHEDULED', 'LIVE', 'COMPLETED'].includes(workshop.status)) {
      throw new NotFoundException('Workshop not found');
    }
    return workshop;
  }

  async create(userId: string, dto: any) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');

    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + nanoid(6);

    return this.prisma.workshop.create({
      data: {
        creatorId: creator.id,
        title: dto.title,
        slug,
        description: dto.description,
        thumbnailUrl: dto.thumbnailUrl,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        meetingProvider: dto.meetingProvider || 'ZOOM',
        meetingUrl: dto.meetingUrl,
        price: dto.price ?? 0,
        currency: dto.currency || 'USD',
        status: 'DRAFT',
        maxAttendees: dto.maxAttendees,
      },
    });
  }

  async update(id: string, userId: string, role: string, dto: any) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id } });
    if (!workshop) throw new NotFoundException('Workshop not found');

    await this.verifyOwnership(workshop.creatorId, userId, role);

    return this.prisma.workshop.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string, role: string) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id } });
    if (!workshop) throw new NotFoundException('Workshop not found');

    await this.verifyOwnership(workshop.creatorId, userId, role);

    await this.prisma.workshop.delete({ where: { id } });
  }

  async register(workshopId: string, userId: string) {
    const workshop = await this.prisma.workshop.findUnique({ where: { id: workshopId } });
    if (!workshop) throw new NotFoundException('Workshop not found');
    if (workshop.status !== 'SCHEDULED' && workshop.status !== 'LIVE') {
      throw new ForbiddenException('Workshop is not available for registration');
    }

    const existing = await this.prisma.workshopRegistration.findUnique({
      where: { workshopId_userId: { workshopId, userId } },
    });
    if (existing) throw new ConflictException('Already registered for this workshop');

    if (Number(workshop.price) > 0) {
      return {
        checkoutRequired: true,
        orderType: 'WORKSHOP',
        referenceId: workshop.id,
        amount: workshop.price,
        currency: workshop.currency,
        message: 'Paid workshop registration requires checkout before access is granted.',
      };
    }

    const registration = await this.prisma.workshopRegistration.create({
      data: { workshopId, userId, registeredAt: new Date() },
    });

    await this.runSideEffect('workshop registration notification', async () => {
      await this.notifications.sendWorkshopReminder(userId, workshop.title, workshop.id);
    });

    return registration;
  }

  async markAttendance(workshopId: string, userId: string, data: { attended: boolean; attendanceMinutes?: number }) {
    const registration = await this.prisma.workshopRegistration.findUnique({
      where: { workshopId_userId: { workshopId, userId } },
    });
    if (!registration) throw new NotFoundException('Registration not found');

    const updated = await this.prisma.workshopRegistration.update({
      where: { id: registration.id },
      data: {
        attended: data.attended,
        attendanceMinutes: data.attendanceMinutes ?? 0,
      },
    });

    if (data.attended && !registration.attended) {
      await this.runSideEffect('workshop attendance gamification', async () => {
        await this.gamification.onWorkshopAttendance(userId, workshopId);
      });
    }

    return updated;
  }

  private async runSideEffect(label: string, effect: () => Promise<void>) {
    try {
      await effect();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Skipped ${label}: ${message}`);
    }
  }

  private async verifyOwnership(creatorId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== creatorId) {
      throw new ForbiddenException('Not your workshop');
    }
  }
}
