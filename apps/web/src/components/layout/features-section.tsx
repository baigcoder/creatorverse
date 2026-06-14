'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  Video,
  CreditCard,
  BarChart3,
  Globe,
  Award,
  Bot,
  Play,
  RotateCcw,
  Zap,
  Terminal,
} from 'lucide-react';

interface FeatureItem {
  icon: any;
  title: string;
  description: string;
  accent: 'violet' | 'cyan' | 'mango';
  span: string;
  moduleCode: string;
  backConsole: {
    status: string;
    terminalText: string;
    metricLabel: string;
    metricValue: string;
    health: number; // 0 to 100 for progress bar
  };
}

const features: FeatureItem[] = [
  {
    icon: BookOpen,
    title: 'Online Courses',
    description: 'Create rich courses with video, quizzes, assignments, and drip content. AI helps outline and script lessons.',
    accent: 'violet',
    span: 'lg:col-span-2',
    moduleCode: 'MOD-01',
    backConsole: {
      status: 'SYSTEM ACTIVE',
      terminalText: 'npx creatorverse run courses.sh --viral',
      metricLabel: 'ENROLLED CREATORS',
      metricValue: '12,489',
      health: 88,
    },
  },
  {
    icon: Video,
    title: 'Live Workshops',
    description: 'Host live sessions with registration, reminders, recording, and replay selling.',
    accent: 'cyan',
    span: '',
    moduleCode: 'MOD-02',
    backConsole: {
      status: 'BROADCASTING',
      terminalText: 'stream-bridge --bitrate=9000kbps',
      metricLabel: 'LIVE VIEWERS',
      metricValue: '1,420 / min',
      health: 95,
    },
  },
  {
    icon: Users,
    title: 'Paid Communities',
    description: 'Build thriving communities with channels, threads, polls, and gamification. Gate access with memberships.',
    accent: 'mango',
    span: '',
    moduleCode: 'MOD-03',
    backConsole: {
      status: 'STABLE',
      terminalText: 'discord-sync --channel=general --hype',
      metricLabel: 'ACTIVE CHATTERS',
      metricValue: '84% Hype',
      health: 92,
    },
  },
  {
    icon: CreditCard,
    title: 'Memberships',
    description: 'Recurring revenue with tiered memberships, one-time payments, coupons, and multi-gateway support.',
    accent: 'violet',
    span: '',
    moduleCode: 'MOD-04',
    backConsole: {
      status: 'MONEY MATRIX RUNNING',
      terminalText: 'stripe-listen --hooks=all --payouts=max',
      metricLabel: 'MONTHLY REVENUE',
      metricValue: '$42,069.69',
      health: 79,
    },
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Track revenue, enrollment, completion, churn. AI-powered recommendations to grow your business.',
    accent: 'cyan',
    span: '',
    moduleCode: 'MOD-05',
    backConsole: {
      status: 'CALCULATING',
      terminalText: 'ai-predict --timeframe=30d --cash',
      metricLabel: 'VIRAL MULTIPLIER',
      metricValue: '4.8x BOOST',
      health: 84,
    },
  },
  {
    icon: Award,
    title: 'Certificates & XP',
    description: 'Auto-issue branded certificates. Badges, streaks, and gamification leaderboards keep learners engaged.',
    accent: 'mango',
    span: 'lg:row-span-2',
    moduleCode: 'MOD-06',
    backConsole: {
      status: 'XP DISPENSING',
      terminalText: 'issue-nft-badge --rarity=legendary --owner=you',
      metricLabel: 'XP COLLECTED',
      metricValue: '9.8M XP',
      health: 99,
    },
  },
  {
    icon: Bot,
    title: 'AI Tutor Agent',
    description: 'RAG-powered AI that answers student questions from your course content with citations.',
    accent: 'violet',
    span: '',
    moduleCode: 'MOD-07',
    backConsole: {
      status: 'BRAIN ONLINE',
      terminalText: 'gemini-flash --rag --temp=0.4 --mode=smart',
      metricLabel: 'COGNITIVE RESPONSES',
      metricValue: '99.8% ACCURATE',
      health: 91,
    },
  },
  {
    icon: Globe,
    title: 'Creator Storefront',
    description: 'Your branded storefront with custom domain, SEO, social sharing, and embedded checkout.',
    accent: 'cyan',
    span: '',
    moduleCode: 'MOD-08',
    backConsole: {
      status: 'PORTAL OPEN',
      terminalText: 'dns-bind --domain=myuniverse.cv --ssl',
      metricLabel: 'PAGEVIEWS (24H)',
      metricValue: '254,190 HITS',
      health: 74,
    },
  },
];

const accentColors: Record<string, { border: string; glow: string; text: string; bg: string; badge: string }> = {
  violet: {
    border: 'border-violet/20 hover:border-violet/40',
    glow: 'rgba(255, 0, 184, 0.1)',
    text: 'text-violet-300',
    bg: 'bg-violet/5',
    badge: 'border-violet/20 bg-violet/10 text-violet-300',
  },
  cyan: {
    border: 'border-cyan/20 hover:border-cyan/40',
    glow: 'rgba(0, 228, 255, 0.1)',
    text: 'text-cyan-300',
    bg: 'bg-cyan/5',
    badge: 'border-cyan/20 bg-cyan/10 text-cyan-300',
  },
  mango: {
    border: 'border-mango/20 hover:border-mango/45',
    glow: 'rgba(166, 255, 0, 0.1)',
    text: 'text-mango-300',
    bg: 'bg-mango/5',
    badge: 'border-mango/20 bg-mango/10 text-mango-300',
  },
};

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const color = accentColors[feature.accent];

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className={`group relative h-[320px] w-full cursor-pointer perspective-1000 ${feature.span}`}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative h-full w-full transform-style-3d duration-500"
      >
        {/* CARD FRONT */}
        <div
          className={`absolute inset-0 flex flex-col justify-between backface-hidden rounded-2xl border border-white/10 bg-[#140C20]/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 ${color.border}`}
        >
          {/* Top Info Bar */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {feature.moduleCode}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${color.badge}`}>
              <Zap className="h-3 w-3 animate-pulse" /> Ready
            </span>
          </div>

          {/* Main Info */}
          <div>
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 ${color.bg} ${feature.accent === 'violet' ? 'border-violet/30' : feature.accent === 'cyan' ? 'border-cyan/30' : 'border-mango/30'}`}>
              <feature.icon className={`h-6 w-6 ${color.text}`} />
            </div>
            <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              {feature.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed text-slate-400">
              {feature.description}
            </p>
          </div>

          {/* Bottom Action Hint */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Click to boot console
            </span>
            <div className={`flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5`}>
              <Play className={`h-2.5 w-2.5 fill-current text-white translate-x-[0.5px]`} />
            </div>
          </div>
        </div>

        {/* CARD BACK (CONSOLE VIEW) */}
        <div
          className={`absolute inset-0 flex flex-col justify-between backface-hidden rotate-y-180 rounded-2xl border border-white/10 bg-[#1D152C]/65 p-5 text-foreground shadow-xl backdrop-blur-xl overflow-hidden ${color.border}`}
        >
          {/* Top Console Status Bar */}
          <div className="z-20 flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-mango" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                CONSOLE://{feature.moduleCode.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-success">
                {feature.backConsole.status}
              </span>
            </div>
          </div>

          {/* Console Output Code */}
          <div className="z-20 my-2 flex-grow rounded border border-white/5 bg-midnight p-2.5 font-mono text-[10px] text-zinc-300">
            <p className="text-zinc-500 font-semibold">// INITIALIZE BOOT SEQUENCE</p>
            <p className="mt-1 text-cyan">{feature.backConsole.terminalText}</p>
            <p className="mt-2 text-violet-300">&gt; LOADING MODULE CONTENT... OK</p>
            <p className="text-mango">&gt; METRIC RESOLVED: SUCCESS</p>
          </div>

          {/* Interactive Metric Box */}
          <div className="z-20 rounded-lg border border-white/5 bg-midnight/60 p-2.5">
            <div className="flex justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span>{feature.backConsole.metricLabel}</span>
              <span className={color.text}>{feature.backConsole.metricValue}</span>
            </div>
            {/* Clean Progress Bar */}
            <div className="mt-1.5 h-2.5 w-full rounded-full border border-white/5 bg-midnight p-0.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${feature.accent === 'violet' ? 'bg-violet' : feature.accent === 'cyan' ? 'bg-cyan' : 'bg-mango'} shadow-lg`}
                style={{ width: `${feature.backConsole.health}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[8px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <span>0% LOAD</span>
              <span>100% READY</span>
            </div>
          </div>

          {/* Bottom Flip Action */}
          <div className="z-20 flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span>Press to exit terminal</span>
            <span className="flex items-center gap-1 text-white">
              <RotateCcw className="h-3 w-3 text-mango animate-spin" /> BACK
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden border-b border-white/5 bg-midnight py-20 scroll-mt-24 sm:py-24">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full border border-mango/20 bg-mango/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-mango-300">
              SYSTEM CAPABILITIES
            </span>
            <h2 className="mt-6 font-display text-4xl font-black leading-none tracking-tight text-white sm:text-6xl uppercase">
              One Console.{' '}
              <span className="gradient-hero bg-clip-text text-transparent font-extrabold shadow-sm">
                Infinite Chaos.
              </span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-slate-300">
              Boot up the creator operating system. No corporate bloat, no boring spreadsheets, just one streamlined command center for publishing, teaching, selling, and retention.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Quick Readout</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm font-semibold text-white">Built for the full creator stack</p>
                  <p className="mt-1 text-sm text-slate-400">Courses, live sessions, communities, storefronts, and AI support in one surface.</p>
                </div>
                <span className="font-display text-2xl font-bold text-violet">08</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm font-semibold text-white">Interactive by design</p>
                  <p className="mt-1 text-sm text-slate-400">Flip any module to preview the console state and outcomes behind the feature.</p>
                </div>
                <span className="font-display text-2xl font-bold text-cyan">Live</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Cleaner hierarchy</p>
                  <p className="mt-1 text-sm text-slate-400">Focused cards, tighter spacing, and stronger contrast make scanning easier.</p>
                </div>
                <span className="font-display text-2xl font-bold text-mango-300">Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
