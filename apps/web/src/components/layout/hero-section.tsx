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
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-violet" />
            Creatorverse Platform — Let&apos;s Build
          </div>

          {/* Headline */}
          <h1 className="mt-7 max-w-2xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.35rem] xl:text-[4.25rem]">
            Turn Your Creativity into{' '}
            <span className="inline-block text-gradient-hero">Chaos & Cash!</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            A premium operating space where creators launch real businesses while having pure fun.
            Build courses, host workshops, lock in memberships, and level up your community.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-400">
            <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5">Launch in hours, not weeks</span>
            <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5">AI built into every workflow</span>
            <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5">Courses, workshops, community, checkout</span>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <Link href="/onboarding">
              <Button variant="gradient" size="lg" className="w-full gap-2.5 text-base sm:w-auto">
                Build Your Universe
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="w-full gap-2.5 sm:w-auto">
                <Play className="h-3.5 w-3.5 fill-current text-cyan" />
                Watch My Story
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">No credit card required. Start free and upgrade when your audience grows.</p>

          {/* Trust badges */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-success/10 bg-success/5 p-4.5">
              <div className="flex items-center gap-2 text-success">
                <Shield className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Free Start</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Boot the platform with full creator essentials and zero upfront friction.</p>
            </div>
            <div className="rounded-2xl border border-cyan/10 bg-cyan/5 p-4.5">
              <div className="flex items-center gap-2 text-cyan">
                <Users className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">10K+ Creators</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Built for course sellers, workshop hosts, coaches, and community brands.</p>
            </div>
            <div className="rounded-2xl border border-violet/15 bg-violet/5 p-4.5">
              <div className="flex items-center gap-2 text-violet-300">
                <Star className="h-4 w-4 text-violet" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Rated 4.9/5</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">A playful workflow on the surface with serious monetization power underneath.</p>
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
          {/* Main dashboard card with subtle ambient glow */}
          <div className="relative rounded-2xl border border-white/10 bg-midnight-raised/60 p-1.5 shadow-2xl backdrop-blur-2xl overflow-hidden">
            {/* Ambient Background Glow inside the card */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-cyan/15 blur-2xl pointer-events-none" />

            <div className="rounded-xl border border-white/5 bg-midnight-soft/40 p-4 sm:p-5">
              {/* Dashboard header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-violet">✦ CREATOR DECK v2.0 ✦</p>
                  <p className="mt-1 text-sm font-extrabold text-white tracking-tight">COMMAND CENTER</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/15 px-3 py-1 font-mono text-xs font-medium text-success">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Stats row with interactive hover */}
              <div className="grid grid-cols-3 gap-3.5 pt-4">
                {dashStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2, borderColor: 'rgba(255, 255, 255, 0.12)', backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all duration-200"
                  >
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{stat.label}</p>
                    <p className="mt-1.5 font-display text-xl font-black text-white">{stat.value}</p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-cyan">{stat.change}</p>
                  </motion.div>
                ))}
              </div>

              {/* Pipeline with clean hover cards */}
              <div className="pt-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="mb-3.5 flex items-center justify-between">
                    <p className="text-xs font-extrabold text-white uppercase tracking-wider">Launch Pipeline</p>
                    <span className="font-mono text-[11px] font-bold text-mango">3/4 COMPLETED</span>
                  </div>
                  <div className="space-y-2">
                    {pipeline.map((item, idx) => (
                      <motion.div
                        key={item.label}
                        whileHover={{ x: 4, borderColor: 'rgba(168, 85, 247, 0.4)' }}
                        className="flex items-center justify-between rounded-lg bg-midnight/60 border border-white/5 px-3 py-2.5 transition-all duration-200"
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
                          <div className="h-4 w-4 rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-success" />
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
              <div className="mt-4 rounded-xl border border-violet/20 bg-gradient-to-r from-violet/10 to-cyan/5 p-3.5 shadow-sm">
                <p className="font-mono text-xs font-bold text-violet flex items-center gap-1">✦ AI RECOMMENDATION</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  Your workshop replay has a <strong className="text-white">92% completion rate</strong>. Convert it to a mini-course for a quick engagement boost and sales!
                </p>
              </div>
            </div>
          </div>

          {/* ── Floating notification cards ── */}
          <div className="absolute -right-3 top-14 z-20 hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNotif}
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-dark rounded-xl border border-white/10 px-4 py-3 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = notifications[activeNotif].icon;
                    return (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/20">
                        <Icon className={`h-4 w-4 ${notifications[activeNotif].color}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-xs font-extrabold text-white uppercase tracking-tight">{notifications[activeNotif].text}</p>
                    <p className="font-mono text-xs text-cyan">{notifications[activeNotif].detail}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Second floating card */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 bottom-16 z-20 hidden lg:block"
          >
            <div className="glass-dark rounded-xl border border-white/10 px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 border border-success/20">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white uppercase">REVENUE BOOM</p>
                  <p className="font-mono text-xs text-success">UP 42% THIS WEEK</p>
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
