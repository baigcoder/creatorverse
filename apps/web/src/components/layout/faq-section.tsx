'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Terminal, Cpu } from 'lucide-react';

const faqs = [
  {
    question: 'Is CreatorVerse Y2K really free to start?',
    answer: 'Yes! Our Starter Cartridge plan is 100% free forever. You can create 1 course module, build a public chat community with up to 50 active users, and access basic metrics. No credit card required.',
    color: 'cyan',
  },
  {
    question: 'How does the AI course outline generator work?',
    answer: 'You feed the console your topic, audience vibes, and core targets. The compiler spits out a complete outline with sections, lesson scripts, assignments, and quizzes. Edit everything to match your creative chaos.',
    color: 'violet',
  },
  {
    question: 'Can I plug in my own payment processor?',
    answer: 'CreatorVerse supports direct Stripe integrations globally and Razorpay in India. We auto-handle webhook notifications, monthly subscriptions, refunds, and retro-invoiced payouts without corporate delays.',
    color: 'mango',
  },
  {
    question: 'How does the RAG AI Tutor Agent work?',
    answer: 'The AI Tutor runs over your custom curriculum files, text transcripts, and PDFs. When students ping questions, it scans your archives to supply immediate accurate answers with references so you can stay offline.',
    color: 'cyan',
  },
  {
    question: 'Can I migrate from Teachable, Kajabi, or Circle?',
    answer: 'Absolutely. We provide direct import tools for migration of your databases, video playlists, and user profiles. Our support crew will even hold your hand during the speedrun migration for free.',
    color: 'violet',
  },
  {
    question: 'Do I own 100% of my data and creative content?',
    answer: 'Yes, period. You own your students, your media content, and your brand metrics. CreatorVerse does not train large models on your custom uploads or sell your logs to third-party brokers. Export anytime.',
    color: 'mango',
  },
  {
    question: 'What about custom branded certificates?',
    answer: 'Our console auto-generates premium pixel-art completion certificates when students finish your playlist modules. Templates are fully skin-able, and each certificate includes a cryptographic verification code.',
    color: 'cyan',
  },
  {
    question: 'Is there a native mobile dashboard?',
    answer: 'CreatorVerse runs as a high-performance Progressive Web App (PWA). Save it to your phone home-screen to get smooth bottom-bar navigation and zero-latency haptic notifications. Native apps are on the map.',
    color: 'violet',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const colors = {
    violet: 'border-violet focus-within:border-violet shadow-neon-magenta hover:border-violet-300 bg-violet/10',
    cyan: 'border-cyan focus-within:border-cyan shadow-neon-cyan hover:border-cyan-300 bg-cyan/10',
    mango: 'border-mango focus-within:border-mango shadow-neon-green hover:border-mango-300 bg-mango/10',
  };

  const textColors = {
    violet: 'text-violet',
    cyan: 'text-cyan',
    mango: 'text-mango',
  };

  const badgeColors = {
    violet: 'bg-violet/20 border-violet/30 text-violet-300',
    cyan: 'bg-cyan/20 border-cyan/30 text-cyan-300',
    mango: 'bg-mango/20 border-mango/30 text-mango-300',
  };

  return (
    <section id="faq" className="relative overflow-hidden border-b-4 border-border bg-snow py-20 scroll-mt-24 dark:bg-midnight sm:py-28">
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] dark:opacity-[0.02]" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="inline-block rounded-md border-2 border-border bg-mango px-3 py-1 font-retro text-sm font-bold text-border shadow-[-2px_2px_0px_rgba(28,28,28,1)]">
            HELP DATABASE
          </span>
          <h2 className="mt-6 font-display text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl leading-none">
            DIAGNOSTICS & HELP
          </h2>
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Get your questions compiled and resolved. Can&apos;t find your bug? Ping our discord.
          </p>
        </div>

        {/* Collapsible Accordion Panels */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const itemColor = faq.color as 'violet' | 'cyan' | 'mango';
            const borderGlow = colors[itemColor];
            const textGlow = textColors[itemColor];
            const badgeC = badgeColors[itemColor];

            return (
              <div
                key={index}
                className={`rounded-xl border-3 border-border bg-card transition-all duration-300 shadow-[-3px_3px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised ${
                  isOpen ? borderGlow + ' -translate-y-1 shadow-[-5px_5px_0px_rgba(28,28,28,1)]' : 'hover:border-zinc-500'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-display cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded border border-border shadow-[-1.5px_1.5px_0px_rgba(28,28,28,1)] ${badgeC}`}>
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <span className="pr-4 text-sm font-extrabold text-foreground sm:text-base uppercase tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-foreground transition-transform duration-300 stroke-[3px] ${
                      isOpen ? 'rotate-180 ' + textGlow : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-border/20 font-sans relative overflow-hidden">
                        {/* Terminal code prompt visual */}
                        <div className="mb-3 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground uppercase">
                          <Terminal className="h-3.5 w-3.5 text-mango" />
                          <span>RESOLVER_OUTPUT://0x0{index + 1}</span>
                        </div>
                        <p className="text-sm font-semibold leading-relaxed text-muted-foreground pl-5 border-l-2 border-border/40">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
