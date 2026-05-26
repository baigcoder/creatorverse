import { BrowserContext, Page } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${process.env.PLAYWRIGHT_WEB_PORT ?? 3100}`;

export function fakeAccessToken(role: 'LEARNER' | 'CREATOR' | 'ADMIN' | 'SUPER_ADMIN' = 'LEARNER') {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
    sub: `${role.toLowerCase()}_user`,
    email: `${role.toLowerCase()}@example.com`,
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.signature`;
}

export async function signInAs(context: BrowserContext, role: 'LEARNER' | 'CREATOR' | 'ADMIN' | 'SUPER_ADMIN' = 'LEARNER') {
  const csrfToken = `csrf_${role.toLowerCase()}`;
  await context.addCookies([
    {
      name: 'accessToken',
      value: fakeAccessToken(role),
      url: baseURL,
      httpOnly: false,
      sameSite: 'Lax',
    },
    {
      name: 'csrfToken',
      value: csrfToken,
      url: baseURL,
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);
}

export async function mockApi(page: Page, path: string | RegExp, data: unknown, status = 200) {
  await page.route(path instanceof RegExp ? path : `**/api/v1${path}`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(status >= 400 ? data : { success: true, data }),
    });
  });
}
