'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileCheck2, Send, ChevronLeft, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { coursesApi } from '@/services/courses';
import { motion } from 'framer-motion';

export default function LearnerAssignmentPage() {
  const params = useParams<{ id: string; assignmentId: string }>();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const assignment = useQuery({
    queryKey: ['learner-assignment', params.assignmentId],
    queryFn: () => coursesApi.assignment(params.assignmentId),
    enabled: !!params.assignmentId,
  });

  const submit = useMutation({
    mutationFn: () => coursesApi.submitAssignment(params.assignmentId, { content, fileUrl: fileUrl || undefined }),
    onSuccess: () => {
      setContent('');
      setFileUrl('');
      queryClient.invalidateQueries({ queryKey: ['learner-assignment', params.assignmentId] });
      toast.success('Assignment submitted');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Assignment submission failed'),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return toast.error('Add your assignment response first');
    submit.mutate();
  }

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet">
            Assignment Portal
          </span>
          <h1 className="font-display text-2xl font-bold text-white mt-0.5">
            {assignment.data?.title ?? 'Course Assignment'}
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-semibold">
            {assignment.data?.course?.title ?? 'SkillMango Course'} · MAX SCORE: {assignment.data?.maxScore ?? 100} PTS
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/learn/courses/${params.id}`}>
            <Button variant="outline" className="rounded-xl border-white/10 text-slate-300 hover:bg-white/[0.05] font-semibold text-xs py-2 px-4 h-auto gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Course
            </Button>
          </Link>
        </div>
      </motion.div>

      {assignment.isLoading ? (
        <div className="h-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
      ) : assignment.isError || !assignment.data ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm font-semibold text-red-400">
          Assignment could not be loaded for this enrollment.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="grid gap-6 lg:grid-cols-[1fr_360px]"
        >
          {/* Mission Briefing card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden h-fit">
            <div className="absolute inset-0 bg-gradient-to-br from-violet/5 to-cyan/5 pointer-events-none" />
            <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-violet" />
              Mission Briefing (Instructions)
            </h2>
            <div className="space-y-4">
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
                {assignment.data.instructions}
              </p>
              {assignment.data.dueDate && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-cyan/20 bg-cyan/10 px-3 py-1.5 text-xs font-semibold text-cyan">
                  <Calendar className="h-3.5 w-3.5" />
                  Deadline: {new Date(assignment.data.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Submit card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 h-fit">
            <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-cyan" />
              Submit Mission Work
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Response Text
                </label>
                <textarea
                  className="mt-1 min-h-[144px] w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 font-sans text-sm text-white placeholder-slate-500 focus:border-violet focus:outline-none focus:ring-1 focus:ring-violet/30 transition-all"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your assignment response..."
                />
              </div>
              <Input
                label="File Transmission URL (Optional)"
                value={fileUrl}
                onChange={(event) => setFileUrl(event.target.value)}
                placeholder="https://..."
                className="rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-violet focus:ring-1 focus:ring-violet/30 py-2"
              />
              <Button
                type="submit"
                disabled={submit.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold py-2.5 h-auto mt-2"
              >
                {submit.isPending ? 'Transmitting...' : 'Submit Assignment'}
              </Button>
            </form>
          </div>

          {/* Submission Logs card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-violet" />
              Submission Logs
            </h2>
            <div className="space-y-3">
              {assignment.data.submissions?.length ? (
                assignment.data.submissions.map((submission) => (
                  <div key={submission.id} className="rounded-xl border border-white/[0.08] bg-white/[0.01] p-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet/5 to-transparent pointer-events-none" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                      {submission.content}
                    </p>
                    {submission.fileUrl && (
                      <p className="mt-2 text-xs text-slate-400">
                        Attachment:{' '}
                        <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
                          {submission.fileUrl}
                        </a>
                      </p>
                    )}
                    <div className="mt-4 border-t border-white/[0.06] pt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Score:</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        submission.score !== null && submission.score !== undefined
                          ? 'bg-cyan/15 text-cyan border border-cyan/30'
                          : 'bg-white/10 text-slate-400 border border-white/20'
                      }`}>
                        {submission.score !== null && submission.score !== undefined
                          ? `${submission.score} / ${assignment.data.maxScore} PTS`
                          : 'PENDING EVALUATION'}
                      </span>
                      {submission.feedback && (
                        <div className="mt-3 w-full text-xs text-slate-400 bg-white/[0.02] border border-white/[0.06] p-3 rounded-lg">
                          <span className="font-semibold text-slate-300 block mb-1">Feedback:</span>
                          {submission.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-white/10 rounded-xl p-8 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  No transmissions recorded yet.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
