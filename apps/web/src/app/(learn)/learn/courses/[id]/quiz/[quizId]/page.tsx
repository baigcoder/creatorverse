'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, ClipboardCheck, XCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { coursesApi, QuizAttemptResult } from '@/services/courses';
import { motion } from 'framer-motion';

function optionsOf(options: unknown) {
  if (Array.isArray(options)) return options.map(String);
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function LearnerQuizPage() {
  const params = useParams<{ id: string; quizId: string }>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  const quiz = useQuery({
    queryKey: ['learner-quiz', params.quizId],
    queryFn: () => coursesApi.quiz(params.quizId),
    enabled: !!params.quizId,
  });

  const submit = useMutation({
    mutationFn: () => coursesApi.submitQuiz(params.quizId, answers),
    onSuccess: (data) => {
      setResult(data);
      toast.success(data.passed ? 'Quiz passed' : 'Quiz submitted');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Quiz submission failed'),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
            Assessment Protocol
          </span>
          <h1 className="font-display text-2xl font-bold text-white mt-0.5">
            {quiz.data?.title ?? 'Course Quiz'}
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-semibold">
            PASSING SCORE: {quiz.data?.passingScore ?? 70}% · MAX ATTEMPTS: {quiz.data?.maxAttempts ?? 3}
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

      {quiz.isLoading ? (
        <div className="h-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
      ) : quiz.isError || !quiz.data ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm font-semibold text-red-400">
          Quiz could not be loaded for this enrollment.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {quiz.data.questions.map((question, index) => {
            const options = optionsOf(question.options);
            const feedback = result?.questions.find((item) => item.id === question.id);
            const isCorrect = feedback && answers[question.id]?.trim().toLowerCase() === feedback.correctAnswer.trim().toLowerCase();
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden"
              >
                <h3 className="font-display text-base font-bold text-white mb-4">
                  {index + 1}. {question.questionText}
                </h3>
                <div className="space-y-3">
                  {options.length ? (
                    <div className="grid gap-2">
                      {options.map((option) => {
                        const isChecked = answers[question.id] === option;
                        return (
                          <label
                            key={option}
                            className={`flex cursor-pointer items-center gap-3 border rounded-xl p-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                              isChecked
                                ? 'border-violet/30 bg-violet/10 text-white shadow-[0_0_12px_rgba(255,0,184,0.1)]'
                                : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.04] hover:text-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={isChecked}
                              onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                              className="accent-violet h-4 w-4"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Input
                      label="Your answer"
                      value={answers[question.id] ?? ''}
                      onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                      className="rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-violet focus:ring-1 focus:ring-violet/30 py-2"
                    />
                  )}
                  {feedback && (
                    <div className={`rounded-xl border p-4 text-xs font-semibold ${
                      isCorrect 
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                        : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                    }`}>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase mb-1.5">
                        {isCorrect ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450" /> : <XCircle className="h-4.5 w-4.5 text-rose-450" />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <p className="mt-1 text-slate-300 font-normal">
                        <span className="font-semibold block mb-0.5">Correct Answer: {feedback.correctAnswer}</span>
                        {feedback.explanation && <span className="text-slate-400 block mt-1.5">{feedback.explanation}</span>}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet/5 to-cyan/5 pointer-events-none" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet/10 border border-violet/25">
                    <ClipboardCheck className="h-6 w-6 text-violet" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Score Report</h3>
                    <p className="font-display text-xl font-bold text-gradient-hero mt-0.5">
                      {result.score} / {result.maxScore} Points ({result.percentage}%)
                    </p>
                    <p className={`text-xs font-semibold uppercase mt-1 ${
                      result.passed ? 'text-cyan' : 'text-rose-400'
                    }`}>
                      Status: {result.passed ? 'Stage Clear (Passed)' : 'Stage Failed (Try Again)'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={submit.isPending || quiz.data.questions.length === 0}
            className="rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold px-6 py-2.5 h-auto"
          >
            {submit.isPending ? 'Evaluating Transmissions...' : 'Submit Quiz'}
          </Button>
        </form>
      )}
    </div>
  );
}
