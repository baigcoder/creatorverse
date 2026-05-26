import apiFetch from '@/lib/api-client';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CREATOR' | 'LEARNER' | 'AFFILIATE' | string;
  phone?: string | null;
  avatarUrl: string | null;
  creatorProfile?: unknown;
};

export type AuthResult = {
  user: AuthUser;
  verificationToken?: string;
};

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    apiFetch<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  supabaseExchange: (data: { accessToken: string; role?: 'CREATOR' | 'LEARNER'; name?: string }) =>
    apiFetch<AuthResult>('/auth/supabase/exchange', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  refresh: () =>
    apiFetch<AuthResult>('/auth/refresh', { method: 'POST' }),

  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (data: { token: string; password: string }) =>
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  verifyEmail: (token: string) =>
    apiFetch('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),

  me: () =>
    apiFetch<AuthUser>('/auth/me'),
};
