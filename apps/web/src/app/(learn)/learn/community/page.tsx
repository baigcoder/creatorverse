'use client';

import Link from 'next/link';
import { CreditCard, Hash, Loader2, Lock, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDiscoverCommunities } from '@/hooks/use-community';
import { motion } from 'framer-motion';

export default function LearnerCommunityPage() {
  const communities = useDiscoverCommunities({ page: 1, limit: 20 });

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
            Community Servers
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Join creator-led community rooms, participate in discussion feeds, and chat with peers.
          </p>
        </div>
        <Link
          href="/learn"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Hub
        </Link>
      </motion.div>

      {/* ── Communities Listing ────────────────────────── */}
      {communities.isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : communities.isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm font-medium text-error">
          Communities could not be loaded.
        </div>
      ) : communities.data?.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {communities.data.map((community: any, index: number) => {
            const locked = Boolean(community.locked);
            const access = String(community.access ?? 'OPEN');
            const plans = community.creator?.membershipPlans ?? [];
            return (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet/20 hover:shadow-[0_0_30px_rgba(255,0,184,0.08)] overflow-hidden transition-all duration-300"
              >
                <div>
                  <div className="bg-gradient-to-r from-violet/10 to-cyan/10 border-b border-white/[0.06] p-5">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-white">
                      {locked ? <Lock className="h-4 w-4 text-slate-500" /> : <Users className="h-4 w-4 text-violet" />}
                      <span className="line-clamp-1">{community.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-2">
                      {community.description || 'Join this creator-led server on Creatorverse.'}
                    </p>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] border border-white/5 px-2 py-0.5 text-slate-300">
                        <Hash className="h-3 w-3 text-violet" /> {community._count?.rooms ?? 0} Rooms
                      </span>
                      <span className="line-clamp-1">Host: {community.creator?.brandName ?? 'Creator'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {!locked ? (
                    <Link href={`/learn/community/${community.id}`} className="block">
                      <Button className="w-full rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold text-xs py-2 h-auto">
                        Enter Server
                      </Button>
                    </Link>
                  ) : access === 'MEMBERSHIP_REQUIRED' ? (
                    <div className="space-y-3 rounded-xl border border-dashed border-white/10 p-3 bg-white/[0.01]">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Membership Ticket Required</p>
                      {plans.length ? (
                        <div className="space-y-2">
                          {plans.slice(0, 2).map((plan: any) => (
                            <Link key={plan.id} href={`/checkout/membership/${plan.id}`} className="block">
                              <Button variant="outline" className="w-full justify-between gap-2 rounded-xl border-white/10 text-slate-300 hover:bg-white/[0.05] text-xs py-2 h-auto">
                                <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />{plan.name}</span>
                                <span>{plan.currency} {Number(plan.price).toFixed(2)}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] uppercase text-slate-500">No active memberships released yet.</p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs uppercase tracking-wide text-slate-500 bg-white/[0.01]">
                      Private server. Entry by invite key only.
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-4 font-display text-lg font-bold text-white">No community servers found</p>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            You don&apos;t belong to any discussion servers yet. Discover new ones under course stages!
          </p>
        </div>
      )}

      {communities.isFetching && !communities.isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-5">
          <Loader2 className="h-4 w-4 animate-spin text-violet" /> Fetching updates...
        </div>
      )}
    </div>
  );
}
