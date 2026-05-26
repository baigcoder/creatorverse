'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useSidebarStore } from '@/stores';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="relative min-h-screen overflow-hidden bg-midnight text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,0,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,228,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-violet/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan/10 blur-[140px]" />
      <Sidebar />
      <div className={cn('relative z-10 transition-all duration-300', isOpen ? 'ml-64' : 'ml-[72px]')}>
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
