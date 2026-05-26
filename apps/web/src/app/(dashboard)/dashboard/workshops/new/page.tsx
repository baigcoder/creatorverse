'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CalendarPlus, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateWorkshop } from '@/hooks/use-workshops';

const workshopSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(5000).optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    meetingProvider: z.enum(['ZOOM', 'GOOGLE_MEET', 'WEBRTC', 'OTHER']).default('ZOOM'),
    meetingUrl: z.string().url('Enter a valid meeting URL').optional().or(z.literal('')),
    price: z.number().min(0).default(0),
    currency: z.string().default('USD'),
    maxAttendees: z.number().int().positive().optional(),
  })
  .refine((data) => new Date(data.endTime).getTime() > new Date(data.startTime).getTime(), {
    path: ['endTime'],
    message: 'End time must be after start time',
  });

type WorkshopForm = z.infer<typeof workshopSchema>;

export default function NewWorkshopPage() {
  const router = useRouter();
  const createWorkshop = useCreateWorkshop();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkshopForm>({
    resolver: zodResolver(workshopSchema) as any,
    defaultValues: {
      meetingProvider: 'ZOOM',
      price: 0,
      currency: 'USD',
    },
  });

  async function onSubmit(data: WorkshopForm) {
    try {
      const workshop = await createWorkshop.mutateAsync({
        ...data,
        meetingUrl: data.meetingUrl || undefined,
        maxAttendees: data.maxAttendees || undefined,
      });
      toast.success('Workshop created');
      router.push(`/dashboard/workshops/${workshop.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create workshop');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/workshops">
          <Button variant="ghost" size="icon" aria-label="Back to workshops">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Workshop</h1>
          <p className="mt-1 text-sm text-muted-foreground">Schedule a live session with registration, reminders, and attendance tracking.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarPlus className="h-5 w-5 text-mango-500" />
              Workshop details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input label="Workshop title *" placeholder="Live Design Review" {...register('title')} error={errors.title?.message} />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea
                  placeholder="What will attendees learn in this session?"
                  className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mango-500 dark:border-border-dark"
                  {...register('description')}
                />
                {errors.description?.message && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Start date/time *" type="datetime-local" {...register('startTime')} error={errors.startTime?.message} />
                <Input label="End date/time *" type="datetime-local" {...register('endTime')} error={errors.endTime?.message} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Meeting provider</label>
                  <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm dark:border-border-dark" {...register('meetingProvider')}>
                    <option value="ZOOM">Zoom</option>
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="WEBRTC">Built-in live room</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <Input label="Meeting URL" placeholder="https://zoom.us/j/..." {...register('meetingUrl')} error={errors.meetingUrl?.message} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Price" type="number" min="0" step="0.01" {...register('price', { valueAsNumber: true })} error={errors.price?.message} />
                <Input label="Currency" placeholder="USD" {...register('currency')} error={errors.currency?.message} />
                <Input
                  label="Max attendees"
                  type="number"
                  min="1"
                  placeholder="100"
                  {...register('maxAttendees', { valueAsNumber: true })}
                  error={errors.maxAttendees?.message}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={createWorkshop.isPending}>
                  {createWorkshop.isPending ? 'Creating...' : 'Create workshop'}
                </Button>
                <Link href="/dashboard/workshops">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-accent-cyan/20 bg-accent-cyan/5">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-cyan/10">
              <Video className="h-6 w-6 text-accent-cyan" />
            </div>
            <h2 className="mt-4 font-semibold text-foreground">Launch checklist</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Set the exact session window so reminders and attendance tracking stay reliable.</p>
              <p>Add a meeting URL now, or use the status page later once your live room is ready.</p>
              <p>New workshops start as drafts. Switch them to scheduled from the detail page when you are ready.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
