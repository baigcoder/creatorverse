'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  icon?: string;
  name: string;
  description?: string;
  earnedAt?: string;
  className?: string;
}

export function Badge({ icon = '🏆', name, description, earnedAt, className }: BadgeProps) {
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl', earnedAt ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-muted opacity-50', className)}>
      <div className="text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{name}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {earnedAt && <span className="text-xs text-muted-foreground">{new Date(earnedAt).toLocaleDateString()}</span>}
    </div>
  );
}