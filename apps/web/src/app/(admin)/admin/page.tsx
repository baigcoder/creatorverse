'use client';

import Link from 'next/link';
import { CreditCard, Database, GraduationCap, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAdminHealth, useAdminLogs, useAdminPayments } from '@/hooks/use-admin';

export default function AdminPage() {
  const health = useAdminHealth();
  const payments = useAdminPayments();
  const logs = useAdminLogs();
  const revenue = payments.data?.filter((order) => order.status === 'COMPLETED').reduce((sum, order) => sum + Number(order.amount), 0) ?? 0;
  const stats = [
    { name: 'Users', value: health.data?.users ?? 0, icon: Users, color: 'text-blue-500' },
    { name: 'Courses', value: health.data?.courses ?? 0, icon: GraduationCap, color: 'text-mango-500' },
    { name: 'Orders', value: health.data?.orders ?? 0, icon: CreditCard, color: 'text-green-500' },
    { name: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: Shield, color: 'text-accent-purple' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live platform health, revenue, audit, and moderation controls.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted dark:bg-muted/20">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="mt-3">
                {health.isLoading ? <div className="h-8 w-20 animate-pulse rounded bg-muted" /> : <div className="text-2xl font-bold text-foreground">{stat.value}</div>}
                <div className="text-xs text-muted-foreground">{stat.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>System Health</CardTitle><CardDescription>API and database status from the admin endpoint</CardDescription></CardHeader>
          <CardContent>
            {health.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">System health could not be loaded.</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm"><Database className="h-4 w-4 text-green-500" />Database</span><span className="text-sm font-medium text-green-500">{health.data?.database ?? 'checking'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm">Status</span><span className="text-sm font-medium text-green-500">{health.data?.status ?? 'checking'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm">Last check</span><span className="text-sm text-muted-foreground">{health.data?.checkedAt ? new Date(health.data.checkedAt).toLocaleString() : '—'}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Audit Events</CardTitle><CardDescription>Security-relevant actions</CardDescription></CardHeader>
          <CardContent>
            {logs.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
            ) : !logs.data?.length ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No audit events yet.</div>
            ) : (
              <div className="space-y-3">
                {logs.data.slice(0, 6).map((log) => (
                  <div key={log.id} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.actor?.email ?? 'system'} · {new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Users', href: '/admin/users', icon: Users },
          { title: 'Payments', href: '/admin/payments', icon: CreditCard },
          { title: 'Moderation', href: '/admin/moderation', icon: Shield },
          { title: 'Audit Logs', href: '/admin/logs', icon: Database },
        ].map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="transition hover:shadow-card-hover">
              <CardContent className="p-6">
                <action.icon className="h-5 w-5 text-mango-500" />
                <p className="mt-3 text-sm font-semibold text-foreground">{action.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
