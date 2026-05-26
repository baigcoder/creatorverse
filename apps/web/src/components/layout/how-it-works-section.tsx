'use client';

import { motion } from 'framer-motion';
import { Rocket, Palette, DollarSign, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Rocket,
    number: '01',
    title: 'Create',
    description: 'Build your course, community, or workshop in minutes with AI-powered tools.',
    color: 'from-violet to-violet-600',
  },
  {
    icon: Palette,
    number: '02',
    title: 'Customize',
    description: 'Brand your storefront, landing page, and checkout with your own identity.',
    color: 'from-coral to-coral-400',
  },
  {
    icon: DollarSign,
    number: '03',
    title: 'Monetize',
    description: 'Set pricing, launch to your audience, and start earning immediately.',
    color: 'from-mango to-mango-500',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-20 scroll-mt-24 dark:bg-midnight sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet">
            Simple workflow
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Launch in 3 steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From idea to income — get your creator business running faster than ever.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-24 right-24 top-10 hidden h-px bg-gradient-to-r from-violet/50 via-cyan/50 to-mango/50 lg:block" />

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 text-left shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-sm font-bold text-white shadow-lg`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-sm font-bold text-white shadow-lg`}>
                    {step.number}
                  </div>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-8 hidden rounded-full border border-white/10 bg-midnight px-2 py-2 lg:block">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                )}

                <h3 className="mt-8 font-display text-2xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>

                <div className="mt-8 border-t border-white/[0.08] pt-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {index === 0 && 'Plan your offer and structure the experience'}
                    {index === 1 && 'Shape the brand, story, and checkout flow'}
                    {index === 2 && 'Turn attention into predictable revenue'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
