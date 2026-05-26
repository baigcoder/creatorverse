import apiFetch from '@/lib/api-client';

export type UploadPolicy = {
  provider: 'local-dev' | 's3-compatible';
  bucket: string | null;
  key: string;
  maxSize: number;
  contentType: string;
  uploadUrl: string | null;
  method?: 'PUT';
  headers?: Record<string, string>;
  expiresIn?: number;
  message?: string;
};

export type SignedMediaUrl = {
  key: string;
  url: string;
  expiresIn: number;
};

export type MediaAsset = {
  id: string;
  key: string;
  filename: string;
  contentType: string;
  size: number;
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE' | string;
  status: string;
  url?: string | null;
  folder?: string | null;
  createdAt?: string;
};

export const mediaApi = {
  list: (params?: { folder?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    return apiFetch<{ data: MediaAsset[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/media${query.toString() ? `?${query.toString()}` : ''}`);
  },
  uploadPolicy: (data: { filename: string; contentType: string; size: number; folder?: string }) =>
    apiFetch<UploadPolicy>('/media/upload-policy', { method: 'POST', body: JSON.stringify(data) }),
  completeUpload: (data: {
    key: string;
    filename: string;
    contentType: string;
    size: number;
    folder?: string;
    url?: string;
    visibility?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
    metadata?: Record<string, unknown>;
  }) => apiFetch<MediaAsset>('/media/complete-upload', { method: 'POST', body: JSON.stringify(data) }),
  signedUrl: (key: string) =>
    apiFetch<SignedMediaUrl>(`/media/signed-url?key=${encodeURIComponent(key)}`),
  uploadFile: async (file: File, policy: UploadPolicy) => {
    if (!policy.uploadUrl) return { uploaded: false, key: policy.key, message: policy.message ?? 'Upload provider is not configured.' };
    const response = await fetch(policy.uploadUrl, {
      method: policy.method ?? 'PUT',
      headers: policy.headers ?? { 'Content-Type': file.type },
      body: file,
    });
    if (!response.ok) throw new Error(`Upload failed with HTTP ${response.status}`);
    return { uploaded: true, key: policy.key };
  },
};
