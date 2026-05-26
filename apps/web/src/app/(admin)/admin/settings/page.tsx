'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Bot, CreditCard, Mail, Server, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/services';

const settings = [
  { icon: Shield, label: 'Auth mode', value: 'httpOnly cookies + CSRF' },
  { icon: CreditCard, label: 'Payments', value: 'Stripe primary, Razorpay scaffold' },
  { icon: Bot, label: 'AI routing', value: 'Provider abstraction enabled' },
  { icon: Mail, label: 'Email', value: 'Queue-backed delivery service' },
];

export default function AdminSettingsPage() {
  const health = useQuery({ queryKey: ['admin', 'system-health'], queryFn: adminApi.systemHealth });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase text-mango-500">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Platform settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Operational settings are shown as controlled production capabilities. Mutation controls should be added with audit-log-backed change approval.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {settings.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-mango-500" />
              <p className="mt-4 text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-cyan-500" />System health</CardTitle></CardHeader>
        <CardContent>
          {health.isLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          ) : health.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Health data could not be loaded for this admin session.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(health.data ?? { api: 'online' }).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4 text-green-500" />{key}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
