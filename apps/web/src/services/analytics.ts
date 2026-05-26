import apiFetch from '@/lib/api-client';
import { Order } from './payments';

export type CreatorOverview = {
  revenue: number | string;
  enrollments: number;
  activeLearners: number;
  communityPosts: number;
  recentOrders: Order[];
};

export type FunnelAnalytics = {
  pageViews: number;
  startedCheckout: number;
  completedPayment: number;
  enrollments: number;
};

export type CourseAnalyticsPoint = {
  id: string;
  courseId: string;
  date: string;
  views: number;
  enrollments: number;
  completions: number;
  revenue: number | string;
};

export const analyticsApi = {
  overview: () => apiFetch<CreatorOverview>('/analytics/creator-overview'),
  funnel: () => apiFetch<FunnelAnalytics>('/analytics/funnel'),
  course: (id: string) => apiFetch<CourseAnalyticsPoint[]>(`/analytics/course/${id}`),
};
