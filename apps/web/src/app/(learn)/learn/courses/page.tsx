'use client';

import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, Trophy, Sparkles } from 'lucide-react';
import { useMyLearning } from '@/hooks/use-courses';
import { motion } from 'framer-motion';

export default function LearnerCoursesPage() {
  const { data: enrollments = [], isLoading, isError, error } = useMyLearning();
  const completed = enrollments.filter((enrollment) => enrollment.status === 'COMPLETED').length;
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length)
    : 0;

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
            My Courses
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Resume stages, track completion, and unlock trophies.
          </p>
        </div>
        <Link
          href="/learn"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Hub
        </Link>
      </motion.div>

      {/* ── Stats Grid ─────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet/5 to-transparent pointer-events-none" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 border border-violet/25">
            <BookOpen className="h-5 w-5 text-violet" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Total Courses</p>
          <p className="mt-1.5 font-display text-3xl font-extrabold text-white">{enrollments.length}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 border border-cyan/25">
            <Clock className="h-5 w-5 text-cyan" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Average Progress</p>
          <p className="mt-1.5 font-display text-3xl font-extrabold text-white">{avgProgress}%</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-mango/5 to-transparent pointer-events-none" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mango/10 border border-mango/25">
            <Trophy className="h-5 w-5 text-mango" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Stages Completed</p>
          <p className="mt-1.5 font-display text-3xl font-extrabold text-white">{completed}</p>
        </div>
      </div>

      {/* ── Courses Listing ───────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm font-medium text-error">
          {error instanceof Error ? error.message : 'Courses could not be loaded.'}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-4 font-display text-lg font-bold text-white">No enrolled courses yet</p>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Enroll in a course stage to unlock lessons, assignments, quizzes, and tracking.
          </p>
          <Link href="/dashboard/courses" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet to-cyan px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,0,184,0.2)] hover:scale-[1.02] transition-transform">
            Browse All Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {enrollments.map((enrollment, index) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/learn/courses/${enrollment.courseId}`}>
                <div className="group h-full flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,184,0.08)] hover:border-violet/20 cursor-pointer">
                  <div>
                    <div className="relative aspect-video rounded-xl bg-gradient-to-br from-violet/10 to-cyan/10 flex items-center justify-center border border-white/5 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight to-transparent opacity-60" />
                      <BookOpen className="h-10 w-10 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-wider">
                      <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-slate-300">{enrollment.status}</span>
                      {enrollment.certificate && <CheckCircle2 className="h-4 w-4 text-mango" />}
                    </div>

                    <h2 className="mt-3 line-clamp-1 font-display text-lg font-bold text-white group-hover:text-violet transition-colors">
                      {enrollment.course.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-400 leading-relaxed">
                      {enrollment.course.description || 'Continue your Creatorverse course.'}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                      <span>XP Progress</span>
                      <span className="font-bold text-cyan">{enrollment.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full gradient-cta transition-all duration-500" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
