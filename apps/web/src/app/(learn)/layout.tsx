'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  Video,
  Users,
  Download,
  Award,
  Trophy,
  Sparkles,
  User,
} from 'lucide-react';

const learnerNav = [
  { name: 'Home', href: '/learn', icon: Home },
  { name: 'My Courses', href: '/learn/courses', icon: BookOpen },
  { name: 'Live Sessions', href: '/learn/workshops', icon: Video },
  { name: 'Community', href: '/learn/community', icon: Users },
  { name: 'Downloads', href: '/learn/downloads', icon: Download },
  { name: 'Certificates', href: '/learn/certificates', icon: Award },
  { name: 'Achievements', href: '/learn/achievements', icon: Trophy },
  { name: 'AI Tutor', href: '/learn/ai-tutor', icon: Sparkles },
  { name: 'Profile', href: '/learn/profile', icon: User },
];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-midnight text-white">
      {/* Top navigation — matches landing page glass nav */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-midnight/80 backdrop-blur-xl shadow-crt">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo — matches landing page */}
          <Link href="/learn" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl gradient-cta text-xs font-bold text-white border-2 border-foreground shadow-flat-sm group-hover:animate-pulse">
              CV
            </span>
            <span className="font-display text-lg font-bold text-white">
              Creator<span className="text-violet-400">verse</span>
              <span className="text-muted-foreground font-retro text-xs ml-1.5 font-normal lowercase">y2k</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 lg:flex">
            {learnerNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white shadow-[0_0_12px_rgba(255,0,184,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]',
                  )}
                >
                  <item.icon className={cn('h-3.5 w-3.5', isActive && 'text-violet')} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Tablet nav (medium screens) */}
          <div className="hidden sm:flex lg:hidden items-center gap-1">
            {learnerNav.slice(0, 4).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/10 text-white shadow-[0_0_12px_rgba(255,0,184,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]',
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet/40 bg-violet/15 text-sm font-bold text-violet hover:bg-violet/25 transition-colors cursor-pointer">
              U
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-midnight/95 backdrop-blur-xl sm:hidden">
        <div className="flex items-center justify-around py-2.5">
          {learnerNav.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all duration-200',
                  isActive ? 'text-violet' : 'text-slate-500',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
