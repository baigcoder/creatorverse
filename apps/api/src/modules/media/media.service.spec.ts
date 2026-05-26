import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MediaService } from './media.service';

function createConfig(values: Record<string, unknown> = {}) {
  return {
    get: vi.fn((key: string) => values[key]),
  };
}

function createService(prisma: unknown, values: Record<string, unknown> = {}) {
  return new MediaService(createConfig(values) as never, prisma as never);
}

describe('MediaService', () => {
  it('creates creator-prefixed video upload keys and local-dev fallback policies', async () => {
    const prisma = {
      creatorProfile: { findUnique: vi.fn().mockResolvedValue({ id: 'creator_1' }) },
    };
    const service = createService(prisma);

    const result = await service.createUploadPolicy('user_1', {
      filename: 'Intro Lesson!.mp4',
      contentType: 'video/mp4',
      size: 1024,
      folder: 'videos/course intros',
    });

    expect(result).toMatchObject({
      provider: 'local-dev',
      bucket: null,
      uploadUrl: null,
      contentType: 'video/mp4',
    });
    expect(result.key).toMatch(/^videos\/course-intros\/creators\/creator_1\/.+-Intro-Lesson-.mp4$/);
  });

  it('rejects unsupported upload mime types', async () => {
    const service = createService({
      creatorProfile: { findUnique: vi.fn() },
    });

    await expect(
      service.createUploadPolicy('user_1', {
        filename: 'payload.exe',
        contentType: 'application/x-msdownload',
        size: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents creators from completing uploads outside their own prefix', async () => {
    const prisma = {
      creatorProfile: { findUnique: vi.fn().mockResolvedValue({ id: 'creator_1' }) },
      mediaAsset: { upsert: vi.fn() },
    };
    const service = createService(prisma);

    await expect(
      service.completeUpload('user_1', {
        key: 'videos/creators/creator_2/file.mp4',
        filename: 'file.mp4',
        contentType: 'video/mp4',
        size: 100,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.mediaAsset.upsert).not.toHaveBeenCalled();
  });

  it('allows learners with completed product orders to request protected product signed URLs', async () => {
    const prisma = {
      mediaAsset: {
        findUnique: vi.fn().mockResolvedValue({
          key: 'products/creator_1/template.zip',
          url: null,
          uploaderId: 'creator_user',
          creatorId: 'creator_1',
          visibility: 'PROTECTED',
        }),
      },
      creatorProfile: { findUnique: vi.fn().mockResolvedValue(null) },
      lesson: { findFirst: vi.fn().mockResolvedValue(null) },
      product: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'product_1',
          creatorId: 'creator_1',
          price: 19,
          status: 'PUBLISHED',
        }),
      },
      order: { findFirst: vi.fn().mockResolvedValue({ id: 'order_1', status: 'COMPLETED' }) },
    };
    const service = createService(prisma);

    await expect(service.signedUrl('products/creator_1/template.zip', 'learner_1', 'LEARNER')).resolves.toMatchObject({
      key: 'products/creator_1/template.zip',
      url: '/protected-media/products%2Fcreator_1%2Ftemplate.zip',
      expiresIn: 600,
    });
  });

  it('blocks protected media when the learner has no enrollment or completed order', async () => {
    const prisma = {
      mediaAsset: {
        findUnique: vi.fn().mockResolvedValue({
          key: 'videos/creators/creator_1/private.mp4',
          url: null,
          uploaderId: 'creator_user',
          creatorId: 'creator_1',
          visibility: 'PROTECTED',
        }),
      },
      creatorProfile: { findUnique: vi.fn().mockResolvedValue(null) },
      lesson: { findFirst: vi.fn().mockResolvedValue(null) },
      product: { findFirst: vi.fn().mockResolvedValue(null) },
    };
    const service = createService(prisma);

    await expect(service.signedUrl('videos/creators/creator_1/private.mp4', 'learner_1', 'LEARNER')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
