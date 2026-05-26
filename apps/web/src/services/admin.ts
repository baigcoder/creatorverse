import apiFetch from '@/lib/api-client';
import { Order } from './payments';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  createdAt: string;
};

export type AdminCreator = {
  id: string;
  brandName: string;
  slug: string;
  createdAt?: string;
  user?: { id: string; name: string; email: string };
  _count?: { courses?: number; orders?: number };
};

export type AdminCourse = {
  id: string;
  title: string;
  status: string;
  price: number | string;
  currency: string;
  createdAt: string;
  creator?: { id: string; brandName: string };
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string } | null;
};

export type ModerationPost = {
  id: string;
  content: string;
  pinned?: boolean;
  createdAt: string;
  author?: { id: string; name: string; email: string };
  room?: { id: string; name: string };
};

export type AnalyticsReport = {
  id: string;
  eventType: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type AdminListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type SystemHealth = {
  status: string;
  database: string;
  redis?: string;
  queues?: string;
  providers?: {
    stripeConfigured: boolean;
    razorpayConfigured: boolean;
    s3Configured: boolean;
    resendConfigured: boolean;
    aiConfigured: boolean;
  };
  users: number;
  courses: number;
  orders: number;
  checkedAt: string;
};

function toQuery(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  return query.toString();
}

export const adminApi = {
  users: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = toQuery(params);
    return apiFetch<AdminListResponse<AdminUser>>(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserStatus: (id: string, status: string) =>
    apiFetch<AdminUser>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  creators: () => apiFetch<AdminCreator[]>('/admin/creators'),
  courses: (params?: { page?: number; limit?: number }) => {
    const query = toQuery(params);
    return apiFetch<AdminCourse[]>(`/admin/courses${query ? `?${query}` : ''}`);
  },
  payments: (params?: { page?: number; limit?: number }) => {
    const query = toQuery(params);
    return apiFetch<Order[]>(`/admin/payments${query ? `?${query}` : ''}`);
  },
  reports: () => apiFetch<AnalyticsReport[]>('/admin/reports'),
  moderation: () => apiFetch<ModerationPost[]>('/admin/moderation'),
  moderateContent: (id: string, action: 'PIN' | 'UNPIN' | 'REJECT' | 'DELETE', reason?: string) =>
    apiFetch<ModerationPost | { success: boolean }>(`/admin/moderation/${id}`, { method: 'PATCH', body: JSON.stringify({ action, reason }) }),
  logs: () => apiFetch<AuditLog[]>('/admin/logs'),
  systemHealth: () => apiFetch<SystemHealth>('/admin/system-health'),
};
