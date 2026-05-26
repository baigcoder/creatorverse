'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  analyticsApi,
  notificationsApi,
  gamificationApi,
  certificatesApi,
  adminApi,
  mediaApi,
  affiliatesApi,
  landingPagesApi,
  creatorsApi,
  usersApi,
} from '@/services';

export function useCreatorOverview() {
  return useQuery({
    queryKey: ['analytics', 'creator-overview'],
    queryFn: analyticsApi.creatorOverview,
  });
}

export function useCourseAnalytics(id: string) {
  return useQuery({
    queryKey: ['analytics', 'course', id],
    queryFn: () => analyticsApi.course(id),
    enabled: !!id,
  });
}

export function useAnalyticsFunnel(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['analytics', 'funnel', params],
    queryFn: () => analyticsApi.funnel(params),
  });
}

export function useCommunityAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'community'],
    queryFn: analyticsApi.community,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useNotificationsPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: notificationsApi.preferences,
  });
}

export function useLeaderboard() {
  return useQuery({ queryKey: ['gamification', 'leaderboard'], queryFn: gamificationApi.leaderboard });
}

export function useBadges() {
  return useQuery({ queryKey: ['gamification', 'badges'], queryFn: gamificationApi.badges });
}

export function useAchievements() {
  return useQuery({ queryKey: ['gamification', 'achievements'], queryFn: gamificationApi.achievements });
}

export function useStreak() {
  return useQuery({ queryKey: ['gamification', 'streak'], queryFn: gamificationApi.streak });
}

export function useChallenges() {
  return useQuery({ queryKey: ['gamification', 'challenges'], queryFn: gamificationApi.challenges });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gamificationApi.joinChallenge,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gamification'] }),
  });
}

export function useGenerateCertificate() {
  return useMutation({ mutationFn: certificatesApi.generate });
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: ['certificates', id],
    queryFn: () => certificatesApi.get(id),
    enabled: !!id,
  });
}

export function useVerifyCertificate(id: string) {
  return useQuery({
    queryKey: ['certificates', id, 'verify'],
    queryFn: () => certificatesApi.verify(id),
    enabled: !!id,
  });
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({ queryKey: ['admin', 'users', params], queryFn: () => adminApi.users(params) });
}

export function useAdminStats() {
  return useQuery({ queryKey: ['admin', 'health'], queryFn: adminApi.systemHealth });
}

export function useUploadPolicy() {
  return useMutation({ mutationFn: mediaApi.uploadPolicy });
}

export function useSignedUrl(key: string) {
  return useQuery({ queryKey: ['media', key], queryFn: () => mediaApi.signedUrl(key), enabled: !!key });
}

export function useCreator(id: string) {
  return useQuery({ queryKey: ['creators', id], queryFn: () => creatorsApi.get(id), enabled: !!id });
}

export function useCreatorStats(id: string) {
  return useQuery({ queryKey: ['creators', id, 'stats'], queryFn: () => creatorsApi.stats(id), enabled: !!id });
}

export function useCurrentUser() {
  return useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.me, retry: false, staleTime: 5 * 60 * 1000 });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'me'] }),
  });
}

export function useLandingPages() {
  return useQuery({ queryKey: ['landing-pages'], queryFn: landingPagesApi.list });
}

export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: landingPagesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

export function usePublishLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: landingPagesApi.publish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}