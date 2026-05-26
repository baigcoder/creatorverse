'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Bot, CheckCircle2, FileText, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useMarkProgress, useMyLearningCourse } from '@/hooks/use-courses';
import { useSignedMediaAsset } from '@/hooks/use-media';
import { Lesson } from '@/services/courses';
import { motion } from 'framer-motion';

function lessonText(content: unknown) {
  if (!content) return 'No lesson notes yet.';
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null && 'text' in content) {
    return String((content as { text?: string }).text ?? 'No lesson notes yet.');
  }
  return JSON.stringify(content, null, 2);
}

export default function CoursePlayerPage() {
  const params = useParams<{ id: string }>();
  const { data: enrollment, isLoading, isError, error } = useMyLearningCourse(params.id);
  const markProgress = useMarkProgress();
  const lessons = useMemo(
    () => enrollment?.course.sections?.flatMap((section) => section.lessons) ?? [],
    [enrollment?.course.sections],
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const selectedLesson = lessons.find((lesson) => lesson.id === (selectedLessonId ?? lessons[0]?.id));
  const directVideoUrl = selectedLesson?.videoUrl?.match(/^https?:\/\//i) ? selectedLesson.videoUrl : null;
  const signedVideo = useSignedMediaAsset(directVideoUrl ? null : selectedLesson?.videoUrl);
  const videoSrc = directVideoUrl ?? signedVideo.data?.url ?? selectedLesson?.videoUrl;
  const completedLessonIds = new Set(enrollment?.lessonProgress?.filter((progress) => progress.completed).map((progress) => progress.lessonId) ?? []);

  async function completeLesson(lesson: Lesson) {
    try {
      await markProgress.mutateAsync({ lessonId: lesson.id, data: { completed: true, watchTimeSeconds: lesson.duration ?? 0 } });
      toast.success('Lesson marked complete');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Progress update failed');
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="h-[620px] rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
        <div className="h-[620px] rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  if (isError || !enrollment) {
    return (
      <div className="rounded-2xl border border-error/30 bg-error/5 p-6 text-center text-sm font-medium text-error">
        {error instanceof Error ? error.message : 'Course access could not be loaded.'}
      </div>
    );
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
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet">{enrollment.course.creator?.brandName ?? 'Creatorverse Course'}</span>
          <h1 className="font-display text-2xl font-bold text-white mt-0.5">{enrollment.course.title}</h1>
          <p className="mt-1 text-xs text-slate-400 font-semibold">{enrollment.progress}% Complete</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/learn/ai-tutor?courseId=${enrollment.courseId}`}>
            <Button className="rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold text-xs py-2 px-4 h-auto gap-2">
              <Bot className="h-4 w-4" /> Ask AI Tutor
            </Button>
          </Link>
          <Link href="/learn/courses">
            <Button variant="outline" className="rounded-xl border-white/10 text-slate-300 hover:bg-white/[0.05] font-semibold text-xs py-2 px-4 h-auto">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Layout Grid ───────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Navigation Sidebar */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 lg:sticky lg:top-24 lg:h-[calc(100vh-10rem)] lg:overflow-y-auto">
          <div className="space-y-5">
            {enrollment.course.sections?.map((section, secIdx) => (
              <div key={section.id}>
                <p className="mb-2 px-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Stage {secIdx + 1}: {section.title}
                </p>
                <div className="space-y-1">
                  {section.lessons.map((lesson) => {
                    const isSelected = selectedLesson?.id === lesson.id;
                    const isComplete = completedLessonIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-violet/20 bg-violet/10 text-white shadow-[0_0_12px_rgba(255,0,184,0.15)] font-semibold'
                            : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {isComplete ? <CheckCircle2 className="h-4 w-4 text-cyan" /> : <PlayCircle className="h-4 w-4 text-slate-500" />}
                        <span className="text-xs truncate">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Window */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          {!selectedLesson ? (
            <div className="border border-dashed border-white/10 rounded-xl p-10 text-center text-sm font-semibold text-slate-500">
              No lessons have been released yet.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-video rounded-xl border border-white/[0.06] overflow-hidden bg-black flex items-center justify-center text-white relative">
                {videoSrc ? (
                  <video key={videoSrc} src={videoSrc} controls className="h-full w-full" />
                ) : (
                  <PlayCircle className="h-16 w-16 opacity-30 text-white" />
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan">
                  <FileText className="h-3.5 w-3.5" />{selectedLesson.type}
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-white border-b border-white/[0.06] pb-3.5">
                  {selectedLesson.title}
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {lessonText(selectedLesson.content)}
                </p>
              </div>
              
              <div className="pt-2">
                <Button
                  disabled={completedLessonIds.has(selectedLesson.id) || markProgress.isPending}
                  onClick={() => completeLesson(selectedLesson)}
                  className={`rounded-xl font-semibold text-xs py-2.5 px-5 h-auto ${
                    completedLessonIds.has(selectedLesson.id)
                      ? 'bg-white/[0.06] border border-white/10 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform'
                  }`}
                >
                  {completedLessonIds.has(selectedLesson.id)
                    ? 'Stage Completed'
                    : markProgress.isPending
                    ? 'Saving...'
                    : 'Mark Lesson Complete'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
