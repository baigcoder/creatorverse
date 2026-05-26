import apiFetch from '@/lib/api-client';

export type CourseSummary = {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  price: number | string;
  currency?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
  publishedAt?: string | null;
  creator?: {
    id: string;
    brandName: string;
    logoUrl?: string | null;
    slug?: string | null;
  };
  _count?: {
    sections?: number;
    lessons?: number;
    enrollments?: number;
  };
  sections?: CourseSection[];
  totalDuration?: number;
};

export type Lesson = {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | string;
  videoUrl?: string | null;
  content?: unknown;
  order: number;
  isPreview: boolean;
  duration: number;
};

export type CourseSection = {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
};

export type LearningEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | string;
  enrolledAt: string;
  completedAt?: string | null;
  course: CourseSummary & {
    sections?: CourseSection[];
    totalDuration?: number;
  };
  lessonProgress?: EnrollmentProgress[];
  certificate?: { id: string; certificateUrl: string } | null;
};

export type EnrollmentProgress = {
  id: string;
  enrollmentId: string;
  lessonId: string;
  userId: string;
  completed: boolean;
  watchTimeSeconds: number;
  completedAt?: string | null;
};

export type LearnerQuiz = {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  lesson?: { id: string; title: string };
  course?: { id: string; title: string };
  questions: Array<{
    id: string;
    type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | string;
    questionText: string;
    options: unknown;
    explanation?: string | null;
    points: number;
  }>;
  attempts?: Array<{ id: string; score: number; maxScore: number; passed: boolean; attemptNo: number; createdAt: string }>;
};

export type QuizAttemptResult = {
  id: string;
  score: number;
  maxScore: number;
  passed: boolean;
  percentage: number;
  attemptNo: number;
  questions: Array<{ id: string; correctAnswer: string; explanation?: string | null }>;
};

export type LearnerAssignment = {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate?: string | null;
  maxScore: number;
  lesson?: { id: string; title: string };
  course?: { id: string; title: string };
  submissions?: Array<{ id: string; content: string; fileUrl?: string | null; score?: number | null; feedback?: string | null; submittedAt: string }>;
};

export type ManagedQuestion = {
  id?: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | string;
  questionText: string;
  options?: unknown;
  correctAnswer: string;
  explanation?: string | null;
  points?: number;
  order?: number;
};

export type ManagedQuiz = {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  passingScore: number;
  maxAttempts: number;
  questions: ManagedQuestion[];
};

export type ManagedAssignment = {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate?: string | null;
  maxScore: number;
};

export type ManagedLessonAssessment = Lesson & {
  quiz?: ManagedQuiz | null;
  assignment?: ManagedAssignment | null;
};

export type CourseListParams = {
  page?: number;
  limit?: number;
  status?: string;
  level?: string;
  search?: string;
};

export type CreateCourseInput = {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  thumbnailUrl?: string;
};

export type UpdateCourseInput = Partial<CreateCourseInput> & {
  status?: string;
};

export type UpdateLessonInput = {
  title?: string;
  type?: string;
  videoUrl?: string;
  content?: unknown;
  isPreview?: boolean;
  duration?: number;
  dripAfterDays?: number;
};

export const coursesApi = {
  list: (params?: CourseListParams) => {
    const query = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    return apiFetch<CourseSummary[]>(`/courses${query.toString() ? `?${query.toString()}` : ''}`);
  },

  get: (id: string) =>
    apiFetch<CourseSummary>(`/courses/${id}`),

  getManaged: (id: string) =>
    apiFetch<CourseSummary>(`/courses/manage/${id}`),

  getBySlug: (slug: string) =>
    apiFetch<CourseSummary>(`/courses/slug/${slug}`),

  create: (data: CreateCourseInput) =>
    apiFetch<CourseSummary>('/courses', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateCourseInput) =>
    apiFetch<CourseSummary>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch(`/courses/${id}`, { method: 'DELETE' }),

  publish: (id: string) =>
    apiFetch(`/courses/${id}/publish`, { method: 'POST' }),

  archive: (id: string) =>
    apiFetch(`/courses/${id}/archive`, { method: 'POST' }),

  enroll: (id: string, data?: { couponCode?: string }) =>
    apiFetch(`/courses/${id}/enroll`, { method: 'POST', body: JSON.stringify(data || {}) }),

  curriculum: (id: string) =>
    apiFetch<CourseSummary & { sections: CourseSection[] }>(`/courses/${id}/curriculum`),

  managedCurriculum: (id: string) =>
    apiFetch<CourseSummary & { sections: CourseSection[] }>(`/courses/manage/${id}/curriculum`),

  analytics: (id: string) =>
    apiFetch<any>(`/courses/${id}/analytics`),

  myLearning: () =>
    apiFetch<LearningEnrollment[]>('/courses/my-learning'),

  myLearningCourse: (id: string) =>
    apiFetch<LearningEnrollment>(`/courses/my-learning/${id}`),

  createSection: (courseId: string, data: any) =>
    apiFetch(`/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify(data) }),

  updateSection: (sectionId: string, data: any) =>
    apiFetch(`/courses/sections/${sectionId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteSection: (sectionId: string) =>
    apiFetch(`/courses/sections/${sectionId}`, { method: 'DELETE' }),

  reorderSections: (items: Array<{ id: string; order: number }>) =>
    apiFetch('/courses/sections/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),

  createLesson: (sectionId: string, data: any) =>
    apiFetch(`/courses/sections/${sectionId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),

  updateLesson: (lessonId: string, data: UpdateLessonInput) =>
    apiFetch<Lesson>(`/courses/lessons/${lessonId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteLesson: (lessonId: string) =>
    apiFetch(`/courses/lessons/${lessonId}`, { method: 'DELETE' }),

  reorderLessons: (items: Array<{ id: string; order: number }>) =>
    apiFetch('/courses/lessons/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),

  markProgress: (lessonId: string, data: { completed: boolean; watchTimeSeconds?: number }) =>
    apiFetch(`/courses/lessons/${lessonId}/progress`, { method: 'POST', body: JSON.stringify(data) }),

  managedAssessment: (lessonId: string) =>
    apiFetch<ManagedLessonAssessment>(`/courses/lessons/${lessonId}/assessment`),

  upsertManagedQuiz: (lessonId: string, data: {
    title: string;
    passingScore?: number;
    maxAttempts?: number;
    questions?: ManagedQuestion[];
  }) => apiFetch<ManagedQuiz>(`/courses/lessons/${lessonId}/quiz`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteManagedQuiz: (quizId: string) =>
    apiFetch(`/courses/quizzes/manage/${quizId}`, { method: 'DELETE' }),

  upsertManagedAssignment: (lessonId: string, data: {
    title: string;
    instructions: string;
    dueDate?: string | null;
    maxScore?: number;
  }) => apiFetch<ManagedAssignment>(`/courses/lessons/${lessonId}/assignment`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteManagedAssignment: (assignmentId: string) =>
    apiFetch(`/courses/assignments/manage/${assignmentId}`, { method: 'DELETE' }),

  quiz: (quizId: string) =>
    apiFetch<LearnerQuiz>(`/courses/quizzes/${quizId}`),

  submitQuiz: (quizId: string, answers: Record<string, string>) =>
    apiFetch<QuizAttemptResult>(`/courses/quizzes/${quizId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  assignment: (assignmentId: string) =>
    apiFetch<LearnerAssignment>(`/courses/assignments/${assignmentId}`),

  submitAssignment: (assignmentId: string, data: { content: string; fileUrl?: string }) =>
    apiFetch(`/courses/assignments/${assignmentId}/submit`, { method: 'POST', body: JSON.stringify(data) }),
};
