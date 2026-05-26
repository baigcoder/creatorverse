'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Play,
  TrendingUp,
  Users,
  BookOpen,
  Radio,
  MessageSquare,
  Award,
  DollarSign,
  Star,
  Zap,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Animated notification cards ────────────────────────────── */
const notifications = [
  { icon: Users, text: 'New member joined!', detail: '+1 student', color: 'text-cyan' },
  { icon: DollarSign, text: 'Course sold!', detail: '₹2,499', color: 'text-success' },
  { icon: Radio, text: 'Workshop starting', detail: 'in 5 min', color: 'text-coral' },
  { icon: Award, text: 'Certificate issued', detail: 'to Priya S.', color: 'text-mango' },
];

/* ── Dashboard stats ────────────────────────────────────────── */
const dashStats = [
  { label: 'Revenue', value: '₹12.4K', change: '+18%' },
  { label: 'Students', value: '847', change: '+12%' },
  { label: 'Rating', value: '4.9★', change: '+0.2' },
];

/* ── Pipeline items ─────────────────────────────────────────── */
const pipeline = [
  { icon: BookOpen, label: 'Course Builder', value: 'AI outline ready', done: true },
  { icon: Radio, label: 'Live Workshop', value: '436 registered', done: true },
  { icon: Users, label: 'Community', value: '82% active', done: true },
  { icon: MessageSquare, label: 'Broadcasts', value: '3 scheduled', done: false },
];

export function HeroSection() {
  const [activeNotif, setActiveNotif] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNotif((prev) => (prev + 1) % notifications.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative overflow-hidden bg-midnight py-14 scroll-mt-24 sm:py-20 lg:py-24">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-midnight" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Decorative orbs */}
      <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-violet/10 blur-[100px]" />
      <div className="absolute -right-32 bottom-1/4 h-64 w-64 rounded-full bg-coral/10 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        {/* ── Left: Copy ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          {/* Overline badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet/40 bg-violet/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-violet shadow-flat-sm">
            <Zap className="h-3.5 w-3.5" />
            Creatorverse Y2K — Let&apos;s Play!
          </div>

          {/* Headline */}
          <h1 className="mt-7 max-w-2xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.35rem] xl:text-[4.25rem]">
            Turn Your Creativity into{' '}
            <span className="inline-block text-gradient-hero">Chaos & Cash!</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            A futuristic arcade where creators build real businesses while having pure fun.
            Launch courses, host workshops, lock in memberships, and level up your community.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Launch in hours, not weeks</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">AI built into every workflow</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">Courses, workshops, community, checkout</span>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/onboarding">
              <Button variant="gradient" size="xl" className="w-full gap-2.5 text-base shadow-neon-magenta transition-transform duration-200 hover:scale-[1.02] sm:w-auto">
                Build Your Universe
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="xl" className="w-full gap-2.5 border-cyan text-cyan transition-transform duration-200 hover:bg-cyan/10 hover:shadow-neon-cyan sm:w-auto">
                <Play className="h-4 w-4" />
                Watch My Story
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">No credit card required. Start free and upgrade when your audience grows.</p>

          {/* Trust badges */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-success/20 bg-success/5 p-4">
              <div className="flex items-center gap-2 text-success">
                <Shield className="h-4 w-4" />
                <span className="font-retro text-sm uppercase tracking-[0.2em]">Free Start</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">Boot the platform with full creator essentials and zero upfront friction.</p>
            </div>
            <div className="rounded-2xl border border-cyan/20 bg-cyan/5 p-4">
              <div className="flex items-center gap-2 text-cyan">
                <Users className="h-4 w-4" />
                <span className="font-retro text-sm uppercase tracking-[0.2em]">10K+ Creators</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">Built for course sellers, workshop hosts, coaches, and community-led brands.</p>
            </div>
            <div className="rounded-2xl border border-violet/20 bg-violet/5 p-4">
              <div className="flex items-center gap-2 text-violet">
                <Star className="h-4 w-4" />
                <span className="font-retro text-sm uppercase tracking-[0.2em]">Rated 4.9/5</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">A playful workflow on the surface with serious monetization power underneath.</p>
            </div>
          </div>
        </motion.div>

        {/* ── Right: Dashboard Preview ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="relative"
        >
          {/* Main dashboard card with CRT scanlines overlay */}
          <div className="relative rounded-2xl border-2 border-foreground bg-midnight-raised p-1 shadow-neon-magenta overflow-hidden">
            {/* CRT Screen Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-crt opacity-70 z-10" />

            <div className="rounded-[12px] border border-white/10 bg-midnight-soft/60 p-4">
              {/* Dashboard header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div>
                  <p className="font-retro text-lg tracking-wider text-violet animate-pulse">✦ COSMIC ARCADE CONSOLE ✦</p>
                  <p className="mt-0.5 text-xs font-bold text-white uppercase">CREATOR COMMAND CENTER</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-success bg-success/15 px-3 py-1 font-retro text-sm text-success">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Stats row with interactive hover and drag wobbles */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {dashStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    drag
                    dragConstraints={{ left: -10, right: 10, top: -10, bottom: 10 }}
                    whileDrag={{ scale: 1.05, rotate: [0, -3, 3, 0], transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    className="cursor-grab active:cursor-grabbing rounded-xl border border-white/15 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.08]"
                  >
                    <p className="text-[10px] uppercase font-bold text-slate-400">{stat.label}</p>
                    <p className="mt-1 font-display text-xl font-extrabold text-white">{stat.value}</p>
                    <p className="mt-0.5 font-retro text-sm text-cyan">{stat.change}</p>
                  </motion.div>
                ))}
              </div>

              {/* Pipeline with wobbling cards */}
              <div className="pt-4">
                <div className="rounded-xl border border-white/15 bg-white/[0.03] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-extrabold text-white uppercase tracking-wider">Launch Pipeline</p>
                    <span className="font-retro text-sm text-mango">3/4 LEVEL COMPLETE</span>
                  </div>
                  <div className="space-y-2">
                    {pipeline.map((item, idx) => (
                      <motion.div
                        key={item.label}
                        drag
                        dragConstraints={{ left: -5, right: 5, top: -5, bottom: 5 }}
                        whileDrag={{ rotate: 3 }}
                        whileHover={{ x: 3 }}
                        className="cursor-grab active:cursor-grabbing flex items-center justify-between rounded-lg bg-midnight/80 border border-white/5 hover:border-violet/40 px-3 py-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                            <item.icon className="h-3.5 w-3.5 text-violet" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-white">{item.label}</p>
                            <p className="text-[10px] text-slate-400">{item.value}</p>
                          </div>
                        </div>
                        {item.done ? (
                          <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center border border-foreground shadow-flat-sm">
                            <CheckCircle2 className="h-3 w-3 text-midnight" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-dashed border-slate-500 animate-spin" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Suggestion Bubble */}
              <div className="mt-4 rounded-xl border border-violet/30 bg-gradient-to-r from-violet/20 to-cyan/10 p-3 shadow-flat-sm">
                <p className="font-retro text-sm text-violet animate-pulse">✦ AI Recommendation</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Your workshop replay has a <strong className="text-white">92% completion rate</strong>. Convert it to a mini-course for a quick dopamine boost and massive sales!
                </p>
              </div>
            </div>
          </div>

          {/* ── Floating notification cards with haptic animation ── */}
          <div className="absolute -right-3 top-14 z-20 hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNotif}
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: [-2, 2, -1, 0] }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-dark rounded-xl border border-white/10 px-4 py-3 shadow-neon-cyan"
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = notifications[activeNotif].icon;
                    return (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/15 border border-cyan/30">
                        <Icon className={`h-4 w-4 ${notifications[activeNotif].color}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-xs font-extrabold text-white uppercase tracking-tight">{notifications[activeNotif].text}</p>
                    <p className="font-retro text-sm text-cyan">{notifications[activeNotif].detail}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Second floating card (wobbling) */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 bottom-16 z-20 hidden lg:block"
          >
            <div className="glass-dark rounded-xl border border-white/10 px-4 py-3 shadow-neon-green">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 border border-success/30">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white uppercase">REVENUE BOOM</p>
                  <p className="font-retro text-sm text-success">UP 42% THIS WEEK</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Social proof logo bar ─────────────────────────── */}
      <div className="mx-auto mt-14 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Trusted by creators from
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-50">
          {['YouTube', 'Instagram', 'LinkedIn', 'Twitter/X', 'Udemy'].map((name) => (
            <span key={name} className="font-display text-lg font-bold text-slate-300">{name}</span>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
