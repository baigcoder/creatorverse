'use client';

import { Award, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyLearning } from '@/hooks/use-courses';
import { motion } from 'framer-motion';

export default function LearnerCertificatesPage() {
  const { data: enrollments = [], isLoading, isError, error } = useMyLearning();
  const certificates = enrollments.filter((enrollment) => enrollment.certificate);

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
            Certificates
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            View, share, and download your completed stage credentials.
          </p>
        </div>
        <Link
          href="/learn"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Hub
        </Link>
      </motion.div>

      {/* ── Certificates Listing ───────────────────────── */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-56 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm font-medium text-error">
          {error instanceof Error ? error.message : 'Certificates could not be loaded.'}
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-4 font-display text-lg font-bold text-white">No certificates earned yet</p>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Complete a course stage to 100% to unlock your professional verified completion credential.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((enrollment, index) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet/20 hover:shadow-[0_0_30px_rgba(255,0,184,0.08)] overflow-hidden transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-violet/20 via-purple-950/20 to-cyan/20 p-8 border-b border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet/10 border border-violet/30 text-white mb-4">
                  <Award className="h-6 w-6 text-violet animate-pulse" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan">Certificate of Completion</p>
                <h2 className="mt-2 font-display text-xl font-bold text-white leading-tight">{enrollment.course.title}</h2>
                <p className="mt-3 text-xs text-slate-400">
                  Issued: {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : 'Pending verification'}
                </p>
              </div>
              <div className="flex gap-3 p-5">
                <a href={enrollment.certificate?.certificateUrl} target="_blank" rel="noreferrer" className="flex-1">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold text-xs py-2 h-auto">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View Certificate
                  </Button>
                </a>
                <a href={enrollment.certificate?.certificateUrl} download className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl border-white/10 text-slate-300 hover:bg-white/[0.05] font-semibold text-xs py-2 h-auto">
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Download PDF
                  </Button>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
