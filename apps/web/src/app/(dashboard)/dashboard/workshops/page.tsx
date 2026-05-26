'use client';

import { useMemo, useState } from 'react';
import { Calendar, Clock, Filter, Plus, Users, Video } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWorkshops } from '@/hooks/use-workshops';
import { Workshop } from '@/services/workshops';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  LIVE: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  CANCELLED: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
};

function money(value: number | string, currency = 'USD') {
  const amount = Number(value ?? 0);
  return amount === 0 ? 'Free' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function attendeeLabel(workshop: Workshop) {
  const registrations = workshop._count?.registrations ?? workshop.registrations?.length ?? 0;
  return `${registrations}/${workshop.maxAttendees ?? '∞'}`;
}

export default function WorkshopsPage() {
  const [filter, setFilter] = useState('all');
  const params = useMemo(
    () => ({ limit: 24, ...(filter === 'all' ? {} : { status: filter.toUpperCase() }) }),
    [filter],
  );
  const { data: workshops = [], isLoading, isError, error } = useWorkshops(params);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workshops</h1>
          <p className="mt-1 text-sm text-muted-foreground">Host live sessions and connect with your audience.</p>
        </div>
        <Link href="/dashboard/workshops/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Workshop
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {['all', 'draft', 'scheduled', 'live', 'completed'].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === value ? 'bg-mango-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Workshops could not be loaded.'}
          </CardContent>
        </Card>
      ) : workshops.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <Video className="mx-auto h-10 w-10 text-mango-500" />
            <p className="mt-4 font-medium text-foreground">No workshops found</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a live workshop in a few minutes and start collecting registrations.</p>
            <Link href="/dashboard/workshops/new" className="mt-5 inline-block">
              <Button>Create workshop</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop) => (
            <Link key={workshop.id} href={`/dashboard/workshops/${workshop.id}`}>
              <Card className="group h-full overflow-hidden transition-all hover:border-mango-200 hover:shadow-card-hover dark:hover:border-mango-500/30">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20">
                  <Video className="h-12 w-12 text-accent-purple/50" />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[workshop.status] ?? statusColors.DRAFT}`}>
                      {workshop.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{workshop.meetingProvider}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-mango-500">
                    {workshop.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{workshop.description || 'No description yet.'}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(workshop.startTime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(workshop.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{money(workshop.price, workshop.currency)}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {attendeeLabel(workshop)}
                    </span>
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
