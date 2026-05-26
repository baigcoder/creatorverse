'use client';

import { Calendar, Clock, Users, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRegisterWorkshop, useWorkshops } from '@/hooks/use-workshops';
import { motion } from 'framer-motion';
import Link from 'next/link';

function money(value: number | string, currency = 'USD') {
  const amount = Number(value ?? 0);
  return amount === 0 ? 'FREE ENTRY' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function LearnerWorkshopsPage() {
  const { data: workshops = [], isLoading, isError, error } = useWorkshops({ limit: 24 });
  const registerWorkshop = useRegisterWorkshop();

  async function register(id: string) {
    try {
      await registerWorkshop.mutateAsync(id);
      toast.success('Registered for workshop');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Live Sessions
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Register for live tournaments, interactive workshops, and masterclasses.
          </p>
        </div>
        <Link
          href="/learn"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Hub
        </Link>
      </motion.div>

      {/* ── Workshops Listing ─────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm font-medium text-error">
          {error instanceof Error ? error.message : 'Workshops could not be loaded.'}
        </div>
      ) : workshops.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
          <Video className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-4 font-display text-lg font-bold text-white">No active matches scheduled</p>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Live interactive tournament classes will display here. Check back soon for entry codes!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {workshops.map((workshop, index) => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet/20 hover:shadow-[0_0_30px_rgba(255,0,184,0.08)] overflow-hidden transition-all duration-300"
            >
              <div>
                <div className="relative aspect-video rounded-t-xl bg-gradient-to-br from-violet/10 to-cyan/10 flex items-center justify-center border-b border-white/[0.06] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight to-transparent opacity-60" />
                  <Video className="h-10 w-10 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <span className="rounded bg-white/[0.06] border border-white/10 px-2 py-0.5 text-slate-300">{workshop.status}</span>
                    <span className="text-cyan">{workshop.meetingProvider}</span>
                  </div>
                  
                  <h2 className="mt-3 line-clamp-1 font-display text-base font-bold text-white group-hover:text-violet transition-colors">
                    {workshop.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-400 leading-relaxed">
                    {workshop.description || 'Join this live interactive learning tournament.'}
                  </p>
                  
                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                    <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-violet" />Date: {new Date(workshop.startTime).toLocaleDateString()}</p>
                    <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-cyan" />Start: {new Date(workshop.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-mango" />Players: {workshop._count?.registrations ?? 0}/{workshop.maxAttendees ?? 'Unlimited'}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                  <span className="text-sm font-bold text-cyan">
                    {money(workshop.price, workshop.currency)}
                  </span>
                  <Button 
                    size="sm" 
                    className="rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold text-xs py-2 px-4 h-auto" 
                    disabled={registerWorkshop.isPending} 
                    onClick={() => register(workshop.id)}
                  >
                    {registerWorkshop.isPending ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
