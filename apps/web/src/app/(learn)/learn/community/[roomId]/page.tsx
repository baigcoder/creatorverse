'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Hash, Lock, MessageCircle, Send, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccessibleCommunity, useCommunityRooms, useCreatePost, useRoomPosts } from '@/hooks/use-community';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LearnerCommunityRoomPage() {
  const params = useParams<{ roomId: string }>();
  const community = useAccessibleCommunity(params.roomId);
  const rooms = useCommunityRooms(params.roomId);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const activeRoomId = selectedRoomId ?? rooms.data?.[0]?.id ?? '';
  const posts = useRoomPosts(activeRoomId, { page: 1, limit: 30 });
  const createPost = useCreatePost();
  const [content, setContent] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRoomId || !content.trim()) return;
    try {
      await createPost.mutateAsync({ roomId: activeRoomId, data: { content: content.trim(), mediaUrls: [] } });
      setContent('');
      toast.success('Post published');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Post could not be created');
    }
  }

  if (community.isError) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] text-center p-10 max-w-xl mx-auto">
        <Lock className="mx-auto h-12 w-12 text-violet animate-bounce" />
        <h1 className="mt-4 font-display text-lg font-bold text-white">Server Locked</h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          This community server is private. Please purchase a membership plan or request an invite key from the creator to access room channels.
        </p>
      </div>
    );
  }

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
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet">Community Room</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white mt-1">
            {community.data?.name ?? 'Server Channel'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {community.data?.description ?? 'Discuss system specifics and share signals with peers.'}
          </p>
        </div>
        <Link
          href="/learn/community"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Servers
        </Link>
      </motion.div>

      {/* ── Layout Grid ───────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Channels */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 lg:sticky lg:top-24 lg:h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Channels</h2>
          <div className="space-y-1.5">
            {rooms.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
              ))
            ) : null}
            {rooms.data?.map((room: any) => {
              const active = activeRoomId === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                    active
                      ? 'border-violet/20 bg-violet/10 text-white shadow-[0_0_12px_rgba(255,0,184,0.15)] font-semibold'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Hash className={`h-4 w-4 ${active ? 'text-violet' : 'text-slate-500'}`} />
                  <span className="text-sm font-medium">{room.name}</span>
                </button>
              );
            })}
            {!rooms.isLoading && !rooms.data?.length && (
              <p className="text-xs text-slate-500 italic">No channels created.</p>
            )}
          </div>
        </div>

        {/* Message Feed & Creation */}
        <div className="space-y-5">
          {/* Post Creation */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <form onSubmit={submit} className="flex gap-3">
              <Input
                aria-label="Create post"
                placeholder="Share thoughts, questions, or updates in this room..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-violet focus:ring-1 focus:ring-violet/30 py-2.5 flex-1"
              />
              <Button
                type="submit"
                disabled={!activeRoomId || createPost.isPending}
                className="rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Posts list */}
          {posts.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
            ))
          ) : posts.isError ? (
            <div className="rounded-2xl border border-error/30 bg-error/5 p-6 text-center text-sm font-medium text-error">
              Posts could not be loaded.
            </div>
          ) : posts.data?.length ? (
            posts.data.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet/20 hover:shadow-[0_0_30px_rgba(255,0,184,0.08)] p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
                  <div>
                    <p className="font-display text-sm font-bold text-white">
                      {post.author?.name ?? 'Community Member'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Posted on: {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-white/[0.06] border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-300">
                    <ThumbsUp className="h-3.5 w-3.5 text-violet" /> {post._count?.reactions ?? 0}
                  </span>
                </div>
                
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {post.content}
                </p>
                
                <div className="mt-5 pt-3.5 border-t border-dashed border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <MessageCircle className="h-4 w-4 text-cyan" /> {post._count?.comments ?? 0} comments
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
              No conversations registered in this channel yet. Be the first to start!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
