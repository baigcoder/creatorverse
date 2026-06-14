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
    cyan: 'border-cyan/20 hover:border-cyan/40',
    violet: 'border-violet/20 hover:border-violet/40',
    mango: 'border-mango/20 hover:border-mango/45',
  };

  const textColors = {
    cyan: 'text-cyan-300',
    violet: 'text-violet-300',
    mango: 'text-mango-300',
  };

  const bgColors = {
    cyan: 'bg-cyan/10',
    violet: 'bg-violet/10',
    mango: 'bg-mango/10',
  };

  return (
    <section id="pricing" className="relative overflow-hidden border-t border-white/5 bg-midnight py-20 sm:py-28">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />

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
          <span className="inline-block rounded-full border border-violet/30 bg-violet/15 px-4 py-1.5 font-mono text-[10px] font-bold tracking-wider text-violet-300">
            PRICING OPTIONS
          </span>
          <h2 className="mt-6 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl leading-none">
            CHOOSE YOUR PLAYSTYLE
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-slate-300">
            No long term contracts. Upgrade or downgrade modules instantly. Save 20% with annual plans.
          </p>

          {/* Billing Toggle (Sleek Switch Style) */}
          <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-lg">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                !isAnnual ? 'bg-violet text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={(e) => triggerConfetti(e)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                isAnnual ? 'bg-mango text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ANNUAL
              <span className={`rounded-full border border-black/10 bg-black/10 px-1.5 py-0.5 text-[9px] font-black ${isAnnual ? 'text-black' : 'text-mango'}`}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            const bColor = borderColors[plan.accent];
            const tColor = textColors[plan.accent];
            const bgColor = bgColors[plan.accent];

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#140C20]/40 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${bColor} ${
                  plan.popular ? 'lg:-translate-y-4 lg:hover:-translate-y-5 lg:border-violet/40' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border border-violet/20 bg-violet px-4 py-1.5 font-mono text-[9px] font-black text-black tracking-widest shadow-md">
                    ★ POPULAR ★
                  </div>
                )}

                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                      SLOT {index + 1} // PLAN
                    </span>
                    <span className={`font-mono text-[10px] font-bold ${tColor}`}>
                      {plan.stats.cpuLoad}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-black text-white uppercase">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-400">
                    {plan.tagline}
                  </p>

                  {/* Pricing Info */}
                  <div className="mt-6 rounded-xl border border-white/5 bg-midnight/45 p-4 shadow-inner">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-2xl text-white font-bold">$</span>
                      <span className="font-display text-5xl font-black text-white tracking-tight">
                        {price}
                      </span>
                      <span className="font-mono text-xs text-slate-400 uppercase font-semibold">
                        {price === 0 ? '' : isAnnual ? '/ mo (billed annually)' : '/ mo'}
                      </span>
                    </div>
                    {isAnnual && price > 0 && (
                      <p className="mt-1.5 font-mono text-[10px] font-bold text-success">
                        BILLING ${price * 12} COINS PER YEAR
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Status Metrics */}
                <div className="my-6 rounded-xl border border-white/5 bg-midnight/35 p-3">
                  <div className="flex items-center justify-between font-mono text-[9px] text-slate-400">
                    <span>METER: XP ACCEL</span>
                    <span className={`font-bold ${tColor}`}>{plan.stats.xpMultiplier}</span>
                  </div>
                  {/* Status healthbar */}
                  <div className="mt-1.5 h-2 w-full rounded-full border border-white/5 bg-midnight p-0.5">
                    <div
                      className={`h-full rounded-full ${plan.accent === 'violet' ? 'bg-violet' : plan.accent === 'cyan' ? 'bg-cyan' : 'bg-mango'}`}
                      style={{ width: `${plan.stats.meterVal}%` }}
                    />
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="flex-grow">
                  <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">
                    INCLUDED PLUGINS
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-lg border border-white/10 ${bgColor}`}>
                          <Check className={`h-3 w-3 ${tColor}`} />
                        </div>
                        <span className="text-sm font-semibold text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="mt-8 border-t border-white/5 pt-6">
                  <Link href={`/checkout/plan/${plan.id}`} className="block">
                    <Button
                      className={`w-full py-6 font-display font-black text-md tracking-wider transition-all duration-200 active:scale-[0.98] ${
                        plan.popular
                          ? 'bg-violet hover:bg-violet/90 text-white rounded-xl shadow-[0_4px_16px_rgba(255,0,184,0.3)]'
                          : 'bg-midnight-raised hover:bg-midnight-soft text-white rounded-xl border border-white/10'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-center font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wider">
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