'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  MonitorPlay,
  MessageSquare,
  CreditCard,
  Bot,
  BarChart3,
  Play,
  Pause,
  ChevronRight,
  Disc,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MixtapeTrack {
  id: string;
  trackNum: string;
  icon: any;
  title: string;
  body: string;
  accent: 'violet' | 'cyan' | 'mango';
  specs: {
    runtime: string;
    bitrate: string;
    hypeIndex: string;
    sampleRate: string;
  };
}

const tracks: MixtapeTrack[] = [
  {
    id: 'courses',
    trackNum: 'A-01',
    icon: GraduationCap,
    title: 'Courses Module',
    body: 'Load up interactive lesson content, pop quizzes, streaks tracking, and automated custom-certificate minting programs.',
    accent: 'violet',
    specs: { runtime: '04:20 MIN', bitrate: '320 KBPS', hypeIndex: '95% RAD', sampleRate: '48.0 KHZ' },
  },
  {
    id: 'workshops',
    trackNum: 'A-02',
    icon: MonitorPlay,
    title: 'Workshops Broadcast',
    body: 'Launch live creator streams, custom chat boxes, interactive Q&A dashboards, and auto-generated replay sales hubs.',
    accent: 'cyan',
    specs: { runtime: '03:45 MIN', bitrate: '256 KBPS', hypeIndex: '99% RAD', sampleRate: '44.1 KHZ' },
  },
  {
    id: 'communities',
    trackNum: 'A-03',
    icon: MessageSquare,
    title: 'Hype Communities',
    body: 'Host sub-channels, threads, image polls, and customized custom-XP roles to keep users grinding daily.',
    accent: 'mango',
    specs: { runtime: '05:12 MIN', bitrate: '320 KBPS', hypeIndex: '92% RAD', sampleRate: '48.0 KHZ' },
  },
  {
    id: 'monetization',
    trackNum: 'B-01',
    icon: CreditCard,
    title: 'Checkout Matrix',
    body: 'Zero-friction Stripe integrations, automated checkout flips, discount coupon engines, and recurring subscription logs.',
    accent: 'violet',
    specs: { runtime: '02:50 MIN', bitrate: '320 KBPS', hypeIndex: '94% RAD', sampleRate: '48.0 KHZ' },
  },
  {
    id: 'ai-studio',
    trackNum: 'B-02',
    icon: Bot,
    title: 'AI Studio Core',
    body: 'Unlock AI content outlines, landing-copy generators, automated prompt responders, and RAG tutor agents.',
    accent: 'cyan',
    specs: { runtime: '06:10 MIN', bitrate: '512 KBPS', hypeIndex: '98% RAD', sampleRate: '96.0 KHZ' },
  },
  {
    id: 'analytics',
    trackNum: 'B-03',
    icon: BarChart3,
    title: 'Analytics Console',
    body: 'Observe retention analytics, enrollment drop-offs, churn forecasts, and automated suggestions for max viral yield.',
    accent: 'mango',
    specs: { runtime: '03:15 MIN', bitrate: '256 KBPS', hypeIndex: '89% RAD', sampleRate: '44.1 KHZ' },
  },
];

export default function FeaturesPage() {
  const [activeTrack, setActiveTrack] = useState<MixtapeTrack>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const colors = {
    violet: {
      text: 'text-violet',
      border: 'border-violet shadow-neon-magenta',
      bg: 'bg-violet/10',
      fill: 'bg-violet',
    },
    cyan: {
      text: 'text-cyan',
      border: 'border-cyan shadow-neon-cyan',
      bg: 'bg-cyan/10',
      fill: 'bg-cyan',
    },
    mango: {
      text: 'text-mango',
      border: 'border-mango shadow-neon-green',
      bg: 'bg-mango/10',
      fill: 'bg-mango',
    },
  };

  const currentColors = colors[activeTrack.accent];

  return (
    <main className="min-h-screen relative overflow-hidden bg-snow py-12 px-4 dark:bg-midnight text-foreground">
      {/* Neo Y2K Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(28,28,28,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(28,28,28,0.04)_1px,transparent_1px)] bg-[size:30px_30px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <div className="mx-auto max-w-7xl relative z-10 space-y-10">
        {/* Navigation Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-block rounded border-2 border-border bg-card px-3 py-1 font-display font-black text-md shadow-[-3px_3px_0px_rgba(28,28,28,1)] dark:bg-midnight-soft hover:-translate-y-0.5 transition-all">
            ← BACK TO HUB
          </Link>
          <span className="font-retro text-md font-bold text-muted-foreground">
            CREATORVERSE // PLATFORM MIXTAPE
          </span>
        </div>

        {/* Hero title */}
        <section className="max-w-3xl">
          <span className="inline-block rounded border-2 border-border bg-violet px-3 py-1 font-retro text-sm font-bold text-white shadow-[-2px_2px_0px_rgba(28,28,28,1)]">
            PLUGINS INTERACTIVE OVERVIEW
          </span>
          <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight sm:text-6xl leading-none">
            A COMPLETE CREATOR{' '}
            <span className="text-transparent bg-clip-text gradient-hero font-extrabold">
              MIX STATION
            </span>
          </h1>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-muted-foreground">
            Browse our core modules like individual retro cassettes. Insert a track into the walkman player console to boot its system diagnostics, visualizer, and technical files.
          </p>
        </section>

        {/* Walkman + Mixtape list split */}
        <div className="grid gap-8 lg:grid-cols-12 mt-12">
          {/* Track playlist (left side) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-retro text-xs font-black text-muted-foreground uppercase tracking-widest pl-2">
              CASSETTE DECK PLAYLIST // TRACKS
            </h3>
            <div className="space-y-3">
              {tracks.map((track) => {
                const isActive = track.id === activeTrack.id;
                const activeC = colors[track.accent];

                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setActiveTrack(track);
                      setIsPlaying(true);
                    }}
                    className={`relative flex items-center justify-between rounded-xl border-3 border-border bg-card p-4 cursor-pointer shadow-[-3px_3px_0px_rgba(28,28,28,1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_5px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised ${
                      isActive ? activeC.border + ' bg-card-raised -translate-y-0.5' : 'hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Track number badge */}
                      <span className={`font-retro text-sm font-black rounded border-2 border-border px-2 py-0.5 ${isActive ? activeC.bg + ' ' + activeC.text : 'bg-zinc-100 text-muted-foreground dark:bg-midnight-soft'}`}>
                        {track.trackNum}
                      </span>
                      {/* Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded border-2 border-border shadow-[-1.5px_1.5px_0px_rgba(28,28,28,1)] ${isActive ? activeC.bg + ' ' + activeC.text + ' border-' + track.accent : 'bg-transparent border-border'}`}>
                        <track.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg font-black text-foreground uppercase">
                          {track.title}
                        </h4>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground line-clamp-1 max-w-[280px] sm:max-w-[400px]">
                          {track.body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-retro text-xs font-bold text-muted-foreground">
                      <span>{track.specs.runtime}</span>
                      <ChevronRight className={`h-5 w-5 ${isActive ? activeC.text : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Futuristic Walkman Player (right side) */}
          <div className="lg:col-span-5">
            <div className={`sticky top-8 rounded-2xl border-4 border-border bg-midnight p-6 shadow-[-10px_10px_0px_rgba(28,28,28,1)] shadow-crt relative overflow-hidden transition-all duration-300 ${currentColors.border}`}>
              {/* CRT Scanline layer */}
              <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />

              {/* Walkman casing elements */}
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-white/[0.08] to-transparent pointer-events-none" />

              {/* Top Panel LCD Screen */}
              <div className="rounded-lg border-2 border-border bg-[#0D0A14] p-4 text-foreground relative overflow-hidden">
                <div className="absolute top-1 right-2 flex items-center gap-1.5 font-retro text-[9px] text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'animate-ping bg-success' : 'bg-zinc-500'}`}></span>
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-success' : 'bg-zinc-500'}`}></span>
                  </span>
                  <span>{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                </div>

                <div className="font-retro text-[10px] text-muted-foreground tracking-widest uppercase">
                  ACTIVE CASSETTE DECK // SLOT A
                </div>

                {/* Cassette Title */}
                <h3 className={`mt-2 font-display text-2xl font-black uppercase tracking-tight ${currentColors.text} truncate`}>
                  {activeTrack.title}
                </h3>

                {/* Spec metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-b border-border/20 py-2.5 font-mono text-[9px] text-zinc-300">
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase">TRACK ID:</span> {activeTrack.trackNum}
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase">SPEED:</span> {activeTrack.specs.bitrate}
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase">INDEX:</span> {activeTrack.specs.hypeIndex}
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold uppercase">SAMPLE:</span> {activeTrack.specs.sampleRate}
                  </div>
                </div>

                {/* Dynamic waveform visualizer */}
                <div className="mt-4 flex items-end justify-between h-8 px-2 bg-midnight/80 rounded border border-border/40 overflow-hidden">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const duration = 0.5 + Math.random() * 0.8;
                    const delay = Math.random() * 0.5;

                    return (
                      <motion.div
                        key={i}
                        animate={isPlaying ? {
                          height: ['15%', '100%', '30%', '85%', '15%'],
                        } : { height: '15%' }}
                        transition={{
                          duration: duration,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut',
                          delay: delay,
                        }}
                        className={`w-1.5 rounded-t-sm ${currentColors.fill}`}
                        style={{ height: '15%' }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Physical cassette layout with window view */}
              <div className="mt-6 rounded-lg border-3 border-border bg-[#171321] p-4 relative shadow-inner">
                {/* Reels cassette tape mockup */}
                <div className="flex items-center justify-between border-2 border-border bg-[#0C0913] rounded-md py-4 px-8 relative overflow-hidden h-24 shadow-inner">
                  {/* Cassette sticker label */}
                  <div className="absolute inset-x-4 top-2 h-4 bg-gradient-to-r from-violet to-cyan opacity-80 border-b border-border text-[8px] font-retro font-bold text-center text-white py-0.5">
                    CREATORVERSE Y2K MIX SYSTEM
                  </div>

                  {/* Left reel */}
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-3 border-zinc-700 bg-zinc-900 border-dashed"
                  >
                    <div className="h-4 w-4 rounded-full bg-border" />
                  </motion.div>

                  {/* Window tape visual */}
                  <div className="h-6 w-16 border border-zinc-700 bg-[#252033]/60 rounded-sm flex items-center justify-center p-0.5 shadow-inner">
                    <div className="h-2 w-full bg-zinc-900 rounded-sm relative overflow-hidden">
                      <motion.div
                        animate={isPlaying ? { x: ['-100%', '100%'] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-zinc-600 to-transparent"
                      />
                    </div>
                  </div>

                  {/* Right reel */}
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-3 border-zinc-700 bg-zinc-900 border-dashed"
                  >
                    <div className="h-4 w-4 rounded-full bg-border" />
                  </motion.div>
                </div>
              </div>

              {/* walkman physical deck buttons */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/20 pt-5">
                <div className="flex gap-2">
                  {/* PLAY/PAUSE */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 border-border bg-white text-midnight shadow-[-2.5px_2.5px_0px_rgba(28,28,28,1)] transition-all cursor-pointer ${
                      isPlaying ? 'bg-mango text-border border-mango' : 'hover:bg-zinc-100 active:translate-y-[2.5px] active:-translate-x-[2.5px] active:shadow-none'
                    }`}
                  >
                    {isPlaying ? <Pause className="h-5 w-5 stroke-[3px]" /> : <Play className="h-5 w-5 stroke-[3px] fill-current" />}
                  </button>

                  {/* MUTE */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-border bg-white text-midnight shadow-[-2.5px_2.5px_0px_rgba(28,28,28,1)] transition-all hover:bg-zinc-100 active:translate-y-[2.5px] active:-translate-x-[2.5px] active:shadow-none cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5 stroke-[3px]" /> : <Volume2 className="h-5 w-5 stroke-[3px]" />}
                  </button>
                </div>

                {/* Direct CTA inside Walkman */}
                <Link href={`/checkout/plan/pro`} className="flex-grow">
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 font-display font-black text-sm uppercase tracking-wider rounded-lg border-2 border-border bg-mango text-border shadow-[-2.5px_2.5px_0px_rgba(28,28,28,1)] transition-all hover:bg-mango-600 hover:-translate-y-0.5 active:translate-y-[2.5px] active:-translate-x-[2.5px] active:shadow-none cursor-pointer">
                    LOAD THIS PLUGIN
                  </button>
                </Link>
              </div>

              {/* Track text descriptive files */}
              <div className="mt-5 rounded border border-border/30 bg-[#0C0913] p-3">
                <div className="font-retro text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
                  SPECS://EXPLAIN_FILE.log
                </div>
                <p className="font-sans text-xs font-semibold leading-relaxed text-zinc-300">
                  {activeTrack.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

