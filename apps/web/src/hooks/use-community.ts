'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '@/services/community';

export function useCommunities(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['communities', params],
    queryFn: () => communityApi.list(params),
  });
}

export function useDiscoverCommunities(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['communities', 'discover', params],
    queryFn: () => communityApi.discover(params),
  });
}

export function useCommunity(id: string) {
  return useQuery({
    queryKey: ['communities', id],
    queryFn: () => communityApi.get(id),
    enabled: !!id,
  });
}

export function useAccessibleCommunity(id: string) {
  return useQuery({
    queryKey: ['communities', 'access', id],
    queryFn: () => communityApi.getAccessible(id),
    enabled: !!id,
    retry: false,
  });
}

export function useCommunityRooms(communityId: string) {
  return useQuery({
    queryKey: ['communities', communityId, 'rooms'],
    queryFn: () => communityApi.rooms(communityId),
    enabled: !!communityId,
  });
}

export function useRoomPosts(roomId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['communities', 'rooms', roomId, 'posts', params],
    queryFn: () => communityApi.posts(roomId, params),
    enabled: !!roomId,
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communityApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities'] }),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: any }) => communityApi.createPost(roomId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities'] }),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: any }) => communityApi.addComment(postId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities'] }),
  });
}

export function useAddReaction() {
  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) => communityApi.addReaction(postId, type),
  });
}
