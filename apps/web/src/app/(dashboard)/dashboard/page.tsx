'use client';

import Link from 'next/link';
import { AlertCircle, ArrowUpRight, BookOpen, Calendar, CheckCircle2, DollarSign, Plus, ServerCog, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatorOverview, useFunnelAnalytics } from '@/hooks/use-analytics';
import { useCourses } from '@/hooks/use-courses';
import { useOrders } from '@/hooks/use-payments';
import { useWorkshops } from '@/hooks/use-workshops';

function money(value: number | string | undefined, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value ?? 0));
}

function relativeDate(value?: string) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes || 1} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground dark:border-border-dark">{label}</div>;
}

export default function DashboardPage() {
  const overview = useCreatorOverview();
  const funnel = useFunnelAnalytics();
  const courses = useCourses({ page: 1, limit: 50 });
  const workshops = useWorkshops({ page: 1, limit: 8 });
  const orders = useOrders(1, 6);

  const courseList = courses.data ?? [];
  const workshopList = workshops.data ?? [];
  const orderList = orders.data ?? overview.data?.recentOrders ?? [];
  const publishedCourses = courseList.filter((course) => course.status === 'PUBLISHED').length;
  const upcomingWorkshops = workshopList.filter((workshop) => ['SCHEDULED', 'LIVE'].includes(workshop.status));
  const isLoading = overview.isLoading || courses.isLoading || workshops.isLoading;
  const isError = overview.isError || courses.isError || workshops.isError || funnel.isError || orders.isError;

  const checklist = [
    { label: 'Create your first course', done: courseList.length > 0 },
    { label: 'Publish a course', done: publishedCourses > 0 },
    { label: 'Schedule a workshop', done: upcomingWorkshops.length > 0 },
    { label: 'Receive a completed order', done: orderList.some((order) => order.status === 'COMPLETED') },
    { label: 'Generate learner activity', done: Number(overview.data?.activeLearners ?? 0) > 0 },
  ];
  const completedCount = checklist.filter((item) => item.done).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  const kpis = [
    { label: 'Revenue', value: money(overview.data?.revenue), hint: 'Completed creator orders', icon: DollarSign },
    { label: 'Active Learners', value: String(overview.data?.activeLearners ?? 0), hint: `${overview.data?.enrollments ?? 0} enrollments`, icon: Users },
    { label: 'Published Courses', value: String(publishedCourses), hint: `${courseList.length} total courses`, icon: BookOpen },
    { label: 'Community Posts', value: String(overview.data?.communityPosts ?? 0), hint: 'Learner engagement', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm dark:border-border-dark">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Creator Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">Production command center</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Live API-backed metrics from analytics, orders, courses, workshops, and onboarding state.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/courses/new">
              <Button className="gap-2"><Plus className="h-4 w-4" />New Course</Button>
            </Link>
            <Link href="/dashboard/workshops">
              <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" />Workshops</Button>
            </Link>
          </div>
        </div>
        {isError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            Some dashboard data could not be loaded. The available panels are still rendered.
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-muted p-2"><kpi.icon className="h-5 w-5 text-foreground" /></div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{isLoading ? '...' : kpi.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><ServerCog className="h-5 w-5" />Checkout Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {funnel.isLoading ? (
              <div className="h-40 animate-pulse rounded-xl bg-muted" />
            ) : funnel.data ? (
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ['Page views', funnel.data.pageViews],
                  ['Checkout starts', funnel.data.startedCheckout],
                  ['Payments', funnel.data.completedPayment],
                  ['Enrollments', funnel.data.enrollments],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border p-4 dark:border-border-dark">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No funnel events yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Readiness</span><span>{progress}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-muted">
                <div className="h-full rounded-full bg-mango-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-4 w-4 ${item.done ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={item.done ? 'text-muted-foreground line-through' : 'text-foreground'}>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>
            ) : orderList.length ? (
              orderList.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border p-3 dark:border-border-dark">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.orderType} order</p>
                    <p className="text-xs text-muted-foreground">{relativeDate(order.createdAt)} · {order.status}</p>
                  </div>
                  <p className="font-semibold">{money(order.amount, order.currency)}</p>
                </div>
              ))
            ) : (
              <EmptyState label="No orders yet. Completed orders will appear here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Workshops</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workshops.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>
            ) : upcomingWorkshops.length ? (
              upcomingWorkshops.slice(0, 6).map((workshop) => (
                <Link key={workshop.id} href={`/dashboard/workshops/${workshop.id}`} className="block rounded-xl border p-3 transition hover:bg-muted dark:border-border-dark">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{workshop.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(workshop.startTime).toLocaleString()} · {workshop._count?.registrations ?? 0} registrations</p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">{workshop.status}</span>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState label="No scheduled workshops yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
