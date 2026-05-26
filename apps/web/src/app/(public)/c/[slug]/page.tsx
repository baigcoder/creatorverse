'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Award, BookOpen, CheckCircle2, Clock, Layers, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { coursesApi } from '@/services/courses';

function money(value: number | string | undefined, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value ?? 0));
}

export default function PublicCoursePage() {
  const params = useParams<{ slug: string }>();
  const { data: course, isLoading, isError, error } = useQuery({
    queryKey: ['public-course', params.slug],
    queryFn: () => coursesApi.getBySlug(params.slug),
    enabled: !!params.slug,
  });

  const lessons = course?.sections?.flatMap((section) => section.lessons ?? []) ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70 bg-card/70 px-4 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-sm font-bold text-mango-500">SkillMango AI</Link>
          <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
            <div className="h-[420px] animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : isError || !course ? (
          <Card>
            <CardContent className="p-8 text-sm text-red-600">
              {error instanceof Error ? error.message : 'This course could not be loaded.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-mango-500/30 bg-mango-500/10 px-3 py-1 text-xs font-semibold text-mango-600">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course.level} course
                </div>
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{course.title}</h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  {course.description || 'A creator-led SkillMango AI course built for practical outcomes and measurable learner progress.'}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2"><Layers className="h-4 w-4" />{course._count?.sections ?? course.sections?.length ?? 0} sections</span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2"><Clock className="h-4 w-4" />{lessons.length} lessons</span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2"><Award className="h-4 w-4" />Certificate ready</span>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Curriculum Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.sections?.length ? course.sections.map((section) => (
                    <div key={section.id} className="rounded-xl border border-border p-4">
                      <h2 className="font-semibold">{section.title}</h2>
                      <div className="mt-3 space-y-2">
                        {section.lessons?.length ? section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                            <span>{lesson.title}</span>
                            <span className="text-xs text-muted-foreground">{lesson.isPreview ? 'Preview' : lesson.type}</span>
                          </div>
                        )) : <p className="text-sm text-muted-foreground">Lessons are being prepared.</p>}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      The creator has not published a curriculum preview yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                {['Instant access after checkout', 'AI tutor support inside learning', 'Progress tracking and certificate'].map((item) => (
                  <Card key={item}>
                    <CardContent className="flex items-center gap-3 p-4 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-mango-500" />
                      {item}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <Card className="sticky top-6">
                <CardContent className="space-y-5 p-6">
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0f172a]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created by</p>
                    <p className="font-semibold">{course.creator?.brandName ?? 'SkillMango Creator'}</p>
                  </div>
                  <div className="flex items-end justify-between border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">Course price</span>
                    <span className="text-2xl font-bold">{Number(course.price) === 0 ? 'Free' : money(course.price, course.currency)}</span>
                  </div>
                  <Link href={`/checkout/course/${course.id}`}>
                    <Button className="w-full">Enroll now</Button>
                  </Link>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-green-500" />Secure checkout and instant enrollment.</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
