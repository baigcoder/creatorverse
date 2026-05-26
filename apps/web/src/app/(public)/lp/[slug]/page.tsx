'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { landingPagesApi } from '@/services';

export default function PublicLandingPage() {
  const params = useParams<{ slug: string }>();
  const page = useQuery({
    queryKey: ['public-landing-page', params.slug],
    queryFn: () => landingPagesApi.viewBySlug(params.slug),
    enabled: !!params.slug,
  });
  const sections = Array.isArray(page.data?.sections) ? page.data.sections : [];
  const hero = sections.find((section: any) => section.type === 'hero') ?? sections[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70 bg-card/70 px-4 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-sm font-bold text-mango-500">SkillMango AI</Link>
          <Link href="/auth/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">Start building</Link>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {page.isLoading ? (
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        ) : page.isError || !page.data ? (
          <Card><CardContent className="p-8 text-sm text-red-600">This landing page could not be loaded.</CardContent></Card>
        ) : (
          <div className="space-y-10">
            <section className="rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
              <p className="text-sm font-semibold uppercase text-mango-500">{page.data.creator?.brandName ?? 'SkillMango Creator'}</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">{hero?.title ?? page.data.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{hero?.subtitle ?? page.data.seoDescription ?? 'A SkillMango AI launch page for a creator learning offer.'}</p>
              <Button className="mt-8 gap-2">{hero?.cta ?? 'Start learning'} <ArrowRight className="h-4 w-4" /></Button>
            </section>
            <div className="grid gap-5 md:grid-cols-2">
              {sections.filter((section: any) => section.type !== 'hero').map((section: any, index: number) => (
                <Card key={`${section.type}-${index}`}>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">{section.title ?? 'Offer section'}</h2>
                    {Array.isArray(section.items) && (
                      <ul className="mt-4 space-y-3">
                        {section.items.map((item: string) => <li key={item} className="flex gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-500" />{item}</li>)}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
