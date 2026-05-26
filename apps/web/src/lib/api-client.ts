const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : null;
}

function isMutating(options?: RequestInit) {
  return MUTATING_METHODS.has((options?.method ?? 'GET').toUpperCase());
}

async function ensureCsrfToken() {
  let token = getCookie('csrfToken');
  if (token) return token;

  const response = await fetch(`${API_URL}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Could not initialize security token');

  const json = await response.json();
  token = json?.data?.csrfToken ?? getCookie('csrfToken');
  if (!token) throw new Error('Security token was not issued');
  return token;
}

async function buildHeaders(options?: RequestInit) {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (!(options?.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (isMutating(options)) {
    headers['x-csrf-token'] = await ensureCsrfToken();
  }

  return headers;
}

async function request(endpoint: string, options?: RequestInit) {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: await buildHeaders(options),
    credentials: 'include',
  });
}

async function refreshSession() {
  const response = await request('/auth/refresh', { method: 'POST' });
  return response.ok;
}

function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('accessToken');
  if (!window.location.pathname.startsWith('/auth')) {
    window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
}

async function parseError(response: Response) {
  const error = await response.json().catch(() => ({ message: 'Request failed' }));
  return new Error(error.message || `HTTP ${response.status}`);
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  let response = await request(endpoint, options);

  if (response.status === 401 && endpoint !== '/auth/refresh') {
    const refreshed = await refreshSession();
    if (refreshed) response = await request(endpoint, options);
    else handleUnauthorized();
  }

  if (!response.ok) throw await parseError(response);

  const json = await response.json();
  return (json as any).data !== undefined ? (json as any).data : json;
}

async function apiFetchRaw<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let response = await request(endpoint, options);

  if (response.status === 401 && endpoint !== '/auth/refresh') {
    const refreshed = await refreshSession();
    if (refreshed) response = await request(endpoint, options);
    else handleUnauthorized();
  }

  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<T>;
}

export { apiFetch, apiFetchRaw, ensureCsrfToken };
export default apiFetch;

