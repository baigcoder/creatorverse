'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin';

export function useAdminHealth() {
  return useQuery({ queryKey: ['admin', 'health'], queryFn: adminApi.systemHealth });
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({ queryKey: ['admin', 'users', params], queryFn: () => adminApi.users(params) });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUserStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useAdminCreators() {
  return useQuery({ queryKey: ['admin', 'creators'], queryFn: adminApi.creators });
}

export function useAdminCourses() {
  return useQuery({ queryKey: ['admin', 'courses'], queryFn: () => adminApi.courses({ limit: 50 }) });
}

export function useAdminPayments() {
  return useQuery({ queryKey: ['admin', 'payments'], queryFn: () => adminApi.payments({ limit: 50 }) });
}

export function useAdminReports() {
  return useQuery({ queryKey: ['admin', 'reports'], queryFn: adminApi.reports });
}

export function useAdminModeration() {
  return useQuery({ queryKey: ['admin', 'moderation'], queryFn: adminApi.moderation });
}

export function useModerateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'PIN' | 'UNPIN' | 'REJECT' | 'DELETE'; reason?: string }) =>
      adminApi.moderateContent(id, action, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] }),
  });
}

export function useAdminLogs() {
  return useQuery({ queryKey: ['admin', 'logs'], queryFn: adminApi.logs });
}
