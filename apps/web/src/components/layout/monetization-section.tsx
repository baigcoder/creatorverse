'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Video,
  Users,
  Calendar,
  FileDown,
  ShoppingBag,
} from 'lucide-react';

const streams = [
  {
    icon: BookOpen,
    title: 'Course Sales',
    example: 'One-time or subscription',
    price: '₹999 — ₹49,999',
    accent: 'violet',
  },
  {
    icon: Video,
    title: 'Workshop Tickets',
    example: 'Live events & replays',
    price: '₹499 — ₹9,999',
    accent: 'coral',
  },
  {
    icon: Users,
    title: 'Community Memberships',
    example: 'Monthly or annual',
    price: '₹299/mo — ₹2,999/mo',
    accent: 'cyan',
  },
  {
    icon: Calendar,
    title: '1:1 Consultations',
    example: 'Book & pay per session',
    price: '₹999 — ₹25,000',
    accent: 'mango',
  },
  {
    icon: FileDown,
    title: 'Digital Downloads',
    example: 'E-books, templates, tools',
    price: '₹199 — ₹4,999',
    accent: 'violet',
  },
  {
    icon: ShoppingBag,
    title: 'Creator Storefront',
    example: 'All products in one place',
    price: 'Custom pricing',
    accent: 'coral',
  },
];

const accentMap: Record<string, string> = {
  violet: 'border-violet/20 bg-violet/10 text-violet-300',
  coral: 'border-coral/20 bg-coral/10 text-coral',
  cyan: 'border-cyan/20 bg-cyan/10 text-cyan',
  mango: 'border-mango/20 bg-mango/10 text-mango',
};

export function MonetizationSection() {
  return (
    <section className="border-y border-border/50 bg-background py-20 dark:border-white/[0.06] dark:bg-midnight sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet">
            Monetization
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Every way to earn.{' '}
            <span className="text-gradient-hero">One platform.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Multiple revenue streams, unified analytics, single payout. Maximize your creator income.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream, index) => (
            <motion.div
              key={stream.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:border-white/[0.06] dark:bg-midnight-raised"
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${accentMap[stream.accent]}`}>
                <stream.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">{stream.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{stream.example}</p>
                <p className="mt-2 font-mono text-xs font-medium text-violet dark:text-violet-300">{stream.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
