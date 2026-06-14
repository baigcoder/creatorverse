'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores';
import { authApi } from '@/services/auth';
import { getDefaultPathForRole, getSafeRedirectPath, isUserRole } from '@/lib/rbac';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const loginHighlights = [
  'Secure creator and learner access',
  'Fast switch into dashboard, admin, or learning hub',
  'Password recovery and account routing built in',
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const completeLogin = (user: Awaited<ReturnType<typeof authApi.login>>['user']) => {
    setUser(user);
    setAccessToken(null);

    const params = new URLSearchParams(window.location.search);
    const role = isUserRole(user.role) ? user.role : null;
    const fallbackPath = getDefaultPathForRole(role);
    router.push(params.has('next') ? getSafeRedirectPath(params.get('next'), role) : fallbackPath);
  };

  useEffect(() => {
    let active = true;

    async function exchangeExistingSupabaseSession() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!active || !accessToken) return;

      setIsLoading(true);
      setError('');
      try {
        const response = await authApi.supabaseExchange({ accessToken });
        if (active) completeLogin(response.user);
      } catch (err: any) {
        if (active) setError(err.message || 'Could not finish Supabase sign in.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    exchangeExistingSupabaseSession();
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    setIsGlitching(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword(data);
        if (!supabaseError && supabaseData.session?.access_token) {
          const response = await authApi.supabaseExchange({ accessToken: supabaseData.session.access_token });
          completeLogin(response.user);
          return;
        }

        if (!supabaseError) {
          throw new Error('Supabase sign in did not return a session. Please verify your email and try again.');
        }
      }

      const response = await authApi.login(data);
      completeLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
      setIsGlitching(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setError('');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Supabase auth is not configured for this environment.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const redirectTo = new URL('/auth/login', window.location.origin);
    if (params.has('next')) redirectTo.searchParams.set('next', params.get('next')!);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo.toString() },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#0A0510] font-sans text-white">
      {/* ── CRT Overlay & Scanlines ──────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,10,36,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,184,0.06),rgba(0,228,255,0.02),rgba(166,255,0,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-55 z-40" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,184,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Decorative Neon Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#FF00B8]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#00E4FF]/10 blur-[130px] pointer-events-none" />

      {/* ── Left: Form (Arcade Cabinet Interface) ─────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col px-4 py-8 sm:px-8 lg:h-full lg:w-1/2 lg:overflow-y-auto lg:px-16 lg:py-12 xl:px-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto my-auto w-full max-w-[480px] lg:max-w-[470px]"
        >
          {/* Header Console Tag */}
          <div className="mb-4 flex items-center justify-between rounded-lg border-2 border-black bg-black/40 p-2.5 backdrop-blur-md shadow-[3px_3px_0px_#000]">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-[#FF00B8] to-[#00E4FF] text-xs font-bold text-black border border-black shadow-[1.5px_1.5px_0px_#000]">
                CV
              </span>
              <span className="font-display text-sm font-extrabold uppercase tracking-tight text-white">
                Creator<span className="text-[#00E4FF]">Verse</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#A6FF00] animate-ping" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A6FF00]">SYS: ONLINE</span>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00E4FF]">Portal Access</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
              Access <span className="text-[#FF00B8]">The Void</span>
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
              Sign in to jump back into your creator console, learning station, or admin controls with a cleaner, faster access flow.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {loginHighlights.map((item) => (
                <div key={item} className="rounded-xl border border-white/8 bg-[#140C20]/80 p-2.5">
                  <p className="text-[13px] font-medium leading-5 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card (Arcade Cabinet Sheet) */}
          <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-[#140C20] p-5 shadow-[8px_8px_0px_#000] sm:p-6 lg:p-5">
            {/* Dynamic Corner Decals */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#FF00B8]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00E4FF]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#A6FF00]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#FFE600]" />

            <div className="text-center sm:text-left">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-white sm:text-3xl">
                Access <span className="text-[#FF00B8]">The Void</span>
              </h2>
              <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00E4FF]">
                // BOOTUP INTERFACE // INSERT PLAYER CARD
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="relative mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border-2 border-[#FF3B30] bg-[#FF3B30]/15 p-3 font-mono text-sm text-[#FF3B30] shadow-[3px_3px_0px_#000]">
                  <span className="font-bold">ALERT:</span> {error}
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <div className="mb-1 flex items-baseline justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                    User Email Address
                  </label>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">FREQ_01</span>
                </div>
                <input
                  type="email"
                  placeholder="name@creatorverse.y2k"
                  {...register('email')}
                  className="h-11 w-full rounded-xl border-2 border-black bg-[#1D152C] px-4 font-mono text-sm text-white placeholder:text-slate-500 shadow-[3px_3px_0px_#000] transition-all focus:border-[#00E4FF] focus:outline-none focus:ring-2 focus:ring-[#00E4FF]/10 focus:shadow-[0_0_15px_rgba(0,228,255,0.3)]"
                />
                {errors.email && (
                  <p className="mt-1 font-mono text-[11px] font-medium text-[#FF3B30]">
                    ⚠ {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="mb-1 flex items-baseline justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Encryption Key
                  </label>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">SEC_99</span>
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••••"
                  {...register('password')}
                  className="h-11 w-full rounded-xl border-2 border-black bg-[#1D152C] px-4 font-mono text-sm text-white placeholder:text-slate-500 shadow-[3px_3px_0px_#000] transition-all focus:border-[#FF00B8] focus:outline-none focus:ring-2 focus:ring-[#FF00B8]/10 focus:shadow-[0_0_15px_rgba(255,0,184,0.3)]"
                />
                {errors.password && (
                  <p className="mt-1 font-mono text-[11px] font-medium text-[#FF3B30]">
                    ⚠ {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Secure recovery available</p>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-semibold text-[#00E4FF] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#A6FF00]"
                >
                  Lost password? Decrypt here
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full cursor-pointer overflow-hidden rounded-xl border-2 border-black bg-gradient-to-r from-[#FF00B8] via-[#00E4FF] to-[#A6FF00] py-3 font-display text-sm font-extrabold uppercase tracking-widest text-black shadow-[4px_4px_0px_#000] transition-all hover:scale-[1.01] hover:from-[#FF85E7] hover:to-[#FFE600] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.18em]">
                    BOOTING CHANNELS...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 font-black tracking-widest">
                    ENTER CREATORVERSE <ArrowRight className="h-4 w-4 stroke-[3px]" />
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black" />
                </div>
                <span className="relative bg-[#140C20] px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  OR LINK EXTERNAL PORT
                </span>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#1D152C] py-3 text-sm font-semibold transition-all shadow-[3px_3px_0px_#000] hover:border-[#FF00B8] hover:bg-[#251A3A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000]"
                >
                  <svg className="h-4 w-4 text-[#FF00B8]" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('apple')}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#1D152C] py-3 text-sm font-semibold transition-all shadow-[3px_3px_0px_#000] hover:border-[#00E4FF] hover:bg-[#251A3A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000]"
                >
                  <svg className="h-4 w-4 text-[#00E4FF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Apple</span>
                </button>
              </div>

              {/* Sign up prompt */}
              <p className="mt-4 text-center text-sm uppercase tracking-[0.16em] text-slate-400">
                New pilot?{' '}
                <Link
                  href="/auth/register"
                  className="font-bold text-[#A6FF00] underline decoration-wavy underline-offset-4 transition-colors hover:text-white"
                >
                  Create Character
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Visual (Hyper-interactive Synthwave Cassette Arcade Deck) ──────── */}
      <div className="relative hidden flex-col items-center border-l-4 border-black bg-gradient-to-br from-[#100824] via-[#0A0510] to-[#240835] lg:flex lg:w-1/2 lg:h-full lg:overflow-y-auto lg:py-12">
        {/* Animated Cybergrid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,228,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(0,228,255,0.05)_2px,transparent_2px)] bg-[size:30px_30px] pointer-events-none opacity-40" />

        <div className="relative z-10 my-auto flex w-full max-w-xl flex-col items-center justify-center p-10 text-center xl:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full space-y-6"
          >
            {/* Diagnostic Header */}
            <div className="inline-block self-start rounded-lg border-2 border-black bg-[#140C20] px-4 py-2 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00E4FF] shadow-[3px_3px_0px_#000]">
              DECK CHANNEL: ACTIVE // FEED: OK // CO-PROCESSOR v0.92
            </div>

            {/* Premium Cyber Mixtape Cassette Player Console */}
            <div className="relative bg-[#1C102C] border-4 border-black rounded-3xl p-6 shadow-[10px_10px_0px_#000] overflow-hidden w-full aspect-[4/3] flex flex-col justify-between group hover:rotate-1 transition-transform duration-300">
              {/* Scanlines inside player */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.15)_50%,transparent_50%)] bg-[size:100%_8px] pointer-events-none" />

              {/* Arcade Controller Accents */}
              <div className="z-10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF00B8] shadow-[0_0_8px_#FF00B8] animate-pulse" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#00E4FF]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#A6FF00]" />
                </div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFE600]">
                  CREATOR DECK // STEREO
                </div>
              </div>

              {/* Simulated physical cassette tape */}
              <div className="relative w-full h-[150px] bg-[#140C20] border-3 border-black rounded-2xl flex items-center justify-center p-4 shadow-[inset_4px_4px_0px_#000] my-4">
                {/* Cassette Shell Details */}
                <div className="absolute inset-0 border-2 border-dashed border-[#FF00B8]/20 m-2 rounded-xl pointer-events-none" />

                {/* Spindles / Spinning Gears */}
                <div className="flex gap-16 justify-center items-center z-10 w-full">
                  {/* Left Spindle */}
                  <motion.div
                    animate={{ rotate: isGlitching ? [0, 360, 480, 720] : 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: isGlitching ? 3 : 8,
                      ease: 'linear',
                    }}
                    className="w-16 h-16 rounded-full border-4 border-black bg-[#2C1C45] flex items-center justify-center shadow-[3px_3px_0px_#000] relative"
                  >
                    <div className="w-10 h-10 rounded-full border-4 border-dashed border-[#00E4FF] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#FF00B8]" />
                    </div>
                    {/* Teeth lines */}
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                      <div
                        key={deg}
                        style={{ transform: `rotate(${deg}deg)` }}
                        className="absolute w-1.5 h-6 bg-black"
                      />
                    ))}
                  </motion.div>

                  {/* Right Spindle */}
                  <motion.div
                    animate={{ rotate: isGlitching ? [0, 360, 480, 720] : 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: isGlitching ? 3 : 8,
                      ease: 'linear',
                    }}
                    className="w-16 h-16 rounded-full border-4 border-black bg-[#2C1C45] flex items-center justify-center shadow-[3px_3px_0px_#000] relative"
                  >
                    <div className="w-10 h-10 rounded-full border-4 border-dashed border-[#A6FF00] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-[#FF00B8]" />
                    </div>
                    {/* Teeth lines */}
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                      <div
                        key={deg}
                        style={{ transform: `rotate(${deg}deg)` }}
                        className="absolute w-1.5 h-6 bg-black"
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Cassette Label (Y2K Sticker) */}
                <div className="absolute bottom-1.5 left-1/2 z-20 -translate-x-1/2 rounded-md border-2 border-black bg-[#A6FF00] px-4 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-black shadow-[2px_2px_0px_#000]">
                  CREATOR_CHAOS_v1.0.DAT
                </div>
              </div>

              {/* Bottom Console Elements: Bouncing Audio Waveform */}
              <div className="flex items-end justify-between h-[45px] gap-1 px-2 border-t-2 border-black/40 pt-2.5 z-10">
                {/* 12 Waveform lines bouncing up/down */}
                {Array.from({ length: 18 }).map((_, i) => {
                  const heights = [20, 40, 30, 45, 15, 35, 25, 42, 28, 38, 18, 44, 22, 36, 12, 40, 32, 24];
                  const colors = ['#FF00B8', '#00E4FF', '#A6FF00', '#FFE600'];
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        height: isGlitching
                          ? [8, heights[i % heights.length] * 1.3, 8]
                          : [8, heights[i % heights.length], 8],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6 + (i % 5) * 0.1,
                        ease: 'easeInOut',
                      }}
                      style={{
                        backgroundColor: colors[i % colors.length],
                        width: '100%',
                        borderRadius: '2px',
                      }}
                      className="border border-black shadow-[1px_1px_0px_#000]"
                    />
                  );
                })}
              </div>
            </div>

            {/* Slogan */}
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider text-white md:text-3xl">
                BUILD CHAOS. <br />HARVEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF00B8] to-[#00E4FF] font-black underline decoration-dotted">GOLD.</span>
              </h2>
              <p className="mx-auto max-w-md text-sm leading-7 text-slate-300">
                // ENTER YOUR CREATIVE STATION AND SECURE MONETIZATION FREQUENCIES IMMEDIATELY.
              </p>
            </div>

            {/* Quick floating stat metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { label: 'COIN VALUE', value: 'X9.2' },
                { label: 'BANDWIDTH', value: '999TB' },
                { label: 'SYS_INTEGRITY', value: '100%' },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className="bg-[#140C20] border-2 border-black p-3.5 rounded-2xl shadow-[4px_4px_0px_#000] relative hover:-translate-y-1 transition-transform"
                >
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: idx === 0 ? '#FF00B8' : idx === 1 ? '#00E4FF' : '#A6FF00' }} />
                  <p className="font-display text-lg font-extrabold text-white">{stat.value}</p>
                  <p className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
