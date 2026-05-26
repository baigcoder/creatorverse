import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AnalyticsEventService } from '../../common/services/analytics-event.service';
import { EmailService } from '../../common/services/email.service';
import { GamificationTriggerService } from '../../common/services/gamification-trigger.service';
import { NotificationDispatcher } from '../../common/services/notification-dispatcher.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private prisma: PrismaService,
    private analyticsEvents: AnalyticsEventService,
    private gamification: GamificationTriggerService,
    private notifications: NotificationDispatcher,
    private emailService: EmailService,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    level?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, level, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    else where.status = 'PUBLISHED';
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPublicById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPreview: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                sectionId: true,
                courseId: true,
                title: true,
                type: true,
                order: true,
                isPreview: true,
                duration: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course || course.status !== 'PUBLISHED') throw new NotFoundException('Course not found');
    return course;
  }

  async findManagedById(id: string, userId: string, role: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, userId: true, brandName: true, logoUrl: true, slug: true } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    await this.verifyOwnership(course.creatorId, userId, role);
    return course;
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPreview: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                sectionId: true,
                courseId: true,
                title: true,
                type: true,
                order: true,
                isPreview: true,
                duration: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true, lessons: true } },
      },
    });
    if (!course || course.status !== 'PUBLISHED') throw new NotFoundException('Course not found');
    return course;
  }

  async findMyLearning(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
            _count: { select: { lessons: true, enrollments: true } },
          },
        },
        certificate: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findLearningCourse(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          include: {
            creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
            sections: {
              orderBy: { order: 'asc' },
              include: { lessons: { orderBy: { order: 'asc' } } },
            },
          },
        },
        lessonProgress: true,
        certificate: true,
      },
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');
    const now = Date.now();
    return {
      ...enrollment,
      course: {
        ...enrollment.course,
        sections: enrollment.course.sections.map((section) => ({
          ...section,
          lessons: section.lessons.map((lesson) => {
            const unlockAt =
              lesson.dripAfterDays == null
                ? null
                : new Date(enrollment.enrolledAt.getTime() + lesson.dripAfterDays * 86400000);
            return {
              ...lesson,
              locked: unlockAt ? unlockAt.getTime() > now : false,
              unlockAt,
            };
          }),
        })),
      },
    };
  }

  async create(userId: string, dto: any) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');

    const slug = dto.title
      ? dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 8)
      : 'untitled-course-' + Math.random().toString(36).substring(2, 8);

    return this.prisma.course.create({
      data: {
        creatorId: creator.id,
        title: dto.title || 'Untitled Course',
        slug,
        description: dto.description,
        price: dto.price ?? 0,
        currency: dto.currency || 'USD',
        level: dto.level || 'BEGINNER',
        language: dto.language || 'en',
        thumbnailUrl: dto.thumbnailUrl,
        status: 'DRAFT',
      },
    });
  }

  async update(courseId: string, userId: string, role: string, dto: any) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    await this.verifyOwnership(course.creatorId, userId, role);

    return this.prisma.course.update({
      where: { id: courseId },
      data: dto,
    });
  }

  async remove(courseId: string, userId: string, role: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    await this.verifyOwnership(course.creatorId, userId, role);

    await this.prisma.course.delete({ where: { id: courseId } });
  }

  async publish(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { sections: { include: { lessons: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== course.creatorId) throw new ForbiddenException('Not your course');

    if (course.sections.length === 0) {
      throw new ForbiddenException('Course must have at least one section');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async enroll(courseId: string, userId: string, couponCode?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'PUBLISHED') throw new ForbiddenException('Course is not available');

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new ConflictException('Already enrolled in this course');

    if (Number(course.price) > 0) {
      return {
        checkoutRequired: true,
        orderType: 'COURSE',
        referenceId: course.id,
        amount: course.price,
        currency: course.currency,
        couponCode,
        message: 'Paid courses unlock only after checkout is completed.',
      };
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
      },
    });

    await this.runSideEffect('course enrollment events', async () => {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      await Promise.all([
        this.analyticsEvents.trackEnrollment(userId, course.creatorId, course.id, Number(course.price)),
        this.gamification.onCourseEnrollment(userId, course.id),
        this.notifications.sendEnrollmentConfirmation(userId, course.title, course.id),
        user?.email ? this.emailService.sendEnrollmentEmail(user.email, user.name, course.title) : Promise.resolve(),
      ]);
    });

    return enrollment;
  }

  async getCurriculum(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
                isPreview: true,
                duration: true,
                sectionId: true,
                courseId: true,
              },
            },
          },
        },
      },
    });

    if (!course || course.status !== 'PUBLISHED') throw new NotFoundException('Course not found');
    return course;
  }

  async getManagedCurriculum(courseId: string, userId: string, role: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    await this.verifyOwnership(course.creatorId, userId, role);
    return course;
  }

  async createSection(courseId: string, userId: string, role: string, dto: any) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    await this.verifyOwnership(course.creatorId, userId, role);

    const maxOrder = await this.prisma.courseSection.aggregate({
      where: { courseId },
      _max: { order: true },
    });

    return this.prisma.courseSection.create({
      data: {
        courseId,
        title: dto.title,
        order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async updateSection(sectionId: string, userId: string, role: string, dto: any) {
    const section = await this.prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    await this.verifyOwnership(section.course.creatorId, userId, role);

    return this.prisma.courseSection.update({
      where: { id: sectionId },
      data: dto,
    });
  }

  async deleteSection(sectionId: string, userId: string, role: string) {
    const section = await this.prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    await this.verifyOwnership(section.course.creatorId, userId, role);

    await this.prisma.courseSection.delete({ where: { id: sectionId } });
  }

  async reorderSections(items: Array<{ id: string; order: number }>, userId: string, role: string) {
    if (!items.length) return;
    const sections = await this.prisma.courseSection.findMany({
      where: { id: { in: items.map((item) => item.id) } },
      include: { course: true },
    });
    if (sections.length !== items.length) throw new NotFoundException('One or more sections were not found');
    const courseIds = new Set(sections.map((section) => section.courseId));
    if (courseIds.size !== 1) throw new BadRequestException('Sections must belong to the same course');
    await this.verifyOwnership(sections[0].course.creatorId, userId, role);

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.courseSection.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  }

  async createLesson(sectionId: string, userId: string, role: string, dto: any) {
    const section = await this.prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    await this.verifyOwnership(section.course.creatorId, userId, role);

    const maxOrder = await this.prisma.lesson.aggregate({
      where: { sectionId },
      _max: { order: true },
    });

    return this.prisma.lesson.create({
      data: {
        sectionId,
        courseId: section.courseId,
        title: dto.title,
        type: dto.type || 'VIDEO',
        videoUrl: dto.videoUrl,
        content: dto.content,
        isPreview: dto.isPreview ?? false,
        duration: dto.duration ?? 0,
        dripAfterDays: dto.dripAfterDays,
        order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async updateLesson(lessonId: string, userId: string, role: string, dto: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.verifyOwnership(lesson.course.creatorId, userId, role);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
    });
  }

  async deleteLesson(lessonId: string, userId: string, role: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.verifyOwnership(lesson.course.creatorId, userId, role);

    await this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  async reorderLessons(items: Array<{ id: string; order: number }>, userId: string, role: string) {
    if (!items.length) return;
    const lessons = await this.prisma.lesson.findMany({
      where: { id: { in: items.map((item) => item.id) } },
      include: { course: true },
    });
    if (lessons.length !== items.length) throw new NotFoundException('One or more lessons were not found');
    const courseIds = new Set(lessons.map((lesson) => lesson.courseId));
    if (courseIds.size !== 1) throw new BadRequestException('Lessons must belong to the same course');
    await this.verifyOwnership(lessons[0].course.creatorId, userId, role);

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.lesson.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  }

  async markLessonProgress(lessonId: string, userId: string, data: { completed: boolean; watchTimeSeconds?: number }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { id: true, title: true, creatorId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');
    if (lesson.dripAfterDays != null) {
      const unlockAt = new Date(enrollment.enrolledAt.getTime() + lesson.dripAfterDays * 86400000);
      if (unlockAt.getTime() > Date.now()) throw new ForbiddenException('This lesson is not unlocked yet');
    }

    const existingProgress = await this.prisma.lessonProgress.findUnique({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    });

    const progress = await this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        userId,
        completed: data.completed,
        watchTimeSeconds: data.watchTimeSeconds ?? 0,
        completedAt: data.completed ? new Date() : null,
      },
      update: {
        completed: data.completed,
        watchTimeSeconds: data.watchTimeSeconds ?? 0,
        completedAt: data.completed ? new Date() : null,
      },
    });

    const enrollmentSummary = await this.updateEnrollmentProgress(enrollment.id, lesson.courseId);

    if (data.completed && !existingProgress?.completed) {
      await this.runSideEffect('lesson completion events', async () => {
        await this.gamification.onLessonComplete(userId, lesson.id, lesson.courseId);
      });
    }

    if (enrollment.status !== 'COMPLETED' && enrollmentSummary?.status === 'COMPLETED') {
      await this.runSideEffect('course completion events', async () => {
        const certificate = await this.prisma.certificate.upsert({
          where: { enrollmentId: enrollment.id },
          update: {},
          create: {
            userId,
            courseId: lesson.courseId,
            enrollmentId: enrollment.id,
          },
        });
        await this.prisma.certificate.update({
          where: { id: certificate.id },
          data: { certificateUrl: `${process.env.APP_URL || 'http://localhost:4000'}/api/v1/certificates/${certificate.id}/render` },
        });
        await Promise.all([
          this.analyticsEvents.trackCourseComplete(userId, lesson.course.creatorId, lesson.courseId),
          this.gamification.onCourseComplete(userId, lesson.courseId),
          this.notifications.sendCourseCompleted(userId, lesson.course.title, lesson.courseId),
        ]);
      });
    }

    return progress;
  }

  async getManagedLessonAssessment(lessonId: string, userId: string, role: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
        quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
        assignment: { include: { submissions: { orderBy: { submittedAt: 'desc' }, take: 20 } } },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.verifyOwnership(lesson.course.creatorId, userId, role);
    return lesson;
  }

  async upsertManagedQuiz(
    lessonId: string,
    userId: string,
    role: string,
    dto: { title: string; passingScore?: number; maxAttempts?: number; questions?: Array<any> },
  ) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true, quiz: true } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.verifyOwnership(lesson.course.creatorId, userId, role);

    const quiz = await this.prisma.quiz.upsert({
      where: { lessonId },
      update: {
        title: dto.title,
        passingScore: dto.passingScore ?? 70,
        maxAttempts: dto.maxAttempts ?? 3,
      },
      create: {
        lessonId,
        courseId: lesson.courseId,
        title: dto.title,
        passingScore: dto.passingScore ?? 70,
        maxAttempts: dto.maxAttempts ?? 3,
      },
    });

    if (dto.questions) {
      await this.prisma.$transaction([
        this.prisma.question.deleteMany({ where: { quizId: quiz.id } }),
        ...dto.questions.map((question, index) =>
          this.prisma.question.create({
            data: {
              quizId: quiz.id,
              type: question.type ?? 'MCQ',
              questionText: question.questionText,
              options: question.options ?? [],
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              points: question.points ?? 1,
              order: question.order ?? index,
            },
          }),
        ),
        this.prisma.lesson.update({ where: { id: lessonId }, data: { type: 'QUIZ' } }),
      ]);
    } else if (lesson.type !== 'QUIZ') {
      await this.prisma.lesson.update({ where: { id: lessonId }, data: { type: 'QUIZ' } });
    }

    return this.prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async deleteManagedQuiz(quizId: string, userId: string, role: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.verifyOwnership(quiz.course.creatorId, userId, role);
    await this.prisma.quiz.delete({ where: { id: quizId } });
    return { success: true };
  }

  async upsertManagedAssignment(
    lessonId: string,
    userId: string,
    role: string,
    dto: { title: string; instructions: string; dueDate?: string; maxScore?: number },
  ) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true, assignment: true } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.verifyOwnership(lesson.course.creatorId, userId, role);

    const assignment = await this.prisma.assignment.upsert({
      where: { lessonId },
      update: {
        title: dto.title,
        instructions: dto.instructions,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        maxScore: dto.maxScore ?? 100,
      },
      create: {
        lessonId,
        courseId: lesson.courseId,
        title: dto.title,
        instructions: dto.instructions,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        maxScore: dto.maxScore ?? 100,
      },
    });

    if (lesson.type !== 'ASSIGNMENT') {
      await this.prisma.lesson.update({ where: { id: lessonId }, data: { type: 'ASSIGNMENT' } });
    }

    return assignment;
  }

  async deleteManagedAssignment(assignmentId: string, userId: string, role: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId }, include: { course: true } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.verifyOwnership(assignment.course.creatorId, userId, role);
    await this.prisma.assignment.delete({ where: { id: assignmentId } });
    return { success: true };
  }

  async findQuizForLearner(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: { select: { id: true, title: true } },
        course: { select: { id: true, title: true } },
        questions: { orderBy: { order: 'asc' } },
        attempts: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.verifyEnrollment(quiz.courseId, userId);

    return {
      ...quiz,
      questions: quiz.questions.map(({ correctAnswer, ...question }) => {
        void correctAnswer;
        return question;
      }),
    };
  }

  async submitQuiz(quizId: string, userId: string, answers: Record<string, string>) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.verifyEnrollment(quiz.courseId, userId);

    const previousAttempts = await this.prisma.quizAttempt.count({ where: { quizId, userId } });
    if (previousAttempts >= quiz.maxAttempts) throw new ForbiddenException('Maximum quiz attempts reached');

    const maxScore = quiz.questions.reduce((sum, question) => sum + question.points, 0);
    const score = quiz.questions.reduce((sum, question) => {
      const submitted = String(answers[question.id] ?? '').trim().toLowerCase();
      const correct = String(question.correctAnswer ?? '').trim().toLowerCase();
      return submitted && submitted === correct ? sum + question.points : sum;
    }, 0);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        maxScore,
        passed: percentage >= quiz.passingScore,
        answers,
        attemptNo: previousAttempts + 1,
      },
    });

    await this.runSideEffect('quiz attempt events', async () => {
      if (attempt.passed) await this.gamification.onQuizPass(userId, quiz.id);
    });

    return {
      ...attempt,
      percentage,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      })),
    };
  }

  async findAssignmentForLearner(assignmentId: string, userId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        lesson: { select: { id: true, title: true } },
        course: { select: { id: true, title: true } },
        submissions: {
          where: { userId },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.verifyEnrollment(assignment.courseId, userId);
    return assignment;
  }

  async submitAssignment(assignmentId: string, userId: string, dto: { content: string; fileUrl?: string }) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.verifyEnrollment(assignment.courseId, userId);

    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        userId,
        content: dto.content,
        fileUrl: dto.fileUrl,
      },
    });
  }

  async gradeAssignmentSubmission(
    submissionId: string,
    userId: string,
    role: string,
    dto: { score: number; feedback?: string; aiFeedback?: string },
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { course: true } } },
    });
    if (!submission) throw new NotFoundException('Assignment submission not found');
    await this.verifyOwnership(submission.assignment.course.creatorId, userId, role);
    if (dto.score > submission.assignment.maxScore) {
      throw new ForbiddenException(`Score cannot exceed max score ${submission.assignment.maxScore}`);
    }

    const graded = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        aiFeedback: dto.aiFeedback,
        gradedAt: new Date(),
      },
    });

    await this.runSideEffect('assignment grading events', async () => {
      await this.gamification.addPoints(submission.userId, 10, 'Assignment graded', 'ASSIGNMENT', submission.assignmentId);
    });

    return graded;
  }

  private async updateEnrollmentProgress(enrollmentId: string, courseId: string) {
    const totalLessons = await this.prisma.lesson.count({ where: { courseId } });
    if (totalLessons === 0) return null;

    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        enrollmentId,
        completed: true,
      },
    });

    const progress = Math.round((completedLessons / totalLessons) * 100);
    const status = progress >= 100 ? 'COMPLETED' : 'ACTIVE';

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  private async runSideEffect(label: string, effect: () => Promise<void>) {
    try {
      await effect();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Skipped ${label}: ${message}`);
    }
  }

  private async verifyOwnership(creatorId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== creatorId) {
      throw new ForbiddenException('You do not have permission to modify this resource');
    }
  }

  private async verifyEnrollment(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment || enrollment.status === 'EXPIRED') {
      throw new ForbiddenException('You are not enrolled in this course');
    }
    return enrollment;
  }
}
