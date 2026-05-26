import { expect, test } from '@playwright/test';
import { mockApi, signInAs } from './helpers';

test('purchased product download unlocks only for completed orders', async ({ page, context }) => {
  await signInAs(context, 'LEARNER');
  await mockApi(page, '/products/my-downloads', [
    {
      orderId: 'order_ready',
      orderStatus: 'COMPLETED',
      purchasedAt: new Date().toISOString(),
      amount: 19,
      currency: 'USD',
      downloadKey: 'products/learner/template.zip',
      access: 'READY',
      product: { id: 'product_1', title: 'Creator Template', description: 'Ready file', price: 19, currency: 'USD', status: 'PUBLISHED' },
    },
    {
      orderId: 'order_pending',
      orderStatus: 'PENDING',
      purchasedAt: new Date().toISOString(),
      amount: 49,
      currency: 'USD',
      downloadKey: null,
      access: 'PENDING_PAYMENT',
      product: { id: 'product_2', title: 'Locked Workbook', description: 'Pending file', price: 49, currency: 'USD', status: 'PUBLISHED' },
    },
  ]);
  await mockApi(page, /.*\/api\/v1\/media\/signed-url.*/, {
    key: 'products/learner/template.zip',
    url: '/protected-media/products%2Flearner%2Ftemplate.zip',
    expiresIn: 600,
  });

  await page.goto('/learn/downloads');

  await expect(page.getByText('Creator Template')).toBeVisible();
  await expect(page.getByText('Locked Workbook')).toBeVisible();
  await expect(page.getByText(/payment is pending/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
});
