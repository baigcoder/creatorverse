'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, MonitorPlay, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { workshopsApi } from '@/services/workshops';

function money(value: number | string | undefined, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value ?? 0));
}

function dateTime(value?: string) {
  if (!value) return 'To be announced';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function PublicWorkshopPage() {
  const params = useParams<{ slug: string }>();
  const { data: workshop, isLoading, isError, error } = useQuery({
    queryKey: ['public-workshop', params.slug],
    queryFn: () => workshopsApi.getBySlug(params.slug),
    enabled: !!params.slug,
  });

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
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-[500px] animate-pulse rounded-2xl bg-muted" />
            <div className="h-[400px] animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : isError || !workshop ? (
          <Card><CardContent className="p-8 text-sm text-red-600">{error instanceof Error ? error.message : 'Workshop could not be loaded.'}</CardContent></Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-8">
              <div className="space-y-5">
                <span className="inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600">{workshop.status}</span>
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{workshop.title}</h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  {workshop.description || 'A practical live SkillMango AI workshop with creator-led teaching, Q&A, and replay support.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card><CardContent className="flex gap-3 p-5"><CalendarDays className="h-5 w-5 text-mango-500" /><div><p className="text-sm text-muted-foreground">Starts</p><p className="font-semibold">{dateTime(workshop.startTime)}</p></div></CardContent></Card>
                <Card><CardContent className="flex gap-3 p-5"><Clock className="h-5 w-5 text-mango-500" /><div><p className="text-sm text-muted-foreground">Ends</p><p className="font-semibold">{dateTime(workshop.endTime)}</p></div></CardContent></Card>
                <Card><CardContent className="flex gap-3 p-5"><MonitorPlay className="h-5 w-5 text-mango-500" /><div><p className="text-sm text-muted-foreground">Provider</p><p className="font-semibold">{workshop.meetingProvider}</p></div></CardContent></Card>
                <Card><CardContent className="flex gap-3 p-5"><Users className="h-5 w-5 text-mango-500" /><div><p className="text-sm text-muted-foreground">Seats</p><p className="font-semibold">{workshop._count?.registrations ?? 0}{workshop.maxAttendees ? ` / ${workshop.maxAttendees}` : ''}</p></div></CardContent></Card>
              </div>

              <Card>
                <CardHeader><CardTitle>What You Will Get</CardTitle></CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  {['Live teaching', 'Replay access', 'Attendance tracking'].map((item) => (
                    <div key={item} className="rounded-xl border border-border p-4 text-sm">{item}</div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <aside>
              <Card className="sticky top-6">
                <CardContent className="space-y-5 p-6">
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#111827] via-[#202938] to-[#0f172a]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hosted by</p>
                    <p className="font-semibold">{workshop.creator?.brandName ?? 'SkillMango Creator'}</p>
                  </div>
                  <div className="flex items-end justify-between border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">Seat price</span>
                    <span className="text-2xl font-bold">{Number(workshop.price) === 0 ? 'Free' : money(workshop.price, workshop.currency)}</span>
                  </div>
                  <Link href={`/checkout/workshop/${workshop.id}`}>
                    <Button className="w-full">Reserve seat</Button>
                  </Link>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-green-500" />Secure registration and reminders.</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
