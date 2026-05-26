'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Globe2, Save, Shield, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCurrentUser, useUpdateCurrentUser } from '@/hooks/use-auth';

const settingsSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  phone: z.string().max(40).optional(),
  avatarUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const updateUser = useUpdateCurrentUser();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: '', phone: '', avatarUrl: '' },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? '',
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
    });
  }, [reset, user]);

  async function onSubmit(data: SettingsForm) {
    try {
      await updateUser.mutateAsync({ ...data, avatarUrl: data.avatarUrl || undefined });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Settings update failed');
    }
  }

  if (isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;
  if (isError || !user) return <Card><CardContent className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : 'Settings could not be loaded.'}</CardContent></Card>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your creator account, branding readiness, and platform preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCog className="h-5 w-5 text-mango-500" />
              Account profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Name" {...register('name')} error={errors.name?.message} />
                <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
              </div>
              <Input label="Avatar URL" placeholder="https://..." {...register('avatarUrl')} error={errors.avatarUrl?.message} />
              <Button type="submit" className="gap-2" disabled={updateUser.isPending}>
                <Save className="h-4 w-4" />
                {updateUser.isPending ? 'Saving...' : 'Save settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <Shield className="h-5 w-5 text-green-500" />
              <p className="mt-3 font-medium text-foreground">Security</p>
              <p className="mt-1 text-sm text-muted-foreground">JWT sessions and refresh rotation are active. Password changes run through the secure reset flow.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <Globe2 className="h-5 w-5 text-accent-cyan" />
              <p className="mt-3 font-medium text-foreground">Branding</p>
              <p className="mt-1 text-sm text-muted-foreground">Custom domain and creator branding settings are modeled in the creator profile and ready for the next UI pass.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <Bell className="h-5 w-5 text-accent-purple" />
              <p className="mt-3 font-medium text-foreground">Notifications</p>
              <p className="mt-1 text-sm text-muted-foreground">In-app notifications and email queue delivery can be managed from the notifications module.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
