export const APP_NAME = 'SkillMango AI';
export const APP_DESCRIPTION = 'AI-powered creator learning platform';

type RuntimeGlobal = typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const runtimeEnv = (globalThis as RuntimeGlobal).process?.env ?? {};

export const APP_URL = runtimeEnv.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const API_URL = runtimeEnv.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  FEATURES: '/features',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  DASHBOARD: '/dashboard',
  COURSES: '/dashboard/courses',
  NEW_COURSE: '/dashboard/courses/new',
  COURSE_DETAIL: (id: string) => `/dashboard/courses/${id}`,
  COURSE_BUILDER: (id: string) => `/dashboard/courses/${id}/builder`,
  WORKSHOPS: '/dashboard/workshops',
  COMMUNITY: '/dashboard/community',
  MEMBERSHIPS: '/dashboard/memberships',
  PRODUCTS: '/dashboard/products',
  AI_STUDIO: '/dashboard/ai-studio',
  ANALYTICS: '/dashboard/analytics',
  MARKETING: '/dashboard/marketing',
  PAYMENTS: '/dashboard/payments',
  SETTINGS: '/dashboard/settings',
  LEARN_HOME: '/learn',
  LEARN_COURSE: (id: string) => `/learn/courses/${id}`,
  LEARN_COMMUNITY: '/learn/community',
  LEARN_CERTIFICATES: '/learn/certificates',
  LEARN_ACHIEVEMENTS: '/learn/achievements',
  LEARN_AI_TUTOR: '/learn/ai-tutor',
  ADMIN: '/admin',
} as const;

export const MANGO_COLORS = {
  orange: '#FF9F1C',
  navy: '#0B1020',
  purple: '#7C3AED',
  cyan: '#22D3EE',
  success: '#22C55E',
  warning: '#FACC15',
  error: '#EF4444',
} as const;

export const COURSE_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
] as const;

export const LESSON_TYPES = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'TEXT', label: 'Text' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
] as const;
