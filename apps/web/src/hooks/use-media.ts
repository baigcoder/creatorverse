'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaApi, UploadPolicy } from '@/services/media';

export function useMediaAssets(params?: { folder?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['media', params],
    queryFn: () => mediaApi.list(params),
  });
}

export function useUploadPolicy() {
  return useMutation({ mutationFn: mediaApi.uploadPolicy });
}

export function useCompleteUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mediaApi.completeUpload,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, policy }: { file: File; policy: UploadPolicy }) => mediaApi.uploadFile(file, policy),
  });
}

export function useSignedMediaUrl() {
  return useMutation({ mutationFn: mediaApi.signedUrl });
}

export function useSignedMediaAsset(key?: string | null) {
  return useQuery({
    queryKey: ['media', 'signed-url', key],
    queryFn: () => mediaApi.signedUrl(key ?? ''),
    enabled: Boolean(key && !/^https?:\/\//i.test(key)),
    staleTime: 8 * 60 * 1000,
  });
}
