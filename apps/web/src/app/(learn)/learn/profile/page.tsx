'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, UserCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser, useUpdateCurrentUser, useLogout } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  phone: z.string().max(40).optional(),
  avatarUrl: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function LearnerProfilePage() {
  const router = useRouter();
  const logout = useLogout();
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const updateUser = useUpdateCurrentUser();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '', avatarUrl: '' },
  });

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Logout failed');
    }
  }

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name ?? '',
      phone: user.phone ?? '',
      avatarUrl: user.avatarUrl ?? '',
    });
  }, [reset, user]);

  async function onSubmit(data: ProfileForm) {
    try {
      await updateUser.mutateAsync({ ...data, avatarUrl: data.avatarUrl || undefined });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Profile update failed');
    }
  }

  if (isLoading) return <div className="h-96 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />;
  if (isError || !user) return (
    <div className="rounded-2xl border border-error/30 bg-error/5 p-6 text-center text-sm font-medium text-error">
      {error instanceof Error ? error.message : 'Profile could not be loaded.'}
    </div>
  );

  return (
    <div className="space-y-10">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Profile Settings
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Edit your personal details, connection credentials, and avatar identity.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
          >
            Back to Hub
          </Link>
          <Button
            onClick={handleLogout}
            disabled={logout.isPending}
            variant="outline"
            className="rounded-xl border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-350 transition-all font-semibold text-xs py-2 px-4 h-auto gap-2"
          >
            <LogOut className="h-4 w-4 text-rose-450" />
            {logout.isPending ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
      </motion.div>

      {/* ── Edit Card ─────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 max-w-3xl mx-auto">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white mb-6">
          <UserCircle className="h-5 w-5 text-violet" />
          Identity Verification
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Custom Avatar Panel */}
          <div className="flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet/5 to-cyan/5 pointer-events-none" />
            
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-violet/10 border border-violet/30 font-display text-2xl font-bold text-violet flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet">Authorized Learner</span>
              <p className="font-display text-lg font-bold text-white truncate mt-0.5">{user.name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input 
              label="Name" 
              {...register('name')} 
              error={errors.name?.message} 
              className="rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-violet focus:ring-1 focus:ring-violet/30 py-2"
            />
            <Input 
              label="Phone" 
              {...register('phone')} 
              error={errors.phone?.message} 
              className="rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-violet focus:ring-1 focus:ring-violet/30 py-2"
            />
          </div>
          <Input 
            label="Avatar URL" 
            placeholder="https://..." 
            {...register('avatarUrl')} 
            error={errors.avatarUrl?.message} 
            className="rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-violet focus:ring-1 focus:ring-violet/30 py-2"
          />
          
          <Button 
            type="submit" 
            className="rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold px-6 py-2.5 h-auto gap-2" 
            disabled={updateUser.isPending}
          >
            <Save className="h-4 w-4" />
            {updateUser.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </div>
    </div>
  );
}
