import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { LandingPagesService } from './landing-pages.service';

function createPrismaMock(page: unknown) {
  return {
    landingPage: {
      findFirst: vi.fn().mockResolvedValue(page),
    },
  };
}

describe('LandingPagesService', () => {
  it('returns only published landing pages by slug', async () => {
    const page = { id: 'lp_1', slug: 'launch', status: 'PUBLISHED' };
    const prisma = createPrismaMock(page);
    const service = new LandingPagesService(prisma as never);

    await expect(service.findPublished('launch')).resolves.toBe(page);
    expect(prisma.landingPage.findFirst).toHaveBeenCalledWith({
      where: { slug: 'launch', status: 'PUBLISHED' },
      include: { creator: true },
    });
  });

  it('throws 404 when a slug is not published', async () => {
    const prisma = createPrismaMock(null);
    const service = new LandingPagesService(prisma as never);

    await expect(service.findPublished('draft-page')).rejects.toThrow(NotFoundException);
  });
});
