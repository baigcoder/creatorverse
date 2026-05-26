'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, BookOpen, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCourseOutline } from '@/hooks/use-ai';
import { useCreateCourse } from '@/hooks/use-courses';

const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).default(0),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  language: z.string().default('en'),
});

const aiOutlineSchema = z.object({
  topic: z.string().min(3, 'Topic is required'),
  audience: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  duration: z.string().optional(),
  goal: z.string().optional(),
  tone: z.string().optional(),
});

type CreateCourseForm = z.infer<typeof createCourseSchema>;
type AiOutlineForm = z.infer<typeof aiOutlineSchema>;

type GeneratedOutline = {
  title?: string;
  description?: string;
  learningOutcomes?: string[];
  sections?: Array<{
    title?: string;
    lessons?: Array<{ title?: string; type?: string; duration?: number | string }>;
  }>;
};

export default function NewCoursePage() {
  const [showAI, setShowAI] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<GeneratedOutline | null>(null);
  const router = useRouter();
  const createCourse = useCreateCourse();
  const outline = useCourseOutline();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseForm>({
    resolver: zodResolver(createCourseSchema) as any,
    defaultValues: {
      price: 0,
      level: 'BEGINNER',
      language: 'en',
    },
  });

  const aiForm = useForm<AiOutlineForm>({
    resolver: zodResolver(aiOutlineSchema) as any,
    defaultValues: {
      level: 'BEGINNER',
      tone: 'friendly and premium',
    },
  });

  const onSubmit = async (data: CreateCourseForm) => {
    try {
      const course = await createCourse.mutateAsync(data);
      toast.success('Course created. Opening builder...');
      router.push(`/dashboard/courses/${course.id}/builder`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create course');
    }
  };

  const handleAIGenerate = async (data: AiOutlineForm) => {
    try {
      const result = await outline.mutateAsync(data);
      const generated = result as GeneratedOutline;
      setGeneratedOutline(generated);
      if (generated.title) setValue('title', generated.title, { shouldValidate: true });
      if (generated.description) setValue('description', generated.description);
      setValue('level', data.level);
      toast.success('AI outline generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI outline generation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon" aria-label="Back to courses">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
          <p className="mt-1 text-sm text-muted-foreground">Set up your course details, then build the curriculum.</p>
        </div>
      </div>

      <Card className="border-accent-purple/20 bg-gradient-to-r from-accent-purple/5 to-accent-cyan/5 dark:border-accent-purple/20">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-purple/10">
            <Sparkles className="h-6 w-6 text-accent-purple" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Start with AI</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate a structured outline, preview it, then use it to seed your course title and description.
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowAI((value) => !value)}>
            <Sparkles className="h-4 w-4 text-accent-purple" />
            {showAI ? 'Hide AI generator' : 'Generate with AI'}
          </Button>
        </CardContent>
      </Card>

      {showAI && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Course Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={aiForm.handleSubmit(handleAIGenerate)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Topic" placeholder="UX design for creators" {...aiForm.register('topic')} error={aiForm.formState.errors.topic?.message} />
                <Input label="Target audience" placeholder="Beginners, coaches, students" {...aiForm.register('audience')} />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Level</label>
                  <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm dark:border-border-dark" {...aiForm.register('level')}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <Input label="Duration" placeholder="4 weeks, 10 hours" {...aiForm.register('duration')} />
                <Input label="Outcome goal" placeholder="Launch a portfolio-ready project" {...aiForm.register('goal')} />
                <Input label="Tone" placeholder="Friendly, premium, practical" {...aiForm.register('tone')} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="gap-2" disabled={outline.isPending}>
                  <Sparkles className="h-4 w-4" />
                  {outline.isPending ? 'Generating...' : 'Generate Outline'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowAI(false)}>
                  Cancel
                </Button>
              </div>
            </form>

            {generatedOutline && (
              <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 dark:border-border-dark">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpen className="h-4 w-4 text-mango-500" />
                  Generated outline preview
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{generatedOutline.title ?? 'Untitled generated course'}</h3>
                {generatedOutline.description && <p className="mt-2 text-sm text-muted-foreground">{generatedOutline.description}</p>}
                {!!generatedOutline.sections?.length && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {generatedOutline.sections.slice(0, 4).map((section, index) => (
                      <div key={`${section.title}-${index}`} className="rounded-xl border bg-card p-4 text-sm dark:border-border-dark">
                        <p className="font-medium text-foreground">{section.title ?? `Section ${index + 1}`}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{section.lessons?.length ?? 0} lessons suggested</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Course Title *"
              placeholder="UX Design Masterclass: From Zero to Hero"
              {...register('title')}
              error={errors.title?.message}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
              <textarea
                placeholder="Describe what students will learn..."
                className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mango-500 dark:border-border-dark"
                {...register('description')}
              />
              {errors.description?.message && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Course Thumbnail</label>
              <div className="flex h-48 w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border transition-colors hover:border-mango-500 dark:border-border-dark">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Media upload is available from the media library.</p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB. 1280x720 recommended.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Level</label>
                <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm dark:border-border-dark" {...register('level')}>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Language</label>
                <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm dark:border-border-dark" {...register('language')}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button type="submit" size="lg" disabled={createCourse.isPending}>
                {createCourse.isPending ? 'Creating...' : 'Create Course'}
              </Button>
              <Link href="/dashboard/courses">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
