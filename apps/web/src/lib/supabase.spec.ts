import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSupabaseConfigured } from './supabase';

describe('Supabase browser auth config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requires both URL and publishable key', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');

    expect(isSupabaseConfigured()).toBe(false);

    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');

    expect(isSupabaseConfigured()).toBe(true);
  });
});
