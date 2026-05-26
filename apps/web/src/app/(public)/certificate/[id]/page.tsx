'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Award, BadgeCheck, CalendarDays, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { certificatesApi } from '@/services';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function date(value?: string) {
  if (!value) return 'Verified';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(value));
}

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const { data: certificate, isLoading, isError, error } = useQuery({
    queryKey: ['certificate', params.id],
    queryFn: () => certificatesApi.verify(params.id),
    enabled: !!params.id,
  });

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/" className="text-sm font-bold text-mango-500">SkillMango AI</Link>
        {isLoading ? (
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        ) : isError || !certificate ? (
          <Card><CardContent className="p-8 text-sm text-red-600">{error instanceof Error ? error.message : 'Certificate could not be verified.'}</CardContent></Card>
        ) : (
          <>
            <section className="rounded-3xl border border-mango-500/40 bg-card p-8 text-center shadow-card sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mango-500/15 text-mango-500">
                <Award className="h-8 w-8" />
              </div>
              <p className="mt-6 text-sm font-semibold uppercase text-muted-foreground">Certificate of Completion</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">{certificate.user?.name ?? 'Verified Learner'}</h1>
              <p className="mt-4 text-muted-foreground">has successfully completed</p>
              <h2 className="mt-3 text-3xl font-bold text-mango-500">{certificate.course?.title ?? 'SkillMango Course'}</h2>
              <p className="mt-8 text-sm text-muted-foreground">Certificate ID: {certificate.id}</p>
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card><CardContent className="flex items-center gap-3 p-5 text-sm"><BadgeCheck className="h-5 w-5 text-green-500" />Authentic SkillMango credential</CardContent></Card>
              <Card><CardContent className="flex items-center gap-3 p-5 text-sm"><CalendarDays className="h-5 w-5 text-mango-500" />Issued {date(certificate.issuedAt)}</CardContent></Card>
              <Card><CardContent className="flex items-center gap-3 p-5 text-sm"><ShieldCheck className="h-5 w-5 text-cyan-500" />Public verification enabled</CardContent></Card>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={`${API_URL}/certificates/${certificate.id}/render`} target="_blank" rel="noreferrer">
                <Button className="gap-2"><Download className="h-4 w-4" />Download PDF</Button>
              </a>
              {certificate.certificateUrl && (
                <a href={certificate.certificateUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline">Open credential URL</Button>
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
