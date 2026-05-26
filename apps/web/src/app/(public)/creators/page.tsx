'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { coursesApi } from '@/services/courses';

export default function CreatorsPage() {
  const courses = useQuery({ queryKey: ['creator-showcase-courses'], queryFn: () => coursesApi.list({ limit: 12 }) });
  const creators = Array.from(new Map((courses.data ?? []).filter((course) => course.creator).map((course) => [course.creator!.id, course.creator!])).values());

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-6xl space-y-10">
        <Link href="/" className="text-sm font-bold text-mango-500">SkillMango AI</Link>
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-mango-500">Creator Showcase</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Learn from creators building modern academies.</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Discover published SkillMango creators and the courses powering their communities.</p>
          </div>
          <Link href="/auth/register"><Button>Become a creator</Button></Link>
        </section>

        {courses.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-muted" />)}</div>
        ) : courses.isError ? (
          <Card><CardContent className="p-6 text-sm text-red-600">Creator showcase could not be loaded.</CardContent></Card>
        ) : creators.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator) => {
              const creatorCourses = (courses.data ?? []).filter((course) => course.creator?.id === creator.id);
              return (
                <Card key={creator.id}>
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mango-500/15 text-lg font-bold text-mango-600">{creator.brandName[0]}</div>
                    <h2 className="mt-5 text-xl font-semibold">{creator.brandName}</h2>
                    <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" />{creatorCourses.length} courses</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />Creator</span>
                    </div>
                    {creatorCourses[0] && (
                      <Link href={`/c/${creatorCourses[0].slug ?? creatorCourses[0].id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-mango-500">
                        View latest course <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No published creators yet. Seed demo content or publish a course to populate this showcase.</CardContent></Card>
        )}
      </div>
    </main>
  );
}
