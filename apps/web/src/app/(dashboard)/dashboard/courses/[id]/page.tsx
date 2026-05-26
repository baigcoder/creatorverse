'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, DollarSign, Eye, PencilLine, PlayCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useManagedCourse } from '@/hooks/use-courses';

const statusClasses: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  ARCHIVED: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
};

function money(value: number | string | undefined, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value ?? 0));
}

function durationLabel(seconds?: number) {
  if (!seconds) return 'Not calculated';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: course, isLoading, isError, error } = useManagedCourse(params.id);

  if (isLoading) {
    return <div className="space-y-6"><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (isError || !course) {
    return <Card><CardContent className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : 'Course could not be loaded.'}</CardContent></Card>;
  }

  const sections = course.sections ?? [];
  const lessonCount = sections.reduce((total, section) => total + (section.lessons?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon" aria-label="Back to courses">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[course.status] ?? statusClasses.DRAFT}`}>
              {course.status}
            </span>
            <span className="text-xs text-muted-foreground">{course.level}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{course.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{course.description || 'Add a description to help learners understand the outcome.'}</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Link href={`/dashboard/courses/${course.id}/builder`}>
            <Button className="gap-2"><PencilLine className="h-4 w-4" />Open builder</Button>
          </Link>
          <Link href={`/c/${course.id}`}>
            <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" />Preview</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5"><DollarSign className="h-5 w-5 text-green-500" /><p className="mt-3 text-xs text-muted-foreground">Price</p><p className="mt-1 text-xl font-bold">{money(course.price, course.currency)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><Users className="h-5 w-5 text-accent-cyan" /><p className="mt-3 text-xs text-muted-foreground">Enrollments</p><p className="mt-1 text-xl font-bold">{course._count?.enrollments ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-5"><BookOpen className="h-5 w-5 text-mango-500" /><p className="mt-3 text-xs text-muted-foreground">Lessons</p><p className="mt-1 text-xl font-bold">{lessonCount}</p></CardContent></Card>
        <Card><CardContent className="p-5"><Clock className="h-5 w-5 text-accent-purple" /><p className="mt-3 text-xs text-muted-foreground">Duration</p><p className="mt-1 text-xl font-bold">{durationLabel(course.totalDuration)}</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Curriculum</CardTitle>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                No sections yet. Open the builder to add curriculum.
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="rounded-2xl border p-4 dark:border-border-dark">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{section.title}</p>
                      <span className="text-xs text-muted-foreground">{section.lessons?.length ?? 0} lessons</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {section.lessons?.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/courses/${course.id}/builder/${section.id}/${lesson.id}`}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-muted"
                        >
                          <PlayCircle className="h-4 w-4 text-mango-500" />
                          <span className="flex-1 text-foreground">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground">{lesson.type}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Next actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/dashboard/courses/${course.id}/builder`} className="block">
              <Button className="w-full">Edit curriculum</Button>
            </Link>
            <Link href={`/dashboard/analytics/course/${course.id}`} className="block">
              <Button variant="outline" className="w-full">View analytics</Button>
            </Link>
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground dark:border-border-dark">
              Courses need at least one section and lesson before publishing. Keep lesson titles clear and preview one early lesson.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
