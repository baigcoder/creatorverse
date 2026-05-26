import { describe, expect, it } from 'vitest';
import { decodeAccessToken } from './rbac-token';

function createUnsignedToken(payload: Record<string, unknown>) {
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('decodeAccessToken', () => {
  it('returns a valid payload when role and expiry are usable', () => {
    const token = createUnsignedToken({
      sub: 'user_1',
      email: 'creator@example.com',
      role: 'CREATOR',
      exp: 100,
    });

    expect(decodeAccessToken(token, 50_000)).toEqual({
      sub: 'user_1',
      email: 'creator@example.com',
      role: 'CREATOR',
      exp: 100,
    });
  });

  it('rejects expired tokens and unknown roles', () => {
    expect(decodeAccessToken(createUnsignedToken({ sub: 'user_1', role: 'CREATOR', exp: 10 }), 10_000)).toBeNull();
    expect(decodeAccessToken(createUnsignedToken({ sub: 'user_1', role: 'OWNER', exp: 100 }), 50_000)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(decodeAccessToken(undefined)).toBeNull();
    expect(decodeAccessToken('not-a-jwt')).toBeNull();
  });
});
