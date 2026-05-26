'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Flag,
  Shield,
  FileText,
  Settings,
  ArrowLeft,
} from 'lucide-react';

const adminNav = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Creators', href: '/admin/creators', icon: GraduationCap },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Moderation', href: '/admin/moderation', icon: Shield },
  { name: 'Audit Logs', href: '/admin/logs', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-dark">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border-dark bg-surface-dark-card">
        <div className="flex h-16 items-center gap-2 border-b border-border-dark px-4">
          <span className="text-2xl">🥭</span>
          <span className="text-lg font-bold text-foreground">
            Skill<span className="text-mango-500">Mango</span>
          </span>
          <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-mango-500/10 text-mango-500'
                    : 'text-muted-foreground hover:bg-surface-dark-elevated hover:text-foreground',
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-dark p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface-dark-elevated hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5 flex-shrink-0" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      <div className="ml-60 p-6">{children}</div>
    </div>
  );
}