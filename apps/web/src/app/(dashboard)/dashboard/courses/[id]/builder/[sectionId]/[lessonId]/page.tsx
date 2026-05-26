'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, FileQuestion, FileText, Save, Sparkles, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useDeleteManagedAssignment,
  useDeleteManagedQuiz,
  useManagedCourseCurriculum,
  useManagedLessonAssessment,
  useUpdateLesson,
  useUpsertManagedAssignment,
  useUpsertManagedQuiz,
} from '@/hooks/use-courses';
import { useQuizGenerate } from '@/hooks/use-ai';
import { useMediaAssets } from '@/hooks/use-media';

const lessonSchema = z.object({
  title: z.string().min(2, 'Lesson title is required').max(200),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']),
  videoUrl: z.string().optional(),
  duration: z.number().min(0).default(0),
  isPreview: z.boolean().default(false),
  contentText: z.string().optional(),
});

type LessonForm = z.infer<typeof lessonSchema>;

type QuizQuestionForm = {
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  questionText: string;
  optionsText: string;
  correctAnswer: string;
  explanation: string;
  points: number;
};

function contentToText(content: unknown) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null && 'text' in content) {
    return String((content as { text?: string }).text ?? '');
  }
  return JSON.stringify(content, null, 2);
}

export default function LessonEditorPage() {
  const params = useParams<{ id: string; sectionId: string; lessonId: string }>();
  const { data: course, isLoading, isError, error } = useManagedCourseCurriculum(params.id);
  const assessment = useManagedLessonAssessment(params.lessonId);
  const mediaAssets = useMediaAssets({ page: 1, limit: 12 });
  const updateLesson = useUpdateLesson();
  const upsertQuiz = useUpsertManagedQuiz();
  const deleteQuiz = useDeleteManagedQuiz();
  const upsertAssignment = useUpsertManagedAssignment();
  const deleteAssignment = useDeleteManagedAssignment();
  const generateQuiz = useQuizGenerate();
  const section = course?.sections.find((item) => item.id === params.sectionId);
  const lesson = section?.lessons.find((item) => item.id === params.lessonId);
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([]);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentMaxScore, setAssignmentMaxScore] = useState(100);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonForm>({
    resolver: zodResolver(lessonSchema) as any,
    defaultValues: {
      title: '',
      type: 'VIDEO',
      duration: 0,
      isPreview: false,
      videoUrl: '',
      contentText: '',
    },
  });

  useEffect(() => {
    if (!lesson) return;
    reset({
      title: lesson.title,
      type: lesson.type as LessonForm['type'],
      duration: lesson.duration ?? 0,
      isPreview: lesson.isPreview ?? false,
      videoUrl: lesson.videoUrl ?? '',
      contentText: contentToText(lesson.content),
    });
  }, [lesson, reset]);

  useEffect(() => {
    const quiz = assessment.data?.quiz;
    if (!quiz) {
      setQuizTitle(lesson?.title ? `${lesson.title} Quiz` : '');
      setPassingScore(70);
      setMaxAttempts(3);
      setQuestions([]);
      return;
    }
    setQuizTitle(quiz.title);
    setPassingScore(quiz.passingScore);
    setMaxAttempts(quiz.maxAttempts);
    setQuestions((quiz.questions ?? []).map((question: any) => ({
      type: question.type ?? 'MCQ',
      questionText: question.questionText ?? '',
      optionsText: Array.isArray(question.options) ? question.options.join('\n') : String(question.options ?? ''),
      correctAnswer: question.correctAnswer ?? '',
      explanation: question.explanation ?? '',
      points: Number(question.points ?? 1),
    })));
  }, [assessment.data?.quiz, lesson?.title]);

  useEffect(() => {
    const assignment = assessment.data?.assignment;
    if (!assignment) {
      setAssignmentTitle(lesson?.title ? `${lesson.title} Assignment` : '');
      setAssignmentInstructions('');
      setAssignmentDueDate('');
      setAssignmentMaxScore(100);
      return;
    }
    setAssignmentTitle(assignment.title);
    setAssignmentInstructions(assignment.instructions);
    setAssignmentDueDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '');
    setAssignmentMaxScore(Number(assignment.maxScore ?? 100));
  }, [assessment.data?.assignment, lesson?.title]);

  const lessonType = watch('type');

  async function onSubmit(data: LessonForm) {
    try {
      await updateLesson.mutateAsync({
        lessonId: params.lessonId,
        courseId: params.id,
        data: {
          title: data.title,
          type: data.type,
          duration: data.duration,
          isPreview: data.isPreview,
          videoUrl: data.videoUrl || undefined,
          content: data.contentText ? { text: data.contentText } : undefined,
        },
      });
      toast.success('Lesson saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lesson update failed');
    }
  }

  async function saveQuiz() {
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    if (!questions.length) {
      toast.error('Add at least one quiz question');
      return;
    }
    try {
      await upsertQuiz.mutateAsync({
        lessonId: params.lessonId,
        courseId: params.id,
        data: {
          title: quizTitle.trim(),
          passingScore,
          maxAttempts,
          questions: questions.map((question, index) => ({
            type: question.type,
            questionText: question.questionText.trim(),
            options: question.optionsText.split('\n').map((option) => option.trim()).filter(Boolean),
            correctAnswer: question.correctAnswer.trim(),
            explanation: question.explanation.trim() || undefined,
            points: Number(question.points || 1),
            order: index,
          })),
        },
      });
      setValue('type', 'QUIZ', { shouldDirty: true });
      toast.success('Quiz saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Quiz could not be saved');
    }
  }

  async function removeQuiz() {
    const quizId = assessment.data?.quiz?.id;
    if (!quizId) return;
    try {
      await deleteQuiz.mutateAsync({ quizId, lessonId: params.lessonId });
      toast.success('Quiz deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Quiz could not be deleted');
    }
  }

  async function importAiQuiz() {
    const source = contentToText(lesson?.content) || lesson?.title || 'SkillMango lesson';
    try {
      const result = await generateQuiz.mutateAsync({
        content: source,
        questionCount: Math.max(3, questions.length || 5),
        questionType: 'MCQ',
        difficulty: 'INTERMEDIATE',
      });
      const generatedQuestions = Array.isArray(result?.questions) ? result.questions : [];
      if (!generatedQuestions.length) {
        toast.error('AI returned no quiz questions');
        return;
      }
      setQuizTitle(result?.title || quizTitle || `${lesson?.title ?? 'Lesson'} Quiz`);
      setQuestions(generatedQuestions.map((question: any) => ({
        type: question.type ?? 'MCQ',
        questionText: question.questionText ?? question.question ?? '',
        optionsText: Array.isArray(question.options) ? question.options.join('\n') : '',
        correctAnswer: String(question.correctAnswer ?? ''),
        explanation: question.explanation ?? '',
        points: Number(question.points ?? 1),
      })));
      setValue('type', 'QUIZ', { shouldDirty: true });
      toast.success('AI quiz imported for editing');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI quiz generation failed');
    }
  }

  async function saveAssignment() {
    if (!assignmentTitle.trim() || !assignmentInstructions.trim()) {
      toast.error('Assignment title and instructions are required');
      return;
    }
    try {
      await upsertAssignment.mutateAsync({
        lessonId: params.lessonId,
        courseId: params.id,
        data: {
          title: assignmentTitle.trim(),
          instructions: assignmentInstructions.trim(),
          dueDate: assignmentDueDate || null,
          maxScore: assignmentMaxScore,
        },
      });
      setValue('type', 'ASSIGNMENT', { shouldDirty: true });
      toast.success('Assignment saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Assignment could not be saved');
    }
  }

  async function removeAssignment() {
    const assignmentId = assessment.data?.assignment?.id;
    if (!assignmentId) return;
    try {
      await deleteAssignment.mutateAsync({ assignmentId, lessonId: params.lessonId });
      toast.success('Assignment deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Assignment could not be deleted');
    }
  }

  if (isLoading) {
    return <div className="space-y-6"><div className="h-20 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (isError || !course || !section || !lesson) {
    return <Card><CardContent className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : 'Lesson could not be loaded.'}</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/courses/${params.id}/builder`}>
          <Button variant="ghost" size="icon" aria-label="Back to builder">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <p className="text-sm text-muted-foreground">{course.title} / {section.title}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Lesson Editor</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-mango-500" />
              Lesson content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input label="Lesson title" {...register('title')} error={errors.title?.message} />

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Lesson type</label>
                  <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm dark:border-border-dark" {...register('type')}>
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="ASSIGNMENT">Assignment</option>
                  </select>
                </div>
                <Input label="Duration (seconds)" type="number" min="0" {...register('duration', { valueAsNumber: true })} error={errors.duration?.message} />
                <label className="flex items-center gap-2 pt-7 text-sm text-foreground">
                  <input type="checkbox" className="h-4 w-4 rounded border-border" {...register('isPreview')} />
                  Preview lesson
                </label>
              </div>

              <Input label="Video URL" placeholder="https://..." {...register('videoUrl')} error={errors.videoUrl?.message} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Lesson notes</label>
                <textarea
                  className="min-h-72 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-mango-500 dark:border-border-dark"
                  placeholder="Write lesson notes or script content..."
                  {...register('contentText')}
                />
              </div>

              <Button type="submit" className="gap-2" disabled={updateLesson.isPending}>
                <Save className="h-4 w-4" />
                {updateLesson.isPending ? 'Saving...' : 'Save lesson'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {lessonType === 'QUIZ' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileQuestion className="h-5 w-5 text-mango-500" />
                Quiz builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Quiz title" value={quizTitle} onChange={(event) => setQuizTitle(event.target.value)} />
                <Input label="Passing score (%)" type="number" min="0" max="100" value={passingScore} onChange={(event) => setPassingScore(Number(event.target.value))} />
                <Input label="Max attempts" type="number" min="1" value={maxAttempts} onChange={(event) => setMaxAttempts(Number(event.target.value))} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="gap-2" disabled={generateQuiz.isPending} onClick={importAiQuiz}>
                  <Sparkles className="h-4 w-4" />
                  {generateQuiz.isPending ? 'Generating...' : 'Import AI quiz'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setQuestions((current) => [...current, { type: 'MCQ', questionText: '', optionsText: '', correctAnswer: '', explanation: '', points: 1 }])}
                >
                  Add question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="rounded-2xl border p-4 dark:border-border-dark">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-semibold">Question {index + 1}</p>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
                        <select
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm dark:border-border-dark"
                          value={question.type}
                          onChange={(event) => setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as QuizQuestionForm['type'] } : item))}
                        >
                          <option value="MCQ">MCQ</option>
                          <option value="TRUE_FALSE">True/false</option>
                          <option value="SHORT_ANSWER">Short answer</option>
                        </select>
                      </div>
                      <Input label="Question" value={question.questionText} onChange={(event) => setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, questionText: event.target.value } : item))} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Options, one per line</label>
                        <textarea
                          className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mango-500 dark:border-border-dark"
                          value={question.optionsText}
                          onChange={(event) => setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, optionsText: event.target.value } : item))}
                        />
                      </div>
                      <div className="space-y-3">
                        <Input label="Correct answer" value={question.correctAnswer} onChange={(event) => setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, correctAnswer: event.target.value } : item))} />
                        <Input label="Points" type="number" min="0" value={question.points} onChange={(event) => setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, points: Number(event.target.value) } : item))} />
                      </div>
                    </div>
                    <Input className="mt-3" label="Explanation" value={question.explanation} onChange={(event) => setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, explanation: event.target.value } : item))} />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" className="gap-2" disabled={upsertQuiz.isPending} onClick={saveQuiz}>
                  <Save className="h-4 w-4" />
                  {upsertQuiz.isPending ? 'Saving quiz...' : 'Save quiz'}
                </Button>
                {assessment.data?.quiz?.id && (
                  <Button type="button" variant="outline" className="gap-2" disabled={deleteQuiz.isPending} onClick={removeQuiz}>
                    <Trash2 className="h-4 w-4" />
                    Delete quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {lessonType === 'ASSIGNMENT' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-mango-500" />
                Assignment builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Assignment title" value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} />
                <Input label="Due date" type="datetime-local" value={assignmentDueDate} onChange={(event) => setAssignmentDueDate(event.target.value)} />
                <Input label="Max score" type="number" min="0" value={assignmentMaxScore} onChange={(event) => setAssignmentMaxScore(Number(event.target.value))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Instructions</label>
                <textarea
                  className="min-h-48 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mango-500 dark:border-border-dark"
                  value={assignmentInstructions}
                  onChange={(event) => setAssignmentInstructions(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="gap-2" disabled={upsertAssignment.isPending} onClick={saveAssignment}>
                  <Save className="h-4 w-4" />
                  {upsertAssignment.isPending ? 'Saving assignment...' : 'Save assignment'}
                </Button>
                {assessment.data?.assignment?.id && (
                  <Button type="button" variant="outline" className="gap-2" disabled={deleteAssignment.isPending} onClick={removeAssignment}>
                    <Trash2 className="h-4 w-4" />
                    Delete assignment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-accent-purple" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-deep-navy to-slate-900 text-white">
              <Video className="h-12 w-12 opacity-70" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              This editor saves the existing lesson fields through the course service. Advanced quiz and assignment builders can layer onto this route next.
            </p>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Attach media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mediaAssets.isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
            ) : mediaAssets.data?.data.length ? (
              mediaAssets.data.data
                .filter((asset) => asset.contentType.startsWith('video/'))
                .slice(0, 8)
                .map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setValue('videoUrl', asset.url || asset.key, { shouldDirty: true });
                      toast.success('Media attached to video URL field');
                    }}
                    className="block w-full rounded-xl border p-3 text-left text-sm transition hover:bg-muted dark:border-border-dark"
                  >
                    <span className="block truncate font-medium text-foreground">{asset.filename}</span>
                    <span className="block truncate text-xs text-muted-foreground">{asset.key}</span>
                  </button>
                ))
            ) : (
              <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground dark:border-border-dark">
                Upload videos in the media library, then attach them here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
