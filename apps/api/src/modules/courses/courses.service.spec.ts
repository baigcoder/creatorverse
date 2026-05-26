import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CoursesService } from './courses.service';

function createService(prisma: unknown) {
  return new CoursesService(
    prisma as never,
    { trackEnrollment: vi.fn() } as never,
    { onCourseEnrollment: vi.fn(), onLessonCompleted: vi.fn(), onQuizAttempt: vi.fn(), onAssignmentSubmission: vi.fn() } as never,
    { sendEnrollmentConfirmation: vi.fn() } as never,
    { sendEnrollmentEmail: vi.fn() } as never,
  );
}

describe('CoursesService access controls', () => {
  it('hides draft courses from public detail', async () => {
    const service = createService({
      course: {
        findUnique: vi.fn().mockResolvedValue({ id: 'course_1', status: 'DRAFT', sections: [] }),
      },
    });

    await expect(service.findPublicById('course_1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns only preview-safe lesson fields for public detail', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'course_1',
      status: 'PUBLISHED',
      sections: [{ id: 'section_1', lessons: [{ id: 'lesson_1', title: 'Preview', isPreview: true }] }],
    });
    const service = createService({
      course: {
        findUnique,
      },
    });

    await service.findPublicById('course_1');
    const lessonSelect = findUnique.mock.calls[0][0].include.sections.include.lessons.select;
    expect(lessonSelect.videoUrl).toBeUndefined();
    expect(lessonSelect.content).toBeUndefined();
    expect(lessonSelect.title).toBe(true);
  });

  it('rejects section reorder payloads that mix courses', async () => {
    const service = createService({
      courseSection: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'section_1', courseId: 'course_1', course: { creatorId: 'creator_1' } },
          { id: 'section_2', courseId: 'course_2', course: { creatorId: 'creator_1' } },
        ]),
      },
    });

    await expect(
      service.reorderSections(
        [
          { id: 'section_1', order: 0 },
          { id: 'section_2', order: 1 },
        ],
        'user_1',
        'CREATOR',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lets the owning creator create an editable lesson quiz', async () => {
    const prisma = {
      lesson: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'lesson_1',
          courseId: 'course_1',
          type: 'TEXT',
          course: { creatorId: 'creator_1' },
          quiz: null,
        }),
        update: vi.fn().mockResolvedValue({ id: 'lesson_1', type: 'QUIZ' }),
      },
      creatorProfile: { findUnique: vi.fn().mockResolvedValue({ id: 'creator_1' }) },
      quiz: {
        upsert: vi.fn().mockResolvedValue({ id: 'quiz_1' }),
        findUnique: vi.fn().mockResolvedValue({ id: 'quiz_1', questions: [{ id: 'question_1' }] }),
      },
      question: {
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn().mockResolvedValue([]),
    };
    const service = createService(prisma);

    const result = await service.upsertManagedQuiz('lesson_1', 'user_1', 'CREATOR', {
      title: 'Quiz',
      questions: [{ questionText: 'Q?', correctAnswer: 'A', options: ['A'], points: 1 }],
    });

    expect(prisma.quiz.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { lessonId: 'lesson_1' },
    }));
    expect(result).toEqual({ id: 'quiz_1', questions: [{ id: 'question_1' }] });
  });

  it('rejects quiz management for a different creator', async () => {
    const prisma = {
      lesson: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'lesson_1',
          courseId: 'course_1',
          course: { creatorId: 'creator_1' },
          quiz: null,
        }),
      },
      creatorProfile: { findUnique: vi.fn().mockResolvedValue({ id: 'creator_2' }) },
    };
    const service = createService(prisma);

    await expect(
      service.upsertManagedQuiz('lesson_1', 'user_2', 'CREATOR', { title: 'Quiz', questions: [] }),
    ).rejects.toThrow('You do not have permission to modify this resource');
  });
});
