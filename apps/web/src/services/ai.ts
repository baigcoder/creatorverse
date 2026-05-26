import apiFetch from '@/lib/api-client';

export const aiApi = {
  courseOutline: (data: { topic: string; audience?: string; level?: string; duration?: string; goal?: string; tone?: string }) =>
    apiFetch<any>('/ai/course-outline', { method: 'POST', body: JSON.stringify(data) }),

  lessonScript: (data: { title?: string; topic: string; level?: string; duration?: string; tone?: string }) =>
    apiFetch<any>('/ai/lesson-script', { method: 'POST', body: JSON.stringify(data) }),

  quizGenerate: (data: { content: string; questionType?: string; questionCount?: number; difficulty?: string }) =>
    apiFetch<any>('/ai/quiz-generator', { method: 'POST', body: JSON.stringify(data) }),

  tutorChat: (data: { question: string; courseId?: string; conversationId?: string }) =>
    apiFetch<any>('/ai/tutor-chat', { method: 'POST', body: JSON.stringify(data) }),

  landingCopy: (data: { courseTitle: string; courseDescription?: string; targetAudience?: string; tone?: string }) =>
    apiFetch<any>('/ai/landing-copy', { method: 'POST', body: JSON.stringify(data) }),

  emailCampaign: (data: { goal: string; audience?: string; product?: string; tone?: string }) =>
    apiFetch<any>('/ai/email-campaign', { method: 'POST', body: JSON.stringify(data) }),

  embedCourse: (courseId: string) =>
    apiFetch<any>('/ai/embed-course', { method: 'POST', body: JSON.stringify({ courseId }) }),

  getConversation: (id: string) =>
    apiFetch<any>(`/ai/conversations/${id}`),
};
