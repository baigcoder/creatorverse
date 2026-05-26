'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-midnight py-20 sm:py-28">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet/20 via-coral/10 to-mango/10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Decorative blurs */}
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-violet/15 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-coral/10 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-1.5 text-xs font-bold text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Ready to launch?
          </div>

          <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your universe awaits.
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-slate-400">
            Join 10,000+ creators already building thriving businesses on CreatorVerse OS. Start free — no credit card required.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/register">
              <Button variant="gradient" size="xl" className="gap-2.5 w-full sm:w-auto animate-pulse-glow">
                Start Building — It&apos;s Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="xl" className="w-full sm:w-auto border-slate-muted text-slate-300 hover:text-white hover:border-violet/40">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
