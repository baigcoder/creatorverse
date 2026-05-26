'use client';

import Link from 'next/link';
import { Bell, Search, Sparkles, Plus } from 'lucide-react';
import { useSidebarStore, useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const { toggle: toggleSidebar } = useSidebarStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-midnight/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search */}
        <div className="hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search anything..."
              className="h-10 w-72 rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-violet/40 focus:outline-none focus:ring-1 focus:ring-violet/30"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick action */}
        <Button variant="gradient" size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Plus className="h-3.5 w-3.5" />
          Create
        </Button>

        {/* AI Studio */}
        <Link href="/dashboard/ai-studio">
          <Button variant="ghost" size="icon" className="border border-transparent text-slate-400 hover:border-violet/20 hover:bg-violet/10 hover:text-violet-200">
            <Sparkles className="h-[18px] w-[18px]" />
          </Button>
        </Link>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative border border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.06] hover:text-white">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet" />
        </Button>

        {/* Avatar */}
        <div className="ml-1 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-2.5 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet/20 text-xs font-bold text-violet-300">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white">{user?.name || 'Creator'}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">{user?.role || 'Pro Plan'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
