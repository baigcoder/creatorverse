import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../common/services/email.service';
import { CreateCampaignDto, UpdateCampaignDto } from './marketing.dto';

@Injectable()
export class MarketingService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async list(userId: string) {
    const creator = await this.getCreator(userId);
    return this.prisma.marketingCampaign.findMany({
      where: { creatorId: creator.id },
      include: { _count: { select: { deliveries: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateCampaignDto) {
    const creator = await this.getCreator(userId);
    return this.prisma.marketingCampaign.create({
      data: {
        creatorId: creator.id,
        name: dto.name,
        subject: dto.subject,
        previewText: dto.previewText,
        body: dto.body,
        audience: dto.audience ?? 'ALL',
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCampaignDto) {
    const campaign = await this.getOwnedCampaign(id, userId);
    return this.prisma.marketingCampaign.update({ where: { id: campaign.id }, data: dto });
  }

  async send(id: string, userId: string) {
    const campaign = await this.getOwnedCampaign(id, userId);
    const recipients = await this.resolveRecipients(campaign.creatorId, campaign.audience);

    const deliveries = await Promise.all(
      recipients.map(async (recipient) => {
        const delivery = await this.prisma.campaignDelivery.upsert({
          where: { campaignId_userId: { campaignId: campaign.id, userId: recipient.id } },
          update: { status: 'QUEUED', error: null },
          create: {
            campaignId: campaign.id,
            userId: recipient.id,
            email: recipient.email,
            status: 'QUEUED',
          },
        });

        try {
          await this.emailService.sendEmail(recipient.email, campaign.subject, campaign.body, campaign.previewText ?? undefined, 'custom');
          return this.prisma.campaignDelivery.update({
            where: { id: delivery.id },
            data: { status: 'SENT', sentAt: new Date() },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return this.prisma.campaignDelivery.update({
            where: { id: delivery.id },
            data: { status: 'FAILED', error: message },
          });
        }
      }),
    );

    await this.prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    return { campaignId: campaign.id, queued: deliveries.length };
  }

  private async getCreator(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return creator;
  }

  private async getOwnedCampaign(id: string, userId: string) {
    const creator = await this.getCreator(userId);
    const campaign = await this.prisma.marketingCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.creatorId !== creator.id) throw new ForbiddenException('Not your campaign');
    return campaign;
  }

  private async resolveRecipients(creatorId: string, audience: string) {
    if (audience === 'MEMBERS') {
      return this.prisma.user.findMany({
        where: { subscriptions: { some: { plan: { creatorId }, status: 'ACTIVE' } } },
        select: { id: true, email: true, name: true },
      });
    }

    if (audience === 'CUSTOMERS') {
      return this.prisma.user.findMany({
        where: { orders: { some: { creatorId, status: 'COMPLETED' } } },
        select: { id: true, email: true, name: true },
      });
    }

    return this.prisma.user.findMany({
      where: { enrollments: { some: { course: { creatorId } } } },
      select: { id: true, email: true, name: true },
    });
  }
}
