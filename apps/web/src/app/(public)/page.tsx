'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { HeroSection } from '@/components/layout/hero-section';
import { FeaturesSection } from '@/components/layout/features-section';
import { HowItWorksSection } from '@/components/layout/how-it-works-section';
import { AIShowcaseSection } from '@/components/layout/ai-showcase-section';
import { MonetizationSection } from '@/components/layout/monetization-section';
import { TestimonialsSection } from '@/components/layout/testimonials-section';
import { PricingSection } from '@/components/layout/pricing-section';
import { FAQSection } from '@/components/layout/faq-section';
import { FinalCTASection } from '@/components/layout/final-cta-section';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'AI', href: '#ai' },
  { name: 'FAQ', href: '#faq' },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-midnight text-foreground">
      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-midnight/80 backdrop-blur-xl shadow-crt">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl gradient-cta text-xs font-bold text-white border-2 border-foreground shadow-flat-sm animate-pulse">
              CV
            </span>
            <span className="font-display text-lg font-bold text-white">
              Creator<span className="text-violet-400">verse Y2K</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                Log in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="gradient" size="default" className="gap-1.5">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/[0.06] bg-midnight px-4 pb-6 pt-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full border-slate-muted text-slate-300">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="gradient" className="w-full">
                    Start Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Page Sections ─────────────────────────────────── */}
      <main className="scroll-smooth">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AIShowcaseSection />
        <MonetizationSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
