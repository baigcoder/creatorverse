'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/services/auth';
import { getSafeRedirectPath, isUserRole } from '@/lib/rbac';
import { useAuthStore } from '@/stores';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function RefreshingSessionPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [message, setMessage] = useState('Refreshing your secure session...');

  useEffect(() => {
    let cancelled = false;

    async function refreshSession() {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');

      try {
        const response = await authApi.refresh().catch(async () => {
          const supabase = getSupabaseBrowserClient();
          const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
          const accessToken = data.session?.access_token;
          if (!accessToken) throw new Error('No Supabase session');
          return authApi.supabaseExchange({ accessToken });
        });
        if (cancelled) return;

        setUser(response.user);
        setAccessToken(null);

        const role = isUserRole(response.user.role) ? response.user.role : null;
        router.replace(getSafeRedirectPath(next, role));
      } catch {
        if (cancelled) return;

        setMessage('Session expired. Redirecting to login...');
        const loginUrl = new URL('/auth/login', window.location.origin);
        if (next) loginUrl.searchParams.set('next', next);
        loginUrl.searchParams.set('reason', 'session_expired');
        router.replace(`${loginUrl.pathname}${loginUrl.search}`);
      }
    }

    void refreshSession();

    return () => {
      cancelled = true;
    };
  }, [router, setAccessToken, setUser]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#0A0510] px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet/30 bg-violet/15 text-violet-200">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Securing your route</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
      </section>
    </main>
  );
}
