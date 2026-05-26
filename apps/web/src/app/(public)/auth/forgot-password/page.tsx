'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, ArrowLeft, Key } from 'lucide-react';
import { authApi } from '@/services/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0A0510] overflow-hidden text-white font-sans px-4">
      {/* ── CRT Overlay & Scanlines ──────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,10,36,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,184,0.06),rgba(0,228,255,0.02),rgba(166,255,0,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-55 z-40" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,184,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Glowing Neon Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-[#FF00B8]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[#00E4FF]/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header console status */}
        <div className="flex items-center justify-between mb-6 bg-black/40 border-2 border-black rounded-lg p-2.5 backdrop-blur-md shadow-[3px_3px_0px_#000]">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-[#FF00B8] to-[#00E4FF] text-xs font-bold text-black border border-black shadow-[1.5px_1.5px_0px_#000]">
              CV
            </span>
            <span className="font-display text-sm font-extrabold tracking-tight text-white uppercase">
              Creator<span className="text-[#00E4FF]">Verse</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#FFE600] animate-pulse" />
            <span className="font-retro text-xs tracking-widest text-[#FFE600]">SEC_PORT: OPEN</span>
          </div>
        </div>

        {/* Decoder Terminal Box */}
        <div className="relative bg-[#140C20] border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0px_#000] overflow-hidden">
          {/* Corner highlights */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#FF00B8]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00E4FF]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#A6FF00]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#FFE600]" />

          {success ? (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black bg-[#A6FF00] text-black shadow-[4px_4px_0px_#000]"
              >
                <Key className="h-8 w-8 stroke-[2.5px] animate-bounce" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-extrabold text-[#A6FF00] uppercase tracking-wide">
                  TRANSMISSION SENT!
                </h3>
                <p className="font-retro text-base tracking-wider text-slate-400 uppercase">
                  // DECRYPTION FREQUENCY BEAMED TO REGISTERED CHANNEL
                </p>
              </div>

              {/* Terminal mock diagnostic report */}
              <div className="bg-black/50 border-2 border-black rounded-xl p-4 font-mono text-left text-xs text-slate-300 space-y-1.5 shadow-[inset_3px_3px_0px_#000]">
                <p className="text-[#00E4FF] font-bold">SYS REPORT // RECOVERY_LOG:</p>
                <p>&gt; MATCH FOUND: TRUE</p>
                <p>&gt; PROTOCOL: TRANSMIT_KEY_RESET</p>
                <p>&gt; ENVELOPE STATUS: SENT_OUTBOX_99</p>
                <p className="text-[#A6FF00] font-semibold">&gt; SUCCESS: PLEASE CHECK YOUR INBOX</p>
              </div>

              <Link href="/auth/login" className="block w-full">
                <button className="relative w-full py-3 bg-[#1D152C] hover:bg-[#251A3A] text-white border-2 border-black rounded-xl text-sm font-semibold transition-all shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] cursor-pointer hover:border-[#00E4FF]">
                  <span className="flex items-center justify-center gap-2 font-retro text-sm uppercase tracking-wider">
                    <ArrowLeft className="h-4 w-4" /> Return to Login Station
                  </span>
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="text-center sm:text-left">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white">
                  Decrypt <span className="text-[#FFE600] text-glow-yellow">Frequency</span>
                </h1>
                <p className="mt-1 font-retro text-base tracking-wider text-[#00E4FF]">
                  // LOST ACCESS KEY? BROADCAST LINK REQUEST
                </p>
              </div>

              {error && (
                <div className="rounded-xl border-2 border-[#FF3B30] bg-[#FF3B30]/15 p-3 text-sm text-[#FF3B30] font-mono shadow-[3px_3px_0px_#000]">
                  <span className="font-bold">ALERT:</span> {error}
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block font-retro text-sm uppercase tracking-wider text-slate-300">
                    Your Registered Email
                  </label>
                  <span className="font-retro text-xs text-slate-500">BEAM_CH</span>
                </div>
                <input
                  type="email"
                  placeholder="name@creatorverse.y2k"
                  {...register('email')}
                  className="h-12 w-full rounded-xl border-2 border-black bg-[#1D152C] px-4 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00E4FF] focus:ring-2 focus:ring-[#00E4FF]/10 focus:shadow-[0_0_15px_rgba(0,228,255,0.3)] transition-all shadow-[3px_3px_0px_#000]"
                />
                {errors.email && (
                  <p className="mt-1 font-retro text-xs text-[#FF3B30] tracking-wide">
                    ⚠ {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative group w-full py-3.5 bg-gradient-to-r from-[#FFE600] via-[#FF00B8] to-[#00E4FF] hover:from-[#A6FF00] hover:to-[#FF85E7] text-black font-display font-extrabold text-sm uppercase tracking-widest rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all hover:scale-[1.01] overflow-hidden cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2 font-retro text-lg tracking-widest">
                    BROADCASTING RECOVERY...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 tracking-widest font-black">
                    INITIALIZE DECRYPTION <RefreshCw className="h-4 w-4 stroke-[3px] animate-spin-slow" />
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center border-t-2 border-black pt-4">
                <Link
                  href="/auth/login"
                  className="font-retro text-sm text-[#00E4FF] hover:text-[#A6FF00] transition-colors flex items-center gap-1.5 underline decoration-dotted"
                >
                  <ArrowLeft className="h-4 w-4" /> Remember password? Login here
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
