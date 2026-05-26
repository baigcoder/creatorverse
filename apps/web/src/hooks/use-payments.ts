'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, membershipsApi, productsApi, couponsApi } from '@/services/payments';

export function useCheckout() {
  return useMutation({ mutationFn: paymentsApi.checkout });
}

export function useOrders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => paymentsApi.orders(page, limit),
  });
}

export function useRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data?: { amount?: number; reason?: string } }) => paymentsApi.refund(orderId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useMemberships(creatorId?: string) {
  return useQuery({
    queryKey: ['memberships', creatorId],
    queryFn: () => membershipsApi.list(creatorId),
  });
}

export function useMembership(id: string) {
  return useQuery({
    queryKey: ['memberships', id],
    queryFn: () => membershipsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: membershipsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memberships'] }),
  });
}

export function useSubscribeMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: membershipsApi.subscribe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memberships'] }),
  });
}

export function useProducts(params?: { page?: number; limit?: number; creatorId?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useProductDownloads() {
  return useQuery({
    queryKey: ['products', 'my-downloads'],
    queryFn: () => productsApi.myDownloads(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, applicableType, applicableId }: { code: string; applicableType?: string; applicableId?: string }) =>
      couponsApi.validate(code, applicableType, applicableId),
  });
}
