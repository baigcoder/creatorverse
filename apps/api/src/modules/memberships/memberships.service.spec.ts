import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MembershipsService } from './memberships.service';

function createService(prisma: unknown) {
  return new MembershipsService(prisma as never);
}

describe('MembershipsService entitlement behavior', () => {
  it('returns checkout-required for paid plans instead of creating an active subscription', async () => {
    const prisma = {
      membershipPlan: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'plan_1',
          status: 'PUBLISHED',
          price: 25,
          currency: 'USD',
          interval: 'MONTHLY',
        }),
      },
      subscription: { create: vi.fn() },
    };
    const service = createService(prisma);

    const result = await service.subscribe('plan_1', 'user_1');

    expect(result).toMatchObject({ checkoutRequired: true, orderType: 'MEMBERSHIP', referenceId: 'plan_1' });
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('allows only the subscription owner or admin to cancel', async () => {
    const service = createService({
      subscription: {
        findUnique: vi.fn().mockResolvedValue({ id: 'sub_1', userId: 'owner_1' }),
        update: vi.fn(),
      },
    });

    await expect(service.cancel('sub_1', 'other_user', 'LEARNER')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
