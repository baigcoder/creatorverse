'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, ExternalLink, Radio, Users, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateWorkshop, useWorkshop } from '@/hooks/use-workshops';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  LIVE: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  CANCELLED: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
};

function money(value: number | string | undefined, currency = 'USD') {
  const amount = Number(value ?? 0);
  return amount === 0 ? 'Free' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function WorkshopDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: workshop, isLoading, isError, error } = useWorkshop(params.id);
  const updateWorkshop = useUpdateWorkshop();

  async function setStatus(status: string) {
    if (!workshop) return;
    try {
      await updateWorkshop.mutateAsync({ id: workshop.id, data: { status } });
      toast.success(`Workshop marked ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed');
    }
  }

  if (isLoading) {
    return <div className="space-y-6"><div className="h-20 animate-pulse rounded-2xl bg-muted" /><div className="h-96 animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (isError || !workshop) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-red-600">
          {error instanceof Error ? error.message : 'Workshop could not be loaded.'}
        </CardContent>
      </Card>
    );
  }

  const registrations = workshop._count?.registrations ?? workshop.registrations?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/workshops">
          <Button variant="ghost" size="icon" aria-label="Back to workshops">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[workshop.status] ?? statusColors.DRAFT}`}>
              {workshop.status}
            </span>
            <span className="text-xs text-muted-foreground">{workshop.meetingProvider}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{workshop.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{workshop.description || 'No workshop description yet.'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <div className="flex aspect-video items-center justify-center rounded-t-2xl bg-gradient-to-br from-deep-navy via-slate-900 to-accent-purple/50 text-white">
              <Video className="h-16 w-16 opacity-80" />
            </div>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Start</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-mango-500" />
                  {new Date(workshop.startTime).toLocaleDateString()}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(workshop.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End</p>
                <p className="mt-1 text-sm font-medium text-foreground">{new Date(workshop.endTime).toLocaleDateString()}</p>
                <p className="mt-1 text-sm text-muted-foreground">{new Date(workshop.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{money(workshop.price, workshop.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registrations</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="h-4 w-4 text-accent-cyan" />
                  {registrations}/{workshop.maxAttendees ?? '∞'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registered learners</CardTitle>
            </CardHeader>
            <CardContent>
              {!workshop.registrations?.length ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No registrations yet. Scheduled workshops will show attendees here.
                </div>
              ) : (
                <div className="space-y-3">
                  {workshop.registrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between rounded-xl border p-3 dark:border-border-dark">
                      <div>
                        <p className="text-sm font-medium text-foreground">{registration.user?.name ?? 'Learner'}</p>
                        <p className="text-xs text-muted-foreground">
                          {registration.attended ? `${registration.attendanceMinutes} attendance minutes` : 'Registered'}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {registration.attended ? 'Attended' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radio className="h-5 w-5 text-red-500" />
              Control room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" disabled={updateWorkshop.isPending} onClick={() => setStatus('SCHEDULED')}>
              Mark scheduled
            </Button>
            <Button className="w-full" variant="outline" disabled={updateWorkshop.isPending} onClick={() => setStatus('LIVE')}>
              Go live
            </Button>
            <Button className="w-full" variant="outline" disabled={updateWorkshop.isPending} onClick={() => setStatus('COMPLETED')}>
              Mark completed
            </Button>
            {workshop.meetingUrl ? (
              <a href={workshop.meetingUrl} target="_blank" rel="noreferrer">
                <Button className="w-full gap-2" variant="outline">
                  <ExternalLink className="h-4 w-4" />
                  Open meeting link
                </Button>
              </a>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground dark:border-border-dark">
                Add a meeting URL from the API/editor flow before going live.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
