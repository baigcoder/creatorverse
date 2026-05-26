import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class LandingPagesService {
  constructor(private prisma: PrismaService) {}

  async findPublished(slug: string) {
    const page = await this.prisma.landingPage.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: { creator: true },
    });
    if (!page) throw new NotFoundException('Landing page not found');
    return page;
  }

  async findMine(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    return this.prisma.landingPage.findMany({ where: { creatorId: creator.id }, orderBy: { updatedAt: 'desc' } });
  }

  async create(userId: string, dto: any) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    const slug = dto.slug ?? `${dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${nanoid(6)}`;

    return this.prisma.landingPage.create({
      data: {
        creatorId: creator.id,
        title: dto.title,
        slug,
        template: dto.template ?? 'course-launch',
        sections: dto.sections ?? this.defaultSections(dto.title),
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const page = await this.prisma.landingPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Landing page not found');
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== page.creatorId) throw new ForbiddenException('Not your landing page');
    return this.prisma.landingPage.update({ where: { id }, data: dto });
  }

  publish(id: string, userId: string) {
    return this.update(id, userId, { status: 'PUBLISHED', publishedAt: new Date() });
  }

  archive(id: string, userId: string) {
    return this.update(id, userId, { status: 'ARCHIVED' });
  }

  private defaultSections(title: string) {
    return [
      { type: 'hero', title, subtitle: 'Launch your learning offer with SkillMango AI', cta: 'Enroll now' },
      { type: 'outcomes', title: 'What you will learn', items: ['Clear outcomes', 'Actionable lessons', 'Certificate-ready progress'] },
      { type: 'pricing', title: 'Simple pricing', cta: 'Start learning' },
      { type: 'faq', title: 'Questions', items: ['Who is this for?', 'How long do I get access?', 'Is there a certificate?'] },
    ];
  }
}
