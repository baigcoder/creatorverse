'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Flame, Play, Sparkles, Trophy } from 'lucide-react';
import { useMyLearning } from '@/hooks/use-courses';
import { useStreak } from '@/hooks/use-gamification';
import { useWorkshops } from '@/hooks/use-workshops';

export default function LearnHomePage() {
  const learning = useMyLearning();
  const streak = useStreak();
  const workshops = useWorkshops({ page: 1, limit: 4, status: 'SCHEDULED' });
  const enrollments = learning.data ?? [];
  const continueLearning = enrollments.filter((enrollment) => enrollment.status !== 'COMPLETED').slice(0, 4);
  const upcomingWorkshops = workshops.data ?? [];
  const currentStreak = streak.data?.currentStreak ?? 0;

  return (
    <div className="space-y-10">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Creator Hub
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Welcome back — your learning dashboard awaits.
          </p>
        </div>
        <Link
          href="/learn/courses"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-violet/40 bg-violet/10 px-4 py-2 text-sm font-semibold text-violet transition-all hover:bg-violet/20 hover:shadow-[0_0_20px_rgba(255,0,184,0.15)]"
        >
          <Sparkles className="h-4 w-4" />
          Browse Courses
        </Link>
      </motion.div>

      {/* ── Streak Card (Glass) ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 overflow-hidden relative"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet/5 to-cyan/5 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet/20 to-cyan/20 border border-violet/30">
            <Flame className="h-7 w-7 text-violet animate-pulse" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-display text-xl font-bold text-white">
              Streak: <span className="text-gradient-hero">{currentStreak} Days</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Keep the momentum going — learn daily for bonus rewards.
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {Array.from({ length: 7 }).map((_, index) => {
              const active = index < currentStreak;
              return (
                <div
                  key={index}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-violet/20 text-violet border border-violet/40 shadow-[0_0_10px_rgba(255,0,184,0.2)]'
                      : 'bg-white/[0.04] text-slate-500 border border-white/[0.08]'
                  }`}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Continue Learning ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-white">Continue Learning</h2>
          <Link
            href="/learn/courses"
            className="flex items-center gap-1.5 text-sm font-medium text-violet transition-colors hover:text-violet-300"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {learning.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-44 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : learning.isError ? (
          <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm font-medium text-error">
            {learning.error instanceof Error ? learning.error.message : 'Learning progress could not be loaded.'}
          </div>
        ) : continueLearning.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
            <BookOpen className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No active enrollments yet.</p>
            <Link
              href="/learn/courses"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:text-violet-300 transition-colors"
            >
              Explore Courses <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {continueLearning.map((enrollment, index) => {
              const totalLessons = enrollment.course._count?.lessons ?? enrollment.course.sections?.reduce((sum, section) => sum + section.lessons.length, 0) ?? 0;
              const completedLessons = enrollment.lessonProgress?.filter((progress) => progress.completed).length ?? Math.round((totalLessons * enrollment.progress) / 100);
              return (
                <motion.div key={enrollment.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                  <Link href={`/learn/courses/${enrollment.courseId}`}>
                    <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,184,0.08)] hover:border-violet/20 cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet/15 to-cyan/15 border border-white/10 group-hover:from-violet/25 group-hover:to-cyan/25 transition-all">
                          <BookOpen className="h-6 w-6 text-violet" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan">Level {index + 1}</span>
                          <h3 className="line-clamp-1 font-display text-base font-bold text-white transition-colors group-hover:text-violet mt-0.5">{enrollment.course.title}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">by {enrollment.course.creator?.brandName ?? 'Creatorverse user'}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-400">{completedLessons}/{totalLessons} lessons</span>
                          <span className="text-xs font-bold text-violet">{enrollment.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full gradient-cta transition-all duration-500" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Upcoming Workshops ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <h2 className="font-display text-xl font-bold text-white mb-5">Upcoming Workshops</h2>

        {workshops.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : upcomingWorkshops.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
            <Clock className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No live sessions scheduled. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {upcomingWorkshops.map((workshop) => (
              <Link key={workshop.id} href={`/w/${workshop.slug}`}>
                <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,228,255,0.08)] hover:border-cyan/20 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cyan/10 border border-cyan/20 group-hover:bg-cyan/20 transition-all">
                      <Clock className="h-5 w-5 text-cyan" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-mango">Live Session</span>
                      <h3 className="font-display text-base font-bold text-white mt-0.5">{workshop.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Host: {workshop.creator?.brandName ?? 'Creator'}</p>
                      <div className="mt-2.5 text-xs text-cyan font-medium">
                        {new Date(workshop.startTime).toLocaleString()} · {workshop._count?.registrations ?? 0} registered
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Quick Actions Grid ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { name: 'AI Tutor', icon: Sparkles, href: '/learn/ai-tutor', color: 'text-violet', glow: 'from-violet/15 to-violet/5', border: 'hover:border-violet/30 hover:shadow-[0_0_20px_rgba(255,0,184,0.1)]' },
          { name: 'Certificates', icon: Trophy, href: '/learn/certificates', color: 'text-cyan', glow: 'from-cyan/15 to-cyan/5', border: 'hover:border-cyan/30 hover:shadow-[0_0_20px_rgba(0,228,255,0.1)]' },
          { name: 'My Courses', icon: BookOpen, href: '/learn/courses', color: 'text-mango', glow: 'from-mango/15 to-mango/5', border: 'hover:border-mango/30 hover:shadow-[0_0_20px_rgba(166,255,0,0.1)]' },
          { name: 'Community', icon: Flame, href: '/learn/community', color: 'text-neon-yellow', glow: 'from-neon-yellow/15 to-neon-yellow/5', border: 'hover:border-neon-yellow/30 hover:shadow-[0_0_20px_rgba(255,230,0,0.1)]' },
        ].map((action) => (
          <Link key={action.name} href={action.href}>
            <div className={`group rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] p-5 text-center transition-all duration-300 cursor-pointer ${action.border}`}>
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.glow} border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="mt-3 block text-sm font-semibold text-white">{action.name}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
