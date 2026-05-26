import apiFetch from '@/lib/api-client';

type Paginated<T> = { data: T[]; meta?: unknown };

function pageData<T>(result: T[] | Paginated<T>) {
  return Array.isArray(result) ? result : result.data;
}

export const communityApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any || {}).toString();
    return apiFetch<any[] | Paginated<any>>(`/communities${query ? `?${query}` : ''}`).then(pageData);
  },

  discover: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any || {}).toString();
    return apiFetch<any[] | Paginated<any>>(`/communities/discover${query ? `?${query}` : ''}`).then(pageData);
  },

  get: (id: string) =>
    apiFetch<any>(`/communities/${id}`),

  getAccessible: (id: string) =>
    apiFetch<any>(`/communities/access/${id}`),

  create: (data: any) =>
    apiFetch<any>('/communities', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiFetch<any>(`/communities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  rooms: (communityId: string) =>
    apiFetch<any[]>(`/communities/${communityId}/rooms`),

  createRoom: (communityId: string, data: any) =>
    apiFetch(`/communities/${communityId}/rooms`, { method: 'POST', body: JSON.stringify(data) }),

  posts: (roomId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any || {}).toString();
    return apiFetch<any[] | Paginated<any>>(`/communities/rooms/${roomId}/posts${query ? `?${query}` : ''}`).then(pageData);
  },

  createPost: (roomId: string, data: any) =>
    apiFetch(`/communities/rooms/${roomId}/posts`, { method: 'POST', body: JSON.stringify(data) }),

  addComment: (postId: string, data: any) =>
    apiFetch(`/communities/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) }),

  addReaction: (postId: string, type: string) =>
    apiFetch(`/communities/posts/${postId}/reactions`, { method: 'POST', body: JSON.stringify({ type }) }),

  createPoll: (postId: string, data: any) =>
    apiFetch(`/communities/posts/${postId}/poll`, { method: 'POST', body: JSON.stringify(data) }),

  votePoll: (pollId: string, option: string) =>
    apiFetch(`/communities/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ option }) }),
};
