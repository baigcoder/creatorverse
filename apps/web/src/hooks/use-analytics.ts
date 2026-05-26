'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analytics';

export function useCreatorOverview() {
  return useQuery({
    queryKey: ['analytics', 'creator-overview'],
    queryFn: analyticsApi.overview,
  });
}

export function useFunnelAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: analyticsApi.funnel,
  });
}

export function useCourseAnalyticsSeries(id: string) {
  return useQuery({
    queryKey: ['analytics', 'course', id],
    queryFn: () => analyticsApi.course(id),
    enabled: !!id,
  });
}
