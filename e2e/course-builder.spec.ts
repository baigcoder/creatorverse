import { expect, test } from '@playwright/test';
import { mockApi, signInAs } from './helpers';

test('course builder lesson editor can attach media and open quiz builder', async ({ page, context }) => {
  await signInAs(context, 'CREATOR');
  await mockApi(page, '/courses/manage/course_1/curriculum', {
    id: 'course_1',
    title: 'Creator Course',
    sections: [
      {
        id: 'section_1',
        title: 'Module 1',
        order: 0,
        lessons: [
          {
            id: 'lesson_1',
            sectionId: 'section_1',
            courseId: 'course_1',
            title: 'Lesson 1',
            type: 'VIDEO',
            videoUrl: null,
            content: { text: 'Lesson content about product strategy.' },
            isPreview: false,
            duration: 0,
            order: 0,
          },
        ],
      },
    ],
  });
  await mockApi(page, '/courses/lessons/lesson_1/assessment', {
    id: 'lesson_1',
    title: 'Lesson 1',
    type: 'VIDEO',
    quiz: null,
    assignment: null,
  });
  await mockApi(page, /.*\/api\/v1\/media.*/, {
    data: [
      {
        id: 'asset_1',
        key: 'videos/lesson.mp4',
        filename: 'lesson.mp4',
        contentType: 'video/mp4',
        size: 1000,
        visibility: 'PROTECTED',
        status: 'UPLOADED',
      },
    ],
    meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
  });

  await page.goto('/dashboard/courses/course_1/builder/section_1/lesson_1');
  await page.getByRole('button', { name: /lesson\.mp4 videos\/lesson\.mp4/i }).click();
  await expect(page.getByPlaceholder('https://...')).toHaveValue('videos/lesson.mp4');

  await page.locator('select').selectOption('QUIZ');
  await expect(page.getByText('Quiz builder')).toBeVisible();
});
