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
    <section className="relative overflow-hidden border-b-4 border-border bg-snow py-20 dark:bg-midnight sm:py-28">
      {/* Background glitch grids */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(28,28,28,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(28,28,28,0.05)_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block rounded-md border-2 border-border bg-cyan px-3 py-1 font-retro text-sm font-bold text-border shadow-[-2px_2px_0px_rgba(28,28,28,1)]">
              CREATOR REVIEWS
            </span>
            <h2 className="mt-6 font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-6xl leading-none">
              LOVED BY <span className="text-gradient-hero">10,000+</span> SPEEDRUNNERS
            </h2>
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              See how modern creators deleted their heavy corporate tools and booted up a beautiful custom Y2K business machine.
            </p>
          </div>

          {/* Carousel Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="flex h-12 w-12 items-center justify-center rounded-lg border-3 border-border bg-white text-foreground shadow-[-3px_3px_0px_rgba(28,28,28,1)] transition-all hover:bg-zinc-100 active:translate-y-[3px] active:-translate-x-[3px] active:shadow-none dark:bg-midnight dark:hover:bg-midnight-soft"
            >
              <ChevronLeft className="h-6 w-6 stroke-[3px]" />
            </button>
            <button
              onClick={handleNext}
              className="flex h-12 w-12 items-center justify-center rounded-lg border-3 border-border bg-white text-foreground shadow-[-3px_3px_0px_rgba(28,28,28,1)] transition-all hover:bg-zinc-100 active:translate-y-[3px] active:-translate-x-[3px] active:shadow-none dark:bg-midnight dark:hover:bg-midnight-soft"
            >
              <ChevronRight className="h-6 w-6 stroke-[3px]" />
            </button>
          </div>
        </div>

        {/* Carousel Area */}
        <div className="mt-16 relative flex items-center justify-center min-h-[440px]">
          <div className="w-full max-w-xl md:max-w-2xl px-4 relative">
            <AnimatePresence mode="wait">
              {testimonials.map((t, idx) => {
                if (idx !== activeIdx) return null;
                const c = colors[t.accent];
                const b = borderStyles[t.accent];

                return (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, rotate: -3, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, rotate: idx % 2 === 0 ? 1 : -1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, rotate: 3, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative mx-auto rounded-xl border-3 border-border bg-card p-6 md:p-8 shadow-[-8px_8px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised"
                  >
                    {/* Retro sticky tape overlay */}
                    <div className={`absolute -top-4 left-1/3 -translate-x-1/2 px-6 py-1 border-2 border-border font-retro text-xs font-black text-border shadow-sm uppercase ${t.tapeStyle}`}>
                      CV STICKER
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      {/* Polaroid Image Frame */}
                      <div className={`relative flex-shrink-0 self-center md:self-start rounded-lg border-3 border-border bg-white p-3 shadow-[-4px_4px_0px_rgba(28,28,28,1)] ${b}`}>
                        <div className={`flex h-32 w-32 items-center justify-center rounded border-2 border-border font-display text-4xl font-black ${c}`}>
                          {t.initials}
                        </div>
                        {/* Polaroid signature caption */}
                        <div className="mt-3 text-center font-retro text-xs font-black tracking-wider text-border">
                          {t.name.split(' ')[0]} // VERIFIED
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-grow flex flex-col justify-between min-h-[160px]">
                        <div>
                          {/* Rating and Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/20 pb-3 mb-4">
                            <span className="inline-block rounded border border-border bg-mango px-2 py-0.5 font-retro text-[10px] font-black text-border">
                              {t.hypeTag}
                            </span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: t.rating }).map((_, i) => (
                                <Star key={i} className="h-4.5 w-4.5 fill-mango text-border stroke-[1.5px]" />
                              ))}
                            </div>
                          </div>

                          {/* Quote */}
                          <p className="font-sans text-md font-semibold leading-relaxed text-foreground md:text-lg">
                            &ldquo;{t.content}&rdquo;
                          </p>
                        </div>

                        {/* Author Info */}
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/20 pt-4">
                          <div>
                            <h4 className="font-display text-lg font-black text-foreground">{t.name}</h4>
                            <p className="font-retro text-xs text-muted-foreground uppercase">{t.role}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded border-2 border-border px-3 py-1 font-retro text-xs font-black shadow-[-2px_2px_0px_rgba(28,28,28,1)] bg-success/20 text-success-dark dark:text-success`}>
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
              className={`h-3 rounded-full border border-border transition-all ${
                idx === activeIdx ? 'w-8 bg-violet' : 'w-3 bg-card dark:bg-midnight-soft'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}