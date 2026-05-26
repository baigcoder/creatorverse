import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CommunityService } from './community.service';

function createService(prisma: unknown) {
  return new CommunityService(
    prisma as never,
    { track: vi.fn() } as never,
    { onCommunityPost: vi.fn() } as never,
    { sendToRoom: vi.fn() } as never,
  );
}

describe('CommunityService access', () => {
  it('marks paid communities locked until a community membership subscription exists', async () => {
    const service = createService({
      community: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'community_1',
            creatorId: 'creator_1',
            visibility: 'PAID',
            creator: { membershipPlans: [{ id: 'plan_1', communityAccess: true, price: 9 }] },
            _count: { rooms: 2 },
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
      },
      creatorProfile: { findUnique: vi.fn().mockResolvedValue(null) },
      subscription: { findMany: vi.fn().mockResolvedValue([]) },
    });

    const result = await service.discover('user_1', 'LEARNER', { page: 1, limit: 20 });

    expect(result.data[0]).toMatchObject({
      access: 'MEMBERSHIP_REQUIRED',
      locked: true,
      rooms: [],
    });
  });

  it('rejects room reads for unauthorized paid/private communities', async () => {
    const service = createService({
      community: { findUnique: vi.fn().mockResolvedValue({ id: 'community_1', creatorId: 'creator_1', visibility: 'PAID' }) },
      creatorProfile: { findUnique: vi.fn().mockResolvedValue(null) },
      subscription: { findFirst: vi.fn().mockResolvedValue(null) },
      communityRoom: { findMany: vi.fn() },
    });

    await expect(service.getRooms('community_1', 'user_1', 'LEARNER')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows paid community access after active community subscription', async () => {
    const service = createService({
      community: { findUnique: vi.fn().mockResolvedValue({ id: 'community_1', creatorId: 'creator_1', visibility: 'PAID' }) },
      creatorProfile: { findUnique: vi.fn().mockResolvedValue(null) },
      subscription: { findFirst: vi.fn().mockResolvedValue({ id: 'sub_1' }) },
      communityRoom: { findMany: vi.fn().mockResolvedValue([{ id: 'room_1' }]) },
    });

    await expect(service.getRooms('community_1', 'user_1', 'LEARNER')).resolves.toEqual([{ id: 'room_1' }]);
  });
});
