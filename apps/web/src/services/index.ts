import apiFetch from '@/lib/api-client';

export const analyticsApi = {
  creatorOverview: () =>
    apiFetch<any>('/analytics/creator-overview'),

  course: (id: string) =>
    apiFetch<any>(`/analytics/course/${id}`),

  funnel: (params?: { from?: string; to?: string }) => {
    const query = new URLSearchParams(params as any || {}).toString();
    return apiFetch<any>(`/analytics/funnel${query ? `?${query}` : ''}`);
  },

  community: () =>
    apiFetch<any>('/analytics/community'),

  students: () =>
    apiFetch<any>('/analytics/students'),

  trackEvent: (data: { eventType: string; metadata?: Record<string, unknown> }) =>
    apiFetch<any>('/analytics/events', { method: 'POST', body: JSON.stringify(data) }),
};

export const notificationsApi = {
  list: () =>
    apiFetch<any[]>('/notifications'),

  markRead: (id: string) =>
    apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiFetch('/notifications/read-all', { method: 'PATCH' }),

  preferences: () =>
    apiFetch<any[]>('/notifications/preferences'),

  updatePreferences: (preferences: Array<{ channel: string; type: string; enabled: boolean }>) =>
    apiFetch('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(preferences) }),
};

export const gamificationApi = {
  leaderboard: () =>
    apiFetch<any>('/gamification/leaderboard'),

  badges: () =>
    apiFetch<any[]>('/gamification/badges'),

  achievements: () =>
    apiFetch<any[]>('/gamification/achievements'),

  streak: () =>
    apiFetch<any>('/gamification/streak'),

  challenges: () =>
    apiFetch<any[]>('/gamification/challenges'),

  joinChallenge: (id: string) =>
    apiFetch(`/gamification/challenges/${id}/join`, { method: 'POST' }),
};

export const certificatesApi = {
  generate: (data: { enrollmentId: string; templateId?: string }) =>
    apiFetch<any>('/certificates/generate', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: string) =>
    apiFetch<any>(`/certificates/${id}`),

  verify: (id: string) =>
    apiFetch<any>(`/certificates/${id}/verify`),

  templates: (creatorId?: string) =>
    apiFetch<any[]>(`/certificate-templates${creatorId ? `?creatorId=${creatorId}` : ''}`),

  createTemplate: (data: any) =>
    apiFetch<any>('/certificate-templates', { method: 'POST', body: JSON.stringify(data) }),
};

export const adminApi = {
  users: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(params as any || {}).toString();
    return apiFetch<any>(`/admin/users${query ? `?${query}` : ''}`);
  },

  updateUserStatus: (id: string, status: string) =>
    apiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  creators: () =>
    apiFetch<any[]>('/admin/creators'),

  courses: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any || {}).toString();
    return apiFetch<any[]>(`/admin/courses${query ? `?${query}` : ''}`);
  },

  payments: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any || {}).toString();
    return apiFetch<any[]>(`/admin/payments${query ? `?${query}` : ''}`);
  },

  reports: () =>
    apiFetch<any[]>('/admin/reports'),

  moderation: () =>
    apiFetch<any[]>('/admin/moderation'),

  logs: () =>
    apiFetch<any[]>('/admin/logs'),

  systemHealth: () =>
    apiFetch<any>('/admin/system-health'),

  settings: () =>
    apiFetch<any[]>('/admin/settings'),

  updateSetting: (data: { key: string; value: Record<string, unknown> }) =>
    apiFetch<any>('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }),

  moderate: (id: string, data: { action: 'APPROVE' | 'REJECT' | 'PIN' | 'UNPIN' | 'DELETE'; reason?: string }) =>
    apiFetch<any>(`/admin/moderation/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const mediaApi = {
  uploadPolicy: (data: { filename: string; contentType: string; size: number; folder?: string }) =>
    apiFetch<any>('/media/upload-policy', { method: 'POST', body: JSON.stringify(data) }),

  signedUrl: (key: string) =>
    apiFetch<any>(`/media/signed-url?key=${encodeURIComponent(key)}`),

  completeUpload: (data: { key: string; filename: string; contentType: string; size: number; folder?: string; url?: string; visibility?: string; metadata?: Record<string, unknown> }) =>
    apiFetch<any>('/media/complete-upload', { method: 'POST', body: JSON.stringify(data) }),
};

export const affiliatesApi = {
  create: (data: { userId: string; code?: string; commissionRate?: number; commissionType?: string }) =>
    apiFetch<any>('/affiliates', { method: 'POST', body: JSON.stringify(data) }),

  list: () =>
    apiFetch<any[]>('/affiliates'),

  earnings: (id: string) =>
    apiFetch<any[]>(`/affiliates/${id}/earnings`),

  payout: (id: string, earningIds?: string[]) =>
    apiFetch<any>(`/affiliates/${id}/payout`, { method: 'POST', body: JSON.stringify({ earningIds }) }),
};

export const marketingApi = {
  list: () =>
    apiFetch<any[]>('/marketing/campaigns'),

  create: (data: { name: string; subject: string; previewText?: string; body: string; audience?: string }) =>
    apiFetch<any>('/marketing/campaigns', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { name?: string; subject?: string; previewText?: string; body?: string; audience?: string; status?: string }) =>
    apiFetch<any>(`/marketing/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  send: (id: string) =>
    apiFetch<any>(`/marketing/campaigns/${id}/send`, { method: 'POST' }),
};

export const landingPagesApi = {
  list: () =>
    apiFetch<any[]>('/landing-pages'),

  create: (data: any) =>
    apiFetch<any>('/landing-pages', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiFetch<any>(`/landing-pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  publish: (id: string) =>
    apiFetch(`/landing-pages/${id}/publish`, { method: 'POST' }),

  archive: (id: string) =>
    apiFetch(`/landing-pages/${id}`, { method: 'DELETE' }),

  viewBySlug: (slug: string) =>
    apiFetch<any>(`/lp/${slug}`),
};

export const creatorsApi = {
  get: (id: string) =>
    apiFetch<any>(`/creators/${id}`),

  create: (data: any) =>
    apiFetch<any>('/creators', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiFetch<any>(`/creators/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  courses: (id: string) =>
    apiFetch<any[]>(`/creators/${id}/courses`),

  stats: (id: string) =>
    apiFetch<any>(`/creators/${id}/stats`),
};

export const usersApi = {
  me: () =>
    apiFetch<any>('/users/me'),

  updateMe: (data: { name?: string; phone?: string; avatarUrl?: string }) =>
    apiFetch<any>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};
