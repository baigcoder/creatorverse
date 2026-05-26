'use client';

import { BarChart3, BookOpen, DollarSign, Eye, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreatorOverview, useFunnelAnalytics } from '@/hooks/use-analytics';
import { useCourses } from '@/hooks/use-courses';

function money(value: number | string | undefined, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value ?? 0));
}

export default function AnalyticsPage() {
  const overview = useCreatorOverview();
  const funnel = useFunnelAnalytics();
  const courses = useCourses({ limit: 5, status: 'PUBLISHED' });
  const maxFunnel = Math.max(1, funnel.data?.pageViews ?? 0, funnel.data?.startedCheckout ?? 0, funnel.data?.completedPayment ?? 0, funnel.data?.enrollments ?? 0);
  const funnelRows = [
    { stage: 'Page Views', count: funnel.data?.pageViews ?? 0 },
    { stage: 'Started Checkout', count: funnel.data?.startedCheckout ?? 0 },
    { stage: 'Completed Payment', count: funnel.data?.completedPayment ?? 0 },
    { stage: 'Enrollments', count: funnel.data?.enrollments ?? 0 },
  ];
  const stats = [
    { name: 'Revenue', value: money(overview.data?.revenue), icon: DollarSign, color: 'text-green-500' },
    { name: 'Enrollments', value: String(overview.data?.enrollments ?? 0), icon: Users, color: 'text-blue-500' },
    { name: 'Active Learners', value: String(overview.data?.activeLearners ?? 0), icon: BookOpen, color: 'text-mango-500' },
    { name: 'Page Views', value: String(funnel.data?.pageViews ?? 0), icon: Eye, color: 'text-accent-purple' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track revenue, checkout conversion, course traction, and AI recommendations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted dark:bg-muted/20">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="mt-3">
                {overview.isLoading || funnel.isLoading ? <div className="h-8 w-24 animate-pulse rounded bg-muted" /> : <div className="text-2xl font-bold text-foreground">{stat.value}</div>}
                <div className="text-xs text-muted-foreground">{stat.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(overview.isError || funnel.isError) && (
        <Card className="border-red-200 bg-red-50/80 dark:border-red-500/30 dark:bg-red-500/10">
          <CardContent className="p-4 text-sm text-red-700 dark:text-red-200">Analytics could not be loaded. Check API auth and creator profile setup.</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Conversion Funnel</CardTitle><CardDescription>Real checkout events collected by the API</CardDescription></CardHeader>
          <CardContent>
            {funnel.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />)}</div>
            ) : (
              <div className="space-y-4">
                {funnelRows.map((step) => {
                  const percentage = Math.round((step.count / maxFunnel) * 100);
                  return (
                    <div key={step.stage}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{step.stage}</span>
                        <span className="text-muted-foreground">{step.count.toLocaleString()} · {percentage}%</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-to-r from-mango-500 to-accent-purple" style={{ width: `${percentage}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Courses</CardTitle><CardDescription>Published courses by learner count</CardDescription></CardHeader>
          <CardContent>
            {courses.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
            ) : !courses.data?.length ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No course data yet.</div>
            ) : (
              <div className="space-y-4">
                {courses.data.map((course, index) => (
                  <div key={course.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{course.title}</div>
                      <div className="text-xs text-muted-foreground">{course._count?.enrollments ?? 0} learners · {money(course.price, course.currency)}</div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent-purple/20 bg-gradient-to-r from-accent-purple/5 to-accent-cyan/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-purple/10">
            <BarChart3 className="h-6 w-6 text-accent-purple" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">AI Insight</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {Number(overview.data?.revenue ?? 0) > 0
                ? 'Revenue is flowing. Review checkout starts versus completed payments to decide whether to test a coupon or bundle.'
                : 'Your analytics pipeline is ready. Publish an offer and drive traffic to start collecting conversion data.'}
            </p>
          </div>
          <Button variant="outline" size="sm">Generate campaign idea</Button>
        </CardContent>
      </Card>
    </div>
  );
}
