import apiFetch from '@/lib/api-client';

export type WorkshopStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | string;

export type Workshop = {
  id: string;
  creatorId: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  startTime: string;
  endTime: string;
  meetingProvider: string;
  meetingUrl?: string | null;
  price: number | string;
  currency: string;
  status: WorkshopStatus;
  maxAttendees?: number | null;
  replayUrl?: string | null;
  createdAt?: string;
  creator?: {
    id: string;
    brandName: string;
    logoUrl?: string | null;
    slug?: string | null;
  };
  registrations?: Array<{
    id: string;
    attended: boolean;
    attendanceMinutes: number;
    user?: {
      id: string;
      name: string;
      avatarUrl?: string | null;
    };
  }>;
  _count?: {
    registrations?: number;
  };
};

export type WorkshopListParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export type CreateWorkshopInput = {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  startTime: string;
  endTime: string;
  meetingProvider?: string;
  meetingUrl?: string;
  price?: number;
  currency?: string;
  maxAttendees?: number;
};

export type UpdateWorkshopInput = Partial<CreateWorkshopInput> & {
  status?: WorkshopStatus;
  replayUrl?: string;
};

function toQuery(params?: WorkshopListParams) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  return query.toString();
}

export const workshopsApi = {
  list: (params?: WorkshopListParams) => {
    const query = toQuery(params);
    return apiFetch<Workshop[] | { data: Workshop[]; meta?: unknown }>(`/workshops${query ? `?${query}` : ''}`).then((result) =>
      Array.isArray(result) ? result : result.data,
    );
  },

  get: (id: string) =>
    apiFetch<Workshop>(`/workshops/${id}`),

  getBySlug: (slug: string) =>
    apiFetch<Workshop>(`/workshops/slug/${slug}`),

  create: (data: CreateWorkshopInput) =>
    apiFetch<Workshop>('/workshops', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateWorkshopInput) =>
    apiFetch<Workshop>(`/workshops/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch(`/workshops/${id}`, { method: 'DELETE' }),

  register: (id: string) =>
    apiFetch(`/workshops/${id}/register`, { method: 'POST' }),

  markAttendance: (id: string, data: { attended: boolean; attendanceMinutes?: number }) =>
    apiFetch(`/workshops/${id}/attendance`, { method: 'POST', body: JSON.stringify(data) }),
};
