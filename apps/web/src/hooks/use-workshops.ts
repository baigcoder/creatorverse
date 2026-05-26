'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateWorkshopInput, UpdateWorkshopInput, WorkshopListParams, workshopsApi } from '@/services/workshops';

export function useWorkshops(params?: WorkshopListParams) {
  return useQuery({
    queryKey: ['workshops', params],
    queryFn: () => workshopsApi.list(params),
  });
}

export function useWorkshop(id: string) {
  return useQuery({
    queryKey: ['workshops', id],
    queryFn: () => workshopsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateWorkshop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkshopInput) => workshopsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workshops'] }),
  });
}

export function useUpdateWorkshop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkshopInput }) => workshopsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      queryClient.invalidateQueries({ queryKey: ['workshops', id] });
    },
  });
}

export function useDeleteWorkshop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workshopsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workshops'] }),
  });
}

export function useRegisterWorkshop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workshopsApi.register,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workshops'] }),
  });
}

export function useMarkWorkshopAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { attended: boolean; attendanceMinutes?: number } }) =>
      workshopsApi.markAttendance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      queryClient.invalidateQueries({ queryKey: ['workshops', id] });
    },
  });
}
