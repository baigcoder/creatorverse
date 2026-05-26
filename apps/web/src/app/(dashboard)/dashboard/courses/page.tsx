'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Search, Filter, Grid3X3, List, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCourses } from '@/hooks/use-courses';

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
};

const levelLabels: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const query = useMemo(
    () => ({
      limit: 24,
      search: search.trim() || undefined,
    }),
    [search],
  );
  const { data: courses = [], isLoading, isError, error } = useCourses(query);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">Creator Products</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground">Courses</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Manage your catalog, review drafts, and ship new learning experiences from one consistent creator dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-midnight/40 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Visible Results</p>
              <p className="mt-1 text-xl font-bold text-white">{courses.length}</p>
            </div>
            <Link href="/dashboard/courses/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-midnight/40 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-mango-500/40 focus:outline-none focus:ring-2 focus:ring-mango-500/20"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="icon" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-white/[0.08] bg-white/[0.03]">
              <div className="aspect-video animate-pulse bg-white/[0.06]" />
              <CardContent className="space-y-3 p-5">
                <div className="h-5 w-24 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-red-400/30 bg-red-500/10">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-red-300">Courses could not be loaded.</p>
            <p className="mt-1 text-sm text-red-200/80">
              {error instanceof Error ? error.message : 'Check the API server and try again.'}
            </p>
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card className="border-dashed border-white/[0.15] bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <BookOpen className="h-10 w-10 text-mango-400" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">No courses found</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {search ? 'Try a different search term or clear the filter.' : 'Create your first course and start shaping the curriculum.'}
            </p>
            <Link href="/dashboard/courses/new" className="mt-5">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
              <Card className="group cursor-pointer overflow-hidden border-white/[0.08] bg-white/[0.03] transition-all duration-200 hover:-translate-y-1 hover:border-mango-500/30 hover:shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-violet/20 via-cyan/10 to-mango/10">
                  <BookOpen className="h-12 w-12 text-mango-400/70" />
                </div>

                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[course.status]}`}>
                      {course.status === 'PUBLISHED' ? 'Published' : course.status === 'DRAFT' ? 'Draft' : 'Archived'}
                    </span>
                    <span className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-slate-300">
                      {levelLabels[course.level]}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-foreground transition-colors group-hover:text-mango-400 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-bold text-foreground">${course.price}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{course._count?.enrollments ?? 0} students</span>
                      <span>{course.currency ?? 'USD'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
