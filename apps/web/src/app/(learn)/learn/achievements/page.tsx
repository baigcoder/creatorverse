'use client';

import { Award, Flame, Medal, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAchievements, useBadges, useChallenges, useJoinChallenge, useLeaderboard, useStreak } from '@/hooks/use-gamification';
import { motion } from 'framer-motion';
import Link from 'next/link';

type Badge = { id: string; name: string; description?: string; iconUrl?: string };
type Achievement = { id?: string; badge?: Badge; earnedAt?: string };
type LeaderboardEntry = { userId?: string; name?: string; points?: number };
type Challenge = { id: string; title: string; description?: string; reward?: unknown };

export default function AchievementsPage() {
  const badges = useBadges();
  const achievements = useAchievements();
  const streak = useStreak();
  const leaderboard = useLeaderboard();
  const challenges = useChallenges();
  const joinChallenge = useJoinChallenge();

  async function join(id: string) {
    try {
      await joinChallenge.mutateAsync(id);
      toast.success('Challenge joined');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not join challenge');
    }
  }

  const earned = (achievements.data ?? []) as Achievement[];
  const availableBadges = (badges.data ?? []) as Badge[];
  const leaders = Array.isArray(leaderboard.data) ? (leaderboard.data as LeaderboardEntry[]) : ((leaderboard.data?.rankings ?? []) as LeaderboardEntry[]);
  const activeChallenges = (challenges.data ?? []) as Challenge[];

  return (
    <div className="space-y-10">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Achievements & Leaderboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Track system badges, game streaks, active quests, and top rankings.
          </p>
        </div>
        <Link
          href="/learn"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Hub
        </Link>
      </motion.div>

      {/* ── Summary Stats ──────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet/5 to-transparent pointer-events-none" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10 border border-violet/25">
            <Award className="h-5 w-5 text-violet" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Trophies Earned</p>
          <p className="mt-1.5 font-display text-3xl font-extrabold text-white">{earned.length}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent pointer-events-none" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 border border-warning/25">
            <Flame className="h-5 w-5 text-warning" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Current Streak</p>
          <p className="mt-1.5 font-display text-3xl font-extrabold text-white">{streak.data?.currentStreak ?? 0} Days</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 border border-cyan/25">
            <Trophy className="h-5 w-5 text-cyan" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Active Quests</p>
          <p className="mt-1.5 font-display text-3xl font-extrabold text-white">{activeChallenges.length}</p>
        </div>
      </div>

      {badges.isLoading || achievements.isLoading || streak.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-80 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : badges.isError || achievements.isError || streak.isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm font-medium text-error">
          Achievement data could not be loaded.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Trophy Cabinet ────────────────────────────── */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-bold text-white mb-5">Trophy Cabinet</h2>
            {availableBadges.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-8 text-center text-sm text-slate-500">
                No trophies detected in the system catalog.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {availableBadges.map((badge) => {
                  const isEarned = earned.some((achievement) => achievement.badge?.id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`group rounded-xl border p-4 transition-all duration-300 ${
                        isEarned
                          ? 'border-violet/20 bg-violet/5 hover:bg-violet/10 hover:shadow-[0_0_20px_rgba(255,0,184,0.06)]'
                          : 'border-white/[0.06] bg-white/[0.01] text-slate-500 opacity-60'
                      }`}
                    >
                      <Medal className={`h-6 w-6 ${isEarned ? 'text-violet animate-pulse' : 'text-slate-600'}`} />
                      <p className="mt-3 font-display text-sm font-bold text-white">{badge.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {badge.description || (isEarned ? 'Unlocked' : 'Locked')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── High Scores (Leaderboard) ───────────────────── */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-bold text-white mb-5">High Score Leaderboard</h2>
            {leaderboard.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : !leaders.length ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-8 text-center text-sm text-slate-500">
                No scoreboard rankings registered yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {leaders.slice(0, 8).map((entry, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const borderClass = rank === 1 ? 'border-violet/30' : rank === 2 ? 'border-cyan/30' : rank === 3 ? 'border-mango/30' : 'border-white/[0.06]';
                  const bgClass = rank === 1 ? 'bg-violet/5' : rank === 2 ? 'bg-cyan/5' : rank === 3 ? 'bg-mango/5' : 'bg-white/[0.01]';
                  const badgeColor = rank === 1 ? 'bg-violet text-white' : rank === 2 ? 'bg-cyan text-midnight' : rank === 3 ? 'bg-mango text-midnight' : 'bg-white/[0.08] text-slate-400';
                  
                  return (
                    <div
                      key={entry.userId ?? index}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all hover:scale-[1.01] ${borderClass} ${bgClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold ${badgeColor}`}>
                          {rank}
                        </span>
                        <span className="font-display text-sm font-bold text-white">
                          {entry.name ?? 'Anonymous Learner'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {entry.points ?? 0} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active Quests (Challenges) ─────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-bold text-white mb-5">Active Quest Logs</h2>
        {challenges.isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : activeChallenges.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-8 text-center text-sm text-slate-500">
            No active system quests available right now.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {activeChallenges.map((challenge) => (
              <div key={challenge.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col justify-between hover:border-cyan/20 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan">Quest Objective</span>
                  <p className="font-display text-base font-bold text-white mt-1">{challenge.title}</p>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {challenge.description || 'Complete this task target to secure exclusive XP points.'}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="mt-5 w-full rounded-xl bg-cyan text-midnight hover:bg-cyan/95 transition-colors font-semibold"
                  disabled={joinChallenge.isPending}
                  onClick={() => join(challenge.id)}
                >
                  Accept Quest
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
