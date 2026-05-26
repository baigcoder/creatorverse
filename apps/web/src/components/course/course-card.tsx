'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Layers } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  currency?: string;
  level?: string;
  status?: string;
  enrollmentsCount?: number;
  lessonsCount?: number;
  duration?: number;
  creator?: { brandName: string; logoUrl?: string };
  onClick?: () => void;
  className?: string;
}

const levelColors: Record<string, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  INTERMEDIATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ADVANCED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-gray-100 text-gray-700',
  ARCHIVED: 'bg-red-100 text-red-700',
};

export function CourseCard({
  title, description, thumbnailUrl, price, currency = 'USD', level, status, enrollmentsCount, lessonsCount, creator, onClick, className,
}: CourseCardProps) {
  return (
    <Card className={cn('group cursor-pointer hover:shadow-card-hover transition-all duration-200 overflow-hidden', className)} onClick={onClick}>
      <div className="relative h-40 bg-gradient-to-br from-mango/20 to-accent-purple/20 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" unoptimized />
        ) : (
          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
        )}
        {status && (
          <span className={cn('absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full', statusColors[status] || statusColors.DRAFT)}>
            {status}
          </span>
        )}
        {level && (
          <span className={cn('absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full', levelColors[level] || '')}>
            {level}
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-mango transition-colors">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {enrollmentsCount !== undefined && (
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{enrollmentsCount}</span>
            )}
            {lessonsCount !== undefined && (
              <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{lessonsCount}</span>
            )}
          </div>
          {price !== undefined && (
            <span className="font-semibold text-sm">
              {price === 0 ? 'Free' : `${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price)}`}
            </span>
          )}
        </div>
        {creator && <p className="text-xs text-muted-foreground mt-2">by {creator.brandName}</p>}
      </CardContent>
    </Card>
  );
}
