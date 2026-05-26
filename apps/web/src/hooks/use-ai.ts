'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '@/services/ai';

export function useCourseOutline() {
  return useMutation({ mutationFn: aiApi.courseOutline });
}

export function useLessonScript() {
  return useMutation({ mutationFn: aiApi.lessonScript });
}

export function useQuizGenerate() {
  return useMutation({ mutationFn: aiApi.quizGenerate });
}

export function useTutorChat() {
  return useMutation({ mutationFn: aiApi.tutorChat });
}

export function useLandingCopy() {
  return useMutation({ mutationFn: aiApi.landingCopy });
}

export function useEmailCampaign() {
  return useMutation({ mutationFn: aiApi.emailCampaign });
}

export function useEmbedCourse() {
  return useMutation({ mutationFn: aiApi.embedCourse });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['ai', 'conversations', id],
    queryFn: () => aiApi.getConversation(id),
    enabled: !!id,
  });
}