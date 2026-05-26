'use client';

import { ReactNode, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useAdminCourses,
  useAdminCreators,
  useAdminLogs,
  useAdminModeration,
  useAdminPayments,
  useAdminReports,
  useAdminUsers,
  useModerateContent,
  useUpdateAdminUserStatus,
} from '@/hooks/use-admin';
import { AdminCourse, AdminCreator, AdminUser, AnalyticsReport, AuditLog, ModerationPost } from '@/services/admin';
import { Order } from '@/services/payments';

type Resource = 'users' | 'creators' | 'courses' | 'payments' | 'reports' | 'moderation' | 'logs';

type AdminListPageProps = {
  resource: Resource;
  title: string;
  description: string;
};

function normalize(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return JSON.stringify(value);
}

function statusPill(status?: string) {
  return <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">{status ?? '—'}</span>;
}

export function AdminListPage({ resource, title, description }: AdminListPageProps) {
  const [search, setSearch] = useState('');
  const users = useAdminUsers({ limit: 50, search: search || undefined });
  const creators = useAdminCreators();
  const courses = useAdminCourses();
  const payments = useAdminPayments();
  const reports = useAdminReports();
  const moderation = useAdminModeration();
  const logs = useAdminLogs();
  const updateStatus = useUpdateAdminUserStatus();
  const moderateContent = useModerateContent();

  const active = {
    users,
    creators,
    courses,
    payments,
    reports,
    moderation,
    logs,
  }[resource];

  const rows = useMemo(() => {
    if (resource === 'users') return users.data?.items ?? [];
    return (active.data as unknown[]) ?? [];
  }, [active.data, resource, users.data?.items]);

  async function changeUserStatus(user: AdminUser, status: string) {
    try {
      await updateStatus.mutateAsync({ id: user.id, status });
      toast.success(`User marked ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed');
    }
  }

  async function moderatePost(post: ModerationPost, action: 'PIN' | 'UNPIN' | 'REJECT' | 'DELETE') {
    try {
      await moderateContent.mutateAsync({ id: post.id, action, reason: `Admin ${action.toLowerCase()} action` });
      toast.success(`Post ${action.toLowerCase()} complete`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Moderation action failed');
    }
  }

  function renderRows() {
    if (resource === 'users') {
      return (rows as AdminUser[]).map((user) => (
        <tr key={user.id} className="border-b border-border/70 last:border-0">
          <td className="py-4 pr-4"><p className="font-medium text-foreground">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></td>
          <td className="py-4 pr-4">{user.role}</td>
          <td className="py-4 pr-4">{statusPill(user.status)}</td>
          <td className="py-4 pr-4">{new Date(user.createdAt).toLocaleDateString()}</td>
          <td className="py-4 text-right">
            <Button size="sm" variant="outline" disabled={updateStatus.isPending} onClick={() => changeUserStatus(user, user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}>
              {user.status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
            </Button>
          </td>
        </tr>
      ));
    }

    if (resource === 'creators') {
      return (rows as AdminCreator[]).map((creator) => (
        <tr key={creator.id} className="border-b border-border/70 last:border-0">
          <td className="py-4 pr-4"><p className="font-medium text-foreground">{creator.brandName}</p><p className="text-xs text-muted-foreground">{creator.slug}</p></td>
          <td className="py-4 pr-4">{creator.user?.email}</td>
          <td className="py-4 pr-4">{creator._count?.courses ?? 0} courses</td>
          <td className="py-4 pr-4">{creator._count?.orders ?? 0} orders</td>
          <td className="py-4 text-right">{normalize(creator.id.slice(0, 10))}</td>
        </tr>
      ));
    }

    if (resource === 'courses') {
      return (rows as AdminCourse[]).map((course) => (
        <tr key={course.id} className="border-b border-border/70 last:border-0">
          <td className="py-4 pr-4"><p className="font-medium text-foreground">{course.title}</p><p className="text-xs text-muted-foreground">{course.creator?.brandName}</p></td>
          <td className="py-4 pr-4">{statusPill(course.status)}</td>
          <td className="py-4 pr-4">{course.currency} {Number(course.price).toFixed(2)}</td>
          <td className="py-4 pr-4">{new Date(course.createdAt).toLocaleDateString()}</td>
          <td className="py-4 text-right">{course.id.slice(0, 10)}</td>
        </tr>
      ));
    }

    if (resource === 'payments') {
      return (rows as Order[]).map((order) => (
        <tr key={order.id} className="border-b border-border/70 last:border-0">
          <td className="py-4 pr-4"><p className="font-medium text-foreground">{order.id.slice(0, 10)}</p><p className="text-xs text-muted-foreground">{order.user?.email}</p></td>
          <td className="py-4 pr-4">{order.orderType}</td>
          <td className="py-4 pr-4">{order.currency} {Number(order.amount).toFixed(2)}</td>
          <td className="py-4 pr-4">{statusPill(order.status)}</td>
          <td className="py-4 text-right">{new Date(order.createdAt).toLocaleDateString()}</td>
        </tr>
      ));
    }

    if (resource === 'moderation') {
      return (rows as ModerationPost[]).map((post) => (
        <tr key={post.id} className="border-b border-border/70 last:border-0">
          <td className="py-4 pr-4"><p className="line-clamp-2 max-w-xl text-foreground">{post.content}</p><p className="text-xs text-muted-foreground">{post.room?.name}{post.pinned ? ' · Pinned' : ''}</p></td>
          <td className="py-4 pr-4">{post.author?.email}</td>
          <td className="py-4 pr-4">{new Date(post.createdAt).toLocaleDateString()}</td>
          <td className="py-4 text-right">
            <div className="flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="outline" disabled={moderateContent.isPending} onClick={() => moderatePost(post, post.pinned ? 'UNPIN' : 'PIN')}>
                {post.pinned ? 'Unpin' : 'Pin'}
              </Button>
              <Button size="sm" variant="outline" disabled={moderateContent.isPending} onClick={() => moderatePost(post, 'REJECT')}>Reject</Button>
              <Button size="sm" variant="destructive" disabled={moderateContent.isPending} onClick={() => moderatePost(post, 'DELETE')}>Delete</Button>
            </div>
          </td>
        </tr>
      ));
    }

    if (resource === 'logs') {
      return (rows as AuditLog[]).map((log) => (
        <tr key={log.id} className="border-b border-border/70 last:border-0">
          <td className="py-4 pr-4"><p className="font-medium text-foreground">{log.action}</p><p className="text-xs text-muted-foreground">{log.actor?.email ?? 'system'}</p></td>
          <td className="py-4 pr-4">{log.entityType}</td>
          <td className="py-4 pr-4">{log.entityId ?? '—'}</td>
          <td className="py-4 text-right">{new Date(log.createdAt).toLocaleString()}</td>
        </tr>
      ));
    }

    return (rows as AnalyticsReport[]).map((report) => (
      <tr key={report.id} className="border-b border-border/70 last:border-0">
        <td className="py-4 pr-4"><p className="font-medium text-foreground">{report.eventType}</p><p className="text-xs text-muted-foreground">{report.id.slice(0, 10)}</p></td>
        <td className="py-4 pr-4">{new Date(report.createdAt).toLocaleString()}</td>
        <td className="py-4 text-right">{normalize(report.metadata)}</td>
      </tr>
    ));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {resource === 'users' && <Input placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} className="sm:w-72" />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{resource === 'users' ? `${users.data?.total ?? 0} users` : `${rows.length} records`}</CardTitle>
        </CardHeader>
        <CardContent>
          {active.isLoading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>
          ) : active.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {active.error instanceof Error ? active.error.message : 'Admin data could not be loaded.'}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody>{renderRows()}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
