'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface WorkshopCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  startTime: string;
  endTime: string;
  price?: number;
  currency?: string;
  status?: string;
  maxAttendees?: number;
  registeredCount?: number;
  meetingProvider?: string;
  onClick?: () => void;
  className?: string;
}

export function WorkshopCard({
  title, description, startTime, endTime, price, currency = 'USD', status, maxAttendees, registeredCount, meetingProvider, onClick, className,
}: WorkshopCardProps) {
  const isLive = status === 'LIVE';
  const isUpcoming = status === 'SCHEDULED' && new Date(startTime) > new Date();

  return (
    <Card className={cn('group cursor-pointer hover:shadow-card-hover transition-all duration-200 overflow-hidden', className)} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isLive && <span className="flex items-center gap-1 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />LIVE</span>}
              {isUpcoming && <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Upcoming</span>}
              {status === 'COMPLETED' && <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Completed</span>}
            </div>
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-mango transition-colors">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
          </div>
          {price !== undefined && (
            <span className="font-semibold text-sm shrink-0">
              {price === 0 ? 'Free' : `${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price)}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(startTime)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {maxAttendees !== undefined && (
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{registeredCount ?? 0}/{maxAttendees}</span>
          )}
          {meetingProvider && <span className="flex items-center gap-1"><ExternalLink className="h-3 w-3" />{meetingProvider}</span>}
        </div>
      </CardContent>
    </Card>
  );
}