'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CourseListParams, CreateCourseInput, ManagedQuestion, UpdateCourseInput, UpdateLessonInput, coursesApi } from '@/services/courses';

export function useCourses(params?: CourseListParams) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.list(params),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.get(id),
    enabled: !!id,
  });
}

export function useManagedCourse(id: string) {
  return useQuery({
    queryKey: ['courses', 'managed', id],
    queryFn: () => coursesApi.getManaged(id),
    enabled: !!id,
  });
}

export function useCourseCurriculum(id: string) {
  return useQuery({
    queryKey: ['courses', id, 'curriculum'],
    queryFn: () => coursesApi.curriculum(id),
    enabled: !!id,
  });
}

export function useManagedCourseCurriculum(id: string) {
  return useQuery({
    queryKey: ['courses', 'managed', id, 'curriculum'],
    queryFn: () => coursesApi.managedCurriculum(id),
    enabled: !!id,
  });
}

export function useMyLearning() {
  return useQuery({
    queryKey: ['courses', 'my-learning'],
    queryFn: () => coursesApi.myLearning(),
  });
}

export function useMyLearningCourse(id: string) {
  return useQuery({
    queryKey: ['courses', 'my-learning', id],
    queryFn: () => coursesApi.myLearningCourse(id),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseInput) => coursesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseInput }) => coursesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', id] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'managed', id] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.publish,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', id] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'managed', id] });
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { couponCode?: string } }) => coursesApi.enroll(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function useCourseAnalytics(id: string) {
  return useQuery({
    queryKey: ['courses', id, 'analytics'],
    queryFn: () => coursesApi.analytics(id),
    enabled: !!id,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) => coursesApi.createSection(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'curriculum'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'managed', courseId, 'curriculum'] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: any; courseId?: string }) => coursesApi.updateSection(sectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'curriculum'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId }: { sectionId: string; courseId?: string }) => coursesApi.deleteSection(sectionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'curriculum'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ items }: { items: Array<{ id: string; order: number }>; courseId?: string }) => coursesApi.reorderSections(items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'curriculum'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: any; courseId?: string }) => coursesApi.createLesson(sectionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'curriculum'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: UpdateLessonInput; courseId?: string }) =>
      coursesApi.updateLesson(lessonId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (variables.courseId) {
        queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'curriculum'] });
        queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
      }
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId }: { lessonId: string; courseId?: string }) => coursesApi.deleteLesson(lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'curriculum'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useReorderLessons() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ items }: { items: Array<{ id: string; order: number }>; courseId?: string }) => coursesApi.reorderLessons(items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId, 'curriculum'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useMarkProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: { completed: boolean; watchTimeSeconds?: number } }) =>
      coursesApi.markProgress(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-learning'] });
    },
  });
}

export function useManagedLessonAssessment(lessonId: string) {
  return useQuery({
    queryKey: ['courses', 'lessons', lessonId, 'assessment'],
    queryFn: () => coursesApi.managedAssessment(lessonId),
    enabled: !!lessonId,
  });
}

export function useUpsertManagedQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }: {
      lessonId: string;
      courseId?: string;
      data: { title: string; passingScore?: number; maxAttempts?: number; questions?: ManagedQuestion[] };
    }) => coursesApi.upsertManagedQuiz(lessonId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'lessons', variables.lessonId, 'assessment'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useDeleteManagedQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId }: { quizId: string; lessonId?: string }) => coursesApi.deleteManagedQuiz(quizId),
    onSuccess: (_, variables) => {
      if (variables.lessonId) queryClient.invalidateQueries({ queryKey: ['courses', 'lessons', variables.lessonId, 'assessment'] });
    },
  });
}

export function useUpsertManagedAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }: {
      lessonId: string;
      courseId?: string;
      data: { title: string; instructions: string; dueDate?: string | null; maxScore?: number };
    }) => coursesApi.upsertManagedAssignment(lessonId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'lessons', variables.lessonId, 'assessment'] });
      if (variables.courseId) queryClient.invalidateQueries({ queryKey: ['courses', 'managed', variables.courseId, 'curriculum'] });
    },
  });
}

export function useDeleteManagedAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId }: { assignmentId: string; lessonId?: string }) => coursesApi.deleteManagedAssignment(assignmentId),
    onSuccess: (_, variables) => {
      if (variables.lessonId) queryClient.invalidateQueries({ queryKey: ['courses', 'lessons', variables.lessonId, 'assessment'] });
    },
  });
}
