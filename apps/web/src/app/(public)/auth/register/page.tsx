'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Rocket, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';
import { authApi } from '@/services/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  role: z.enum(['CREATOR', 'LEARNER']).default('LEARNER'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const benefits = [
  'Launch courses, workshops & communities',
  'AI-powered course builder & tutor',
  'Accept payments from day one',
  'Built-in analytics & growth tools',
  'Free plan — no credit card needed',
];

const roleDescriptions = {
  CREATOR: 'Build products, publish content, and monetize your audience.',
  LEARNER: 'Join courses, workshops, and communities with a guided experience.',
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CREATOR' | 'LEARNER'>('CREATOR');
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { role: 'CREATOR' },
  });

  const completeRegistration = (user: Awaited<ReturnType<typeof authApi.register>>['user']) => {
    setUser(user);
    setAccessToken(null);

    if (user.role === 'CREATOR') {
      router.push('/dashboard');
    } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/learn');
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const redirectTo = new URL('/auth/login', window.location.origin);
        const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: redirectTo.toString(),
            data: {
              name: data.name,
              role: data.role,
            },
          },
        });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!supabaseData.session?.access_token) {
          setError('Account created. Check your email to confirm Supabase sign up, then sign in.');
          return;
        }

        const response = await authApi.supabaseExchange({
          accessToken: supabaseData.session.access_token,
          name: data.name,
          role: data.role,
        });
        completeRegistration(response.user);
      } else {
        const response = await authApi.register(data);
        completeRegistration(response.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen lg:h-screen w-screen flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#0A0510] font-sans text-white">
      {/* ── CRT Overlay & Scanlines ──────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,10,36,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,184,0.06),rgba(0,228,255,0.02),rgba(166,255,0,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-55 z-40" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,228,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,228,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Decorative Glowing Blobs */}
      <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#00E4FF]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#FF00B8]/10 blur-[130px] pointer-events-none" />

      {/* ── Left: Visual (Zine Grid / Mixtape Benefits Panel) ──────────────────────────────── */}
      <div className="relative hidden flex-col border-r-4 border-black bg-gradient-to-br from-[#0C0717] via-[#0A0510] to-[#17052C] px-12 xl:px-16 lg:flex lg:w-1/2 lg:h-full lg:overflow-y-auto lg:py-12">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,184,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,0,184,0.05)_2px,transparent_2px)] bg-[size:30px_30px] pointer-events-none opacity-40" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 my-auto space-y-8"
        >
          <div className="inline-block rounded-lg border-2 border-black bg-[#140C20] px-4 py-2 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A6FF00] shadow-[3px_3px_0px_#000]">
            CO-PROCESSOR PROTOCOL // LOADED // STATUS: WAITING_PLAYER_2
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-4xl font-extrabold uppercase leading-tight tracking-wide text-white xl:text-5xl">
              Start Building <br />Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF00B8] to-[#00E4FF] font-black underline decoration-wavy">Creator Empire</span>
            </h2>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              Build your creator identity, launch products, and get to revenue faster with a more focused onboarding flow and cleaner setup surface.
            </p>
          </div>

          {/* Benefits list (Styled as mixtape zine index cards) */}
          <div className="grid max-w-xl gap-4">
            {benefits.map((benefit, index) => {
              const textColors = ['text-[#FF00B8]', 'text-[#00E4FF]', 'text-[#A6FF00]', 'text-[#FFE600]', 'text-[#FF3B30]'];
              const isItemHovered = isHovered === `benefit-${index}`;
              return (
                <div
                  key={benefit}
                  onMouseEnter={() => setIsHovered(`benefit-${index}`)}
                  onMouseLeave={() => setIsHovered(null)}
                  className={`flex items-center gap-4 rounded-xl border-2 border-black bg-[#140C20] p-4 shadow-[4px_4px_0px_#000] transition-all duration-200 ${
                    isItemHovered ? '-translate-y-1 shadow-[6px_6px_0px_#000] border-l-8' : ''
                  }`}
                >
                  <span className={`font-display text-xl font-black ${textColors[index % textColors.length]}`}>
                    0{index + 1}.
                  </span>
                  <span className="text-sm leading-6 text-slate-300">
                    {benefit}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Right: Form (Character Creation Dashboard) ────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col px-4 py-8 sm:px-8 lg:w-1/2 lg:h-full lg:overflow-y-auto lg:px-16 lg:py-12 xl:px-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto my-auto w-full max-w-[520px]"
        >
          {/* Header Console Tag */}
          <div className="mb-5 flex items-center justify-between rounded-lg border-2 border-black bg-black/40 p-2.5 backdrop-blur-md shadow-[3px_3px_0px_#000]">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-[#FF00B8] to-[#00E4FF] text-xs font-bold text-black border border-black shadow-[1.5px_1.5px_0px_#000]">
                CV
              </span>
              <span className="font-display text-sm font-extrabold uppercase tracking-tight text-white">
                Creator<span className="text-[#00E4FF]">Verse</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#FF00B8] animate-ping" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF00B8]">COIN: INSERTED</span>
            </div>
          </div>

          {/* Form Card (Arcade Cabinet Sheet) */}
          <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-[#140C20] p-6 shadow-[8px_8px_0px_#000] sm:p-8">
            {/* Dynamic Corner Decals */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#FF00B8]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00E4FF]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#A6FF00]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#FFE600]" />

            <div className="text-center sm:text-left">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-white sm:text-3xl">
                Initialize <span className="text-[#A6FF00]">Pilot</span>
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Choose your role, create your account, and initialize your profile.
              </p>
            </div>

            {/* Role selector (Arcade Buttons style) */}
            <div className="mt-6">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Choose Class
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('CREATOR');
                    setValue('role', 'CREATOR');
                  }}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition-all shadow-[3px_3px_0px_#000] ${
                    selectedRole === 'CREATOR'
                      ? 'border-black bg-[#FF00B8] text-black translate-x-[1.5px] translate-y-[1.5px] shadow-[1.5px_1.5px_0px_#000]'
                      : 'border-black bg-[#1D152C] text-slate-400 hover:text-white hover:border-[#FF00B8]'
                  }`}
                >
                  <Rocket className="h-4 w-4 stroke-[2.5px]" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Creator</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('LEARNER');
                    setValue('role', 'LEARNER');
                  }}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3.5 text-sm font-semibold transition-all shadow-[3px_3px_0px_#000] ${
                    selectedRole === 'LEARNER'
                      ? 'border-black bg-[#00E4FF] text-black translate-x-[1.5px] translate-y-[1.5px] shadow-[1.5px_1.5px_0px_#000]'
                      : 'border-black bg-[#1D152C] text-slate-400 hover:text-white hover:border-[#00E4FF]'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 stroke-[2.5px]" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Learner</span>
                </button>
              </div>
              <p className="mt-3 text-xs text-[#00E4FF] font-medium leading-normal">
                {roleDescriptions[selectedRole]}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="relative mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border-2 border-[#FF3B30] bg-[#FF3B30]/15 p-3 font-mono text-sm text-[#FF3B30] shadow-[3px_3px_0px_#000]">
                  <span className="font-bold">ALERT:</span> {error}
                </div>
              )}

              {/* Full Name Input */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Pilot Username
                </label>
                <input
                  placeholder="e.g. MC_Glitchy"
                  {...register('name')}
                  className="h-11 w-full rounded-xl border-2 border-black bg-[#1D152C] px-4 font-mono text-sm text-white placeholder:text-slate-500 shadow-[3px_3px_0px_#000] transition-all focus:border-[#A6FF00] focus:outline-none focus:ring-2 focus:ring-[#A6FF00]/10 focus:shadow-[0_0_15px_rgba(166,255,0,0.3)]"
                />
                {errors.name && (
                  <p className="mt-1 font-mono text-[11px] font-medium text-[#FF3B30]">
                    ⚠ {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Mixtape Channel Email
                </label>
                <input
                  type="email"
                  placeholder="pilot@creatorverse.y2k"
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
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Password Encryption
                </label>
                <input
                  type="password"
                  placeholder="8+ chars, upper, lower, number, special"
                  {...register('password')}
                  className="h-11 w-full rounded-xl border-2 border-black bg-[#1D152C] px-4 font-mono text-sm text-white placeholder:text-slate-500 shadow-[3px_3px_0px_#000] transition-all focus:border-[#FF00B8] focus:outline-none focus:ring-2 focus:ring-[#FF00B8]/10 focus:shadow-[0_0_15px_rgba(255,0,184,0.3)]"
                />
                {errors.password && (
                  <p className="mt-1 font-mono text-[11px] font-medium text-[#FF3B30]">
                    ⚠ {errors.password.message}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Password checklist</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Use at least 8 characters including uppercase, lowercase, number, and special character.</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full cursor-pointer overflow-hidden rounded-xl border-2 border-black bg-gradient-to-r from-[#A6FF00] via-[#00E4FF] to-[#FF00B8] py-3.5 font-display text-sm font-extrabold uppercase tracking-widest text-black shadow-[4px_4px_0px_#000] transition-all hover:scale-[1.01] hover:from-[#FFE600] hover:to-[#FF85E7] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.18em]">
                    CONFIGURING FREQUENCIES...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 tracking-widest font-black">
                    CREATE AVATAR // GO LIVE <ArrowRight className="h-4 w-4 stroke-[3px]" />
                  </span>
                )}
              </button>

              {/* Policy terms */}
              <p className="text-center text-xs leading-6 text-slate-500">
                By entering the void, you authorize our{' '}
                <Link href="#" className="text-[#00E4FF] hover:underline">Zine Protocols</Link> and{' '}
                <Link href="#" className="text-[#00E4FF] hover:underline">Privacy Mixtape</Link>
              </p>

              {/* Log in prompt */}
              <p className="mt-4 text-center text-sm uppercase tracking-[0.16em] text-slate-400">
                Already registered?{' '}
                <Link
                  href="/auth/login"
                  className="font-bold text-[#00E4FF] underline decoration-wavy underline-offset-4 transition-colors hover:text-white"
                >
                  Enter Station
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
