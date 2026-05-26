'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanItem {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  cta: string;
  popular: boolean;
  accent: 'cyan' | 'violet' | 'mango';
  stats: {
    cpuLoad: string;
    xpMultiplier: string;
    bandwidth: string;
    meterVal: number; // percentage
  };
}

const plans: PlanItem[] = [
  {
    id: 'starter',
    name: 'Starter Cartridge',
    tagline: 'Boot up your creative career for free.',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      '1 Online Course module',
      '1 Public Chat Community',
      'Up to 50 active students',
      'Basic metric analytics',
      'Watermarked checkout console',
    ],
    cta: 'BOOT FOR FREE',
    popular: false,
    accent: 'cyan',
    stats: {
      cpuLoad: '15% LOAD',
      xpMultiplier: '1.0x XP',
      bandwidth: '10 GB/MO',
      meterVal: 20,
    },
  },
  {
    id: 'pro',
    name: 'Creator Chip Pro',
    tagline: 'Hype edition for professional creators.',
    priceMonthly: 29,
    priceAnnual: 23,
    features: [
      'Unlimited Courses & Modules',
      '3 Dedicated Communities',
      'Unlimited student enrollment',
      'Advanced predictive analytics',
      'AI course outline generator',
      'AI Tutor Agent (100 runs/mo)',
      'Custom vanity domain (.cv)',
      'Zero platform watermarks',
      'Priority live console support',
    ],
    cta: 'PLUG IN PRO',
    popular: true,
    accent: 'violet',
    stats: {
      cpuLoad: '68% HYPERCLOCK',
      xpMultiplier: '3.5x XP BOOST',
      bandwidth: '100 GB/MO',
      meterVal: 70,
    },
  },
  {
    id: 'business',
    name: 'Ultra MegaDrive',
    tagline: 'Maximum power for networks and schools.',
    priceMonthly: 79,
    priceAnnual: 63,
    features: [
      'Everything inside Pro',
      'Unlimited Communities',
      'Infinite AI Tutor runs',
      'Creator Affiliate network',
      'White-label portal layout',
      'Full developer API & Webhooks',
      'Collaborative team logins',
      'Direct account producer',
    ],
    cta: 'BOOT MEGADRIVE',
    popular: false,
    accent: 'mango',
    stats: {
      cpuLoad: '100% OVERDRIVE',
      xpMultiplier: '10.0x GOD MODE',
      bandwidth: 'UNLIMITED HITS',
      meterVal: 100,
    },
  },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  dx: number;
  dy: number;
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Fun custom neon confetti trigger
  const triggerConfetti = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsAnnual(!isAnnual);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const colors = ['#FF00B8', '#00E4FF', '#A6FF00', '#FFE600'];
    const newParticles: Particle[] = Array.from({ length: 40 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      return {
        id: Date.now() + i,
        x: x - window.scrollX,
        y: y - window.scrollY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 8,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 2, // Drift slightly up
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Cleanup particles
    setTimeout(() => {
      setParticles((prev) => prev.slice(40));
    }, 1500);
  };

  const borderColors = {
    cyan: 'border-cyan hover:border-cyan-300 shadow-neon-cyan',
    violet: 'border-violet hover:border-violet-300 shadow-neon-magenta',
    mango: 'border-mango hover:border-mango-300 shadow-neon-green',
  };

  const textColors = {
    cyan: 'text-cyan',
    violet: 'text-violet',
    mango: 'text-mango',
  };

  const bgColors = {
    cyan: 'bg-cyan/10',
    violet: 'bg-violet/10',
    mango: 'bg-mango/10',
  };

  return (
    <section id="pricing" className="relative overflow-hidden border-t-4 border-border bg-snow py-20 dark:bg-midnight sm:py-28">
      {/* Visual neon grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.03] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] dark:opacity-[0.02]" />

      {/* Renders Confetti Particles in absolute window coords */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            animate={{
              x: p.x + p.dx * 30,
              y: p.y + p.dy * 30 + 150, // simulated gravity
              opacity: 0,
              scale: 0.2,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute rounded-sm"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="inline-block rounded-md border-2 border-border bg-violet px-3 py-1 font-retro text-sm font-bold text-white shadow-[-2px_2px_0px_rgba(28,28,28,1)]">
            INSERT COINS TO START
          </span>
          <h2 className="mt-6 font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-6xl leading-none">
            CHOOSE YOUR PLAYSTYLE
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-muted-foreground">
            No long term contracts. Power up or downgrade modules instantly. Save more when feeding the console for a full year.
          </p>

          {/* Billing Toggle (Hyper Retro Style) */}
          <div className="mt-10 inline-flex items-center gap-4 rounded-xl border-3 border-border bg-card p-2 shadow-[-3px_3px_0px_rgba(28,28,28,1)] dark:bg-midnight-soft">
            <span className={`font-retro text-sm font-black transition-all ${!isAnnual ? 'text-violet scale-105' : 'text-muted-foreground'}`}>
              MONTHLY MODE
            </span>
            <button
              onClick={triggerConfetti}
              className={`relative h-8 w-16 cursor-pointer rounded-lg border-2 border-border transition-colors ${
                isAnnual ? 'bg-mango' : 'bg-violet'
              } shadow-inner`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute top-0.5 left-0.5 h-5 w-7 rounded border border-border bg-white shadow-sm"
                style={{ x: isAnnual ? 30 : 0 }}
              />
            </button>
            <span className={`flex items-center gap-1.5 font-retro text-sm font-black transition-all ${isAnnual ? 'text-mango scale-105' : 'text-muted-foreground'}`}>
              ANNUAL MODE
              <span className="rounded bg-mango border border-border px-1.5 py-0.5 text-[10px] font-bold text-border">
                -20% SAVE
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const bColor = borderColors[plan.accent];
            const tColor = textColors[plan.accent];
            const bgColor = bgColors[plan.accent];
            const hoverRotate = index % 2 === 0 ? 'hover:rotate-[0.5deg]' : 'hover:rotate-[-0.5deg]';

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative flex flex-col justify-between rounded-2xl border-3 border-border bg-card p-8 shadow-[-6px_6px_0px_0px_rgba(28,28,28,1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[-10px_10px_0px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised ${bColor} ${hoverRotate} ${
                  plan.popular ? 'lg:-translate-y-4 lg:hover:-translate-y-6 lg:border-violet shadow-neon-magenta' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded border-2 border-border bg-violet px-4 py-1 font-retro text-xs font-black text-white shadow-[-2px_2px_0px_rgba(28,28,28,1)] animate-bounce">
                    ★ HYPE EDITION ★
                  </div>
                )}

                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between border-b border-border/20 pb-4">
                    <span className="font-retro text-xs tracking-widest text-muted-foreground uppercase">
                      SLOT {index + 1} // PLAN
                    </span>
                    <span className={`font-retro text-xs font-bold ${tColor}`}>
                      {plan.stats.cpuLoad}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-black text-foreground uppercase">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    {plan.tagline}
                  </p>

                  {/* Pricing Info */}
                  <div className="mt-6 rounded-lg border-2 border-border bg-snow-soft p-4 shadow-inner dark:bg-midnight-soft relative overflow-hidden">
                    <div className="flex items-baseline gap-1">
                      <span className="font-retro text-2xl text-foreground font-black">$</span>
                      <span className="font-display text-5xl font-black text-foreground tracking-tight">
                        {price}
                      </span>
                      <span className="font-retro text-sm text-muted-foreground uppercase font-black">
                        {price === 0 ? '' : isAnnual ? '/ MO (ANNUAL)' : '/ MO'}
                      </span>
                    </div>
                    {isAnnual && price > 0 && (
                      <p className="mt-1 font-retro text-xs font-bold text-success">
                        BILLING ${price * 12} COINS PER YEAR
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Status Metrics */}
                <div className="my-6 rounded-lg border border-border/40 bg-midnight/5 p-3 dark:bg-midnight/35">
                  <div className="flex items-center justify-between font-retro text-[10px] text-muted-foreground">
                    <span>METER: XP ACCEL</span>
                    <span className={`font-bold ${tColor}`}>{plan.stats.xpMultiplier}</span>
                  </div>
                  {/* Status healthbar */}
                  <div className="mt-1.5 h-2 w-full rounded border border-border bg-midnight p-0.5">
                    <div
                      className={`h-full rounded-sm ${plan.accent === 'violet' ? 'bg-violet' : plan.accent === 'cyan' ? 'bg-cyan' : 'bg-mango'}`}
                      style={{ width: `${plan.stats.meterVal}%` }}
                    />
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="flex-grow">
                  <p className="font-retro text-xs font-black text-foreground uppercase border-b border-border/20 pb-2 mb-3">
                    INCLUDED PLUGINS
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded border border-border shadow-[-1px_1px_0px_rgba(28,28,28,1)] ${bgColor}`}>
                          <Check className={`h-3 w-3 ${tColor}`} />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="mt-8 border-t border-border/20 pt-6">
                  <Link href={`/checkout/plan/${plan.id}`} className="block">
                    <Button
                      className={`w-full py-6 font-display font-black text-md tracking-wider border-2 border-border shadow-[-3px_3px_0px_rgba(28,28,28,1)] active:translate-y-[3px] active:-translate-x-[3px] active:shadow-none hover:shadow-[-5px_5px_0px_rgba(28,28,28,1)] hover:-translate-y-1 transition-all ${
                        plan.popular
                          ? 'bg-violet text-white hover:bg-violet-600'
                          : 'bg-white text-border hover:bg-zinc-100 dark:bg-midnight dark:text-foreground dark:hover:bg-midnight-soft'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-center font-retro text-[10px] text-muted-foreground font-black uppercase">
                    <Zap className="h-3 w-3 text-mango animate-pulse" /> INSTANT PROVISIONING ACTIVATED
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}