'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PricingSection } from '@/components/layout/pricing-section';
import { FAQSection } from '@/components/layout/faq-section';
import { FinalCTASection } from '@/components/layout/final-cta-section';
import { Footer } from '@/components/layout/footer';
import { ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-midnight text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-midnight/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl gradient-cta text-xs font-bold text-white">
              CV
            </span>
            <span className="font-display text-lg font-bold text-white">
              Creator<span className="text-violet-300">Verse</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="gradient" size="default">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
