'use client';

import { motion } from 'framer-motion';
import { Sparkles, Wand2, FileText, HelpCircle, MessageSquare, PenTool } from 'lucide-react';

const aiFeatures = [
  {
    icon: FileText,
    title: 'Course Outline Generator',
    description: 'Describe your topic — AI creates a structured curriculum with sections, lessons, and outcomes.',
  },
  {
    icon: PenTool,
    title: 'Lesson Script Writer',
    description: 'AI generates engaging lesson scripts, summaries, and key takeaways from your outline.',
  },
  {
    icon: HelpCircle,
    title: 'Quiz Generator',
    description: 'Auto-generate MCQs, true/false, and short-answer questions with explanations from any lesson.',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor (RAG)',
    description: 'Students ask doubts — AI answers from your course content with lesson references.',
  },
  {
    icon: Wand2,
    title: 'Landing Page Copy',
    description: 'AI writes headlines, descriptions, testimonials, and FAQ for your course landing pages.',
  },
  {
    icon: Sparkles,
    title: 'Growth Suggestions',
    description: 'AI analyzes drop-off, completion, and engagement — then suggests actionable improvements.',
  },
];

export function AIShowcaseSection() {
  return (
    <section id="ai" className="relative overflow-hidden border-y border-white/[0.06] bg-midnight-raised py-20 scroll-mt-24 sm:py-24">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />
      {/* Glow orb */}
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/8 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
        <div className="lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-4 py-1.5 text-xs font-bold text-cyan">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            AI built into the workflow,{' '}
            <span className="text-gradient-premium">not bolted on.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 max-w-xl text-lg leading-8 text-slate-400"
          >
            From course creation to student support, AI accelerates every step of your creator journey without feeling like a separate tool bolted onto the side.
          </motion.p>

          <div className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Creator AI Console</p>
                <p className="mt-2 text-lg font-semibold text-white">One prompt can spin up your next launch asset.</p>
              </div>
              <div className="rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-semibold text-violet-200">
                Live Assist
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-midnight/80 p-4 font-mono text-sm text-slate-300">
              <p className="text-slate-500">$ generate.launch --asset=course --audience="beginner creators"</p>
              <p className="mt-3 text-cyan-300">&gt; Outline complete</p>
              <p className="mt-1 text-violet-300">&gt; Landing page copy drafted</p>
              <p className="mt-1 text-mango">&gt; Email sequence queued</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Draft Speed</p>
                <p className="mt-2 text-2xl font-bold text-white">5x</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Support Load</p>
                <p className="mt-2 text-2xl font-bold text-white">-42%</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Launch Assets</p>
                <p className="mt-2 text-2xl font-bold text-white">6</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet/30 hover:bg-white/[0.05] ${index === 0 ? 'md:col-span-2 xl:col-span-3' : ''}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10">
                <feature.icon className="h-5 w-5 text-violet-300" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
