import { expect, test } from '@playwright/test';
import { mockApi, signInAs } from './helpers';

test('AI tutor renders provider configuration errors', async ({ page, context }) => {
  await signInAs(context, 'LEARNER');
  await mockApi(page, '/ai/tutor-chat', { message: 'AI provider is not configured. Add OPENAI_API_KEY.' }, 503);

  await page.goto('/learn/ai-tutor');
  await page.getByPlaceholder(/ask a question/i).fill('Explain this lesson');
  await page.getByRole('button', { name: /send/i }).click();

  await expect(page.getByText(/AI provider is not configured/i)).toBeVisible();
});

test('AI tutor renders answers and sources', async ({ page, context }) => {
  await signInAs(context, 'LEARNER');
  await mockApi(page, '/ai/tutor-chat', {
    conversationId: 'conversation_1',
    answer: 'Use retrieval-backed course notes to answer with context.',
    sources: [{ sourceType: 'LESSON', sourceId: 'lesson_1', preview: 'Course note preview' }],
  });

  await page.goto('/learn/ai-tutor');
  await page.getByPlaceholder(/ask a question/i).fill('How does RAG work?');
  await page.getByRole('button', { name: /send/i }).click();

  await expect(page.getByText(/retrieval-backed course notes/i)).toBeVisible();
  await expect(page.getByText(/LESSON: lesson_/i)).toBeVisible();
});
