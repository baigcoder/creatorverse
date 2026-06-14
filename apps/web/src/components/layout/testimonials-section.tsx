'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Sparkles, Smile } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'UX Design Coach',
    initials: 'SC',
    content: 'CreatorVerse Y2K saved me 40+ hours on course building! The AI layout outline generator is a complete game-changer—I just key in a prompt and boot a full curriculum instantly.',
    rating: 5,
    revenue: '$18,400 earned',
    accent: 'violet',
    colorHex: '#FF00B8',
    hypeTag: '★ SPEEDRUN WR ★',
    tapeStyle: 'rotate-[4deg] bg-cyan/60',
  },
  {
    name: 'Marcus Johnson',
    role: 'Fitness Coach',
    initials: 'MJ',
    content: 'The arcade community rooms are insane! My active chat stats are through the roof. The built-in streaks & XP gamification keep them grinding daily. Retention jumped to 78%.',
    rating: 5,
    revenue: '$24,200 earned',
    accent: 'cyan',
    colorHex: '#00E4FF',
    hypeTag: '▲ 2.5X ENGAGEMENT ▲',
    tapeStyle: 'rotate-[-3deg] bg-mango/60',
  },
  {
    name: 'Priya Sharma',
    role: 'Career Advisor',
    initials: 'PS',
    content: 'I plugged out from Kajabi and Teachable, and booted up CreatorVerse. One central console for modules, live streaming, memberships, & checkout. The AI Agent answers 80% of DMs.',
    rating: 5,
    revenue: '$45,000 earned',
    accent: 'mango',
    colorHex: '#A6FF00',
    hypeTag: '♦ MONETIZED ♦',
    tapeStyle: 'rotate-[2deg] bg-violet/60',
  },
  {
    name: 'Alex Rivera',
    role: 'Growth Marketer',
    initials: 'AR',
    content: 'The diagnostics metrics charts sold me instantly. I can see exactly where students log off, and the pixel AI console drops suggestions. Graduation rates hit a solid 61%.',
    rating: 5,
    revenue: '$31,500 earned',
    accent: 'violet',
    colorHex: '#FF00B8',
    hypeTag: '✦ MAX YIELD ✦',
    tapeStyle: 'rotate-[-5deg] bg-cyan/60',
  },
];

export function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const colors: Record<string, string> = {
    violet: 'border-violet text-violet shadow-neon-magenta bg-violet/10',
    cyan: 'border-cyan text-cyan shadow-neon-cyan bg-cyan/10',
    mango: 'border-mango text-mango shadow-neon-green bg-mango/10',
  };

  const borderStyles: Record<string, string> = {
    violet: 'border-violet',
    cyan: 'border-cyan',
    mango: 'border-mango',
  };

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-midnight py-20 sm:py-28">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block rounded-full border border-cyan/20 bg-cyan/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              CREATOR REVIEWS
            </span>
            <h2 className="mt-6 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl leading-none">
              LOVED BY <span className="text-gradient-hero">10,000+</span> LEADING CREATORS
            </h2>
            <p className="mt-4 text-lg font-medium text-slate-300">
              See how modern creators consolidated their workflows and scaled their revenue with a clean, high-performance creator engine.
            </p>
          </div>

          {/* Carousel Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#140C20]/45 text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-white/5 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#140C20]/45 text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-white/5 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel Area */}
        <div className="mt-16 relative flex items-center justify-center min-h-[380px]">
          <div className="w-full max-w-xl md:max-w-2xl px-4 relative">
            <AnimatePresence mode="wait">
              {testimonials.map((t, idx) => {
                if (idx !== activeIdx) return null;
                const c = colors[t.accent];

                return (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative mx-auto rounded-2xl border border-white/10 bg-[#140C20]/45 p-6 md:p-8 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      {/* Modern Avatar Frame */}
                      <div className="relative flex-shrink-0 self-center md:self-start">
                        <div className={`flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 font-display text-3xl font-black shadow-lg ${c}`}>
                          {t.initials}
                        </div>
                        <div className="mt-2 text-center font-mono text-[9px] font-bold tracking-widest text-[#A6FF00] uppercase">
                          // VERIFIED
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-grow flex flex-col justify-between min-h-[160px]">
                        <div>
                          {/* Rating and Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 mb-4">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] font-semibold text-slate-300">
                              {t.hypeTag}
                            </span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: t.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-mango text-mango stroke-none" />
                              ))}
                            </div>
                          </div>

                          {/* Quote */}
                          <p className="font-sans text-md font-medium leading-relaxed text-slate-200 md:text-lg">
                            &ldquo;{t.content}&rdquo;
                          </p>
                        </div>

                        {/* Author Info */}
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
                          <div>
                            <h4 className="font-display text-lg font-black text-white">{t.name}</h4>
                            <p className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t.role}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full border border-success/20 px-3.5 py-1 font-mono text-xs font-semibold bg-success/15 text-success`}>
                            <Smile className="h-3.5 w-3.5" /> {t.revenue}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-2 rounded-full border border-white/10 transition-all cursor-pointer ${
                idx === activeIdx ? 'w-8 bg-violet' : 'w-2 bg-[#140C20]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}