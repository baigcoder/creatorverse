'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '@/services';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['gamification', 'leaderboard'],
    queryFn: gamificationApi.leaderboard,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: gamificationApi.badges,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ['gamification', 'achievements'],
    queryFn: gamificationApi.achievements,
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['gamification', 'streak'],
    queryFn: gamificationApi.streak,
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ['gamification', 'challenges'],
    queryFn: gamificationApi.challenges,
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gamificationApi.joinChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });
}
