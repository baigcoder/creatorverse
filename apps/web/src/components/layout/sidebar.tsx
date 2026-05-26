'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Users,
  CreditCard,
  Package,
  Sparkles,
  BarChart3,
  Megaphone,
  PanelsTopLeft,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LogOut,
  HelpCircle,
  Image,
  ShieldCheck,
} from 'lucide-react';

const navSections = [
  {
    label: '',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Products',
    items: [
      { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
      { name: 'Workshops', href: '/dashboard/workshops', icon: Video },
      { name: 'Memberships', href: '/dashboard/memberships', icon: ShieldCheck },
      { name: 'Digital Products', href: '/dashboard/products', icon: Package },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Feed', href: '/dashboard/community', icon: Users },
      { name: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Insights', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    ],
  },
  {
    label: 'Tools',
    items: [
      { name: 'AI Studio', href: '/dashboard/ai-studio', icon: Sparkles },
      { name: 'Media', href: '/dashboard/media', icon: Image },
      { name: 'Landing Pages', href: '/dashboard/landing-pages', icon: PanelsTopLeft },
    ],
  },
];

const bottomNav = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.08] bg-midnight-raised/95 backdrop-blur-xl transition-all duration-300',
        isOpen ? 'w-64' : 'w-[72px]',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl gradient-cta text-xs font-bold text-white border-2 border-foreground shadow-flat-sm">
            CV
          </span>
          {isOpen && (
            <span className="font-display text-base font-bold text-white tracking-tight">
              Creator<span className="text-violet-400">verse Y2K</span>
            </span>
          )}
        </Link>
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {isOpen && (
          <div className="mb-4 rounded-2xl border border-violet/20 bg-gradient-to-r from-violet/12 to-cyan/8 p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">Creator Deck</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-300">Run your products, audience, AI tools, and monetization from one console.</p>
          </div>
        )}
        {navSections.map((section) => (
          <div key={section.label || 'main'} className="mb-1">
            {section.label && isOpen && (
              <p className="mb-2 mt-4 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {section.label}
              </p>
            )}
            {!section.label ? null : !isOpen && <div className="my-3 border-t border-white/[0.06]" />}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border-violet/30 bg-violet/15 text-violet-200 shadow-[0_0_24px_rgba(255,0,184,0.12)]'
                      : 'border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.06] hover:text-white',
                    !isOpen && 'justify-center px-2',
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon className={cn('h-[18px] w-[18px] flex-shrink-0', isActive && 'text-violet-300')} />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.08] px-3 py-3">
        {bottomNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-violet/30 bg-violet/15 text-violet-200'
                  : 'border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.06] hover:text-white',
                !isOpen && 'justify-center px-2',
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}

        <div className="mt-2 border-t border-white/[0.08] pt-3">
          <Link
            href="/learn"
            className={cn(
              'flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-white/8 hover:bg-white/[0.06] hover:text-white',
              !isOpen && 'justify-center px-2',
            )}
          >
            <GraduationCap className="h-[18px] w-[18px] flex-shrink-0" />
            {isOpen && <span>Student View</span>}
          </Link>
          <button
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300',
              !isOpen && 'justify-center px-2',
            )}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            {isOpen && <span>Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
