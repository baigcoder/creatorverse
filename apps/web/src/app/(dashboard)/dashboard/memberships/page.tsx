'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Crown, Plus, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateMembership, useMemberships } from '@/hooks/use-payments';

const schema = z.object({
  name: z.string().min(3, 'Plan name is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  interval: z.enum(['MONTHLY', 'YEARLY']),
  description: z.string().optional(),
  benefits: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function money(value: number | string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value));
}

export default function MembershipsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: plans = [], isLoading, isError, error } = useMemberships();
  const createPlan = useCreateMembership();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 19, interval: 'MONTHLY', description: '', benefits: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createPlan.mutateAsync({
        ...values,
        benefits: values.benefits?.split(',').map((benefit) => benefit.trim()).filter(Boolean) ?? [],
        status: 'PUBLISHED',
      });
      toast.success('Membership plan created');
      form.reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Plan creation failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Memberships</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create recurring tiers with benefits, community access, and renewal workflows.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((value) => !value)}>
          <Plus className="h-4 w-4" />
          Create membership
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New membership plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <Input label="Plan name" {...form.register('name')} error={form.formState.errors.name?.message} />
              <Input label="Price" type="number" step="0.01" {...form.register('price')} error={form.formState.errors.price?.message} />
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Interval
                <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" {...form.register('interval')}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </label>
              <Input label="Benefits (comma separated)" {...form.register('benefits')} />
              <div className="md:col-span-2">
                <Input label="Description" {...form.register('description')} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={createPlan.isPending}>
                  {createPlan.isPending ? 'Creating...' : 'Publish plan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <Crown className="h-5 w-5 text-mango-500" />
            <p className="mt-3 text-sm text-muted-foreground">Published plans</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{plans.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Users className="h-5 w-5 text-accent-purple" />
            <p className="mt-3 text-sm text-muted-foreground">Community access</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{plans.filter((plan) => plan.communityAccess).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Crown className="h-5 w-5 text-accent-cyan" />
            <p className="mt-3 text-sm text-muted-foreground">Lowest tier</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {plans.length ? money(Math.min(...plans.map((plan) => Number(plan.price))), plans[0]?.currency) : '$0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />)}</div>
      ) : isError ? (
        <Card><CardContent className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : 'Memberships could not be loaded.'}</CardContent></Card>
      ) : plans.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-10 text-center"><p className="font-medium">No membership plans yet</p><p className="mt-1 text-sm text-muted-foreground">Create a tier to start recurring revenue.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-mango-500">{plan.interval}</p>
                <h2 className="mt-2 text-xl font-bold text-foreground">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{plan.description || 'Member-only access plan'}</p>
                <p className="mt-5 text-3xl font-bold text-foreground">{money(plan.price, plan.currency)}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {(Array.isArray(plan.benefits) && plan.benefits.length ? plan.benefits : ['Community access', 'Member-only updates']).map((benefit) => (
                    <li key={benefit} className="flex gap-2"><span className="text-mango-500">•</span>{benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
