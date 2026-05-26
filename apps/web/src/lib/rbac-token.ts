import { isUserRole, type UserRole } from './rbac';

export type AccessTokenPayload = {
  sub: string;
  email?: string;
  role: UserRole;
  exp: number;
};

function decodeBase64Url(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

export function decodeAccessToken(accessToken?: string, nowMs = Date.now()): AccessTokenPayload | null {
  if (!accessToken) return null;

  try {
    const [, payload] = accessToken.split('.');
    if (!payload) return null;

    const parsed = JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
    if (typeof parsed.sub !== 'string' || !isUserRole(parsed.role) || typeof parsed.exp !== 'number') {
      return null;
    }

    if (parsed.exp <= Math.floor(nowMs / 1000)) {
      return null;
    }

    return {
      sub: parsed.sub,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      role: parsed.role,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}
