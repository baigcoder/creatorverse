import { expect, test } from '@playwright/test';
import { signInAs } from './helpers';

test('protected admin route redirects unauthenticated visitors to login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/auth\/login\?next=%2Fadmin/);
});

test('learner role cannot enter creator dashboard routes', async ({ page, context }) => {
  await signInAs(context, 'LEARNER');
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/learn/);
});
