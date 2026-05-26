import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { TutorService } from './tutor.service';

function createService(prisma: unknown) {
  return new TutorService({ getProvider: vi.fn() } as never, prisma as never);
}

describe('TutorService course access', () => {
  it('rejects course-specific tutor chat for unenrolled learners', async () => {
    const service = createService({
      course: {
        findUnique: vi.fn().mockResolvedValue({ creator: { userId: 'creator_user' } }),
      },
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    });

    await expect(service.chat('learner_1', 'LEARNER', 'Explain this lesson', 'course_1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
