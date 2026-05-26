import { expect, test } from '@playwright/test';
import { mockApi, signInAs } from './helpers';

test('checkout shows dev pending mode without granting access', async ({ page, context }) => {
  await signInAs(context, 'LEARNER');
  await mockApi(page, '/memberships/plan_1', {
    id: 'plan_1',
    creatorId: 'creator_1',
    name: 'Community Pro',
    description: 'Unlock paid community rooms.',
    price: 9,
    currency: 'USD',
    interval: 'MONTHLY',
    benefits: ['Paid community'],
    communityAccess: true,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
  });
  await mockApi(page, '/payments/checkout', {
    mode: 'dev_pending',
    checkoutUrl: null,
    message: 'Development pending order created. Add STRIPE_SECRET_KEY to enable hosted checkout sessions.',
    order: {
      id: 'order_1',
      orderType: 'MEMBERSHIP',
      referenceId: 'plan_1',
      amount: 9,
      currency: 'USD',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  });

  await page.goto('/checkout/membership/plan_1');
  await page.getByRole('button', { name: /execute payment sequence/i }).click();

  await expect(page.getByText(/Add STRIPE_SECRET_KEY to enable hosted checkout sessions/i)).toBeVisible();
});
