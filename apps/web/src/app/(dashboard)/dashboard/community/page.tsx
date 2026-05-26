'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Hash, Heart, MessageCircle, Plus, Send, Volume2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAddReaction, useCommunities, useCommunityRooms, useCreateCommunity, useCreatePost, useRoomPosts } from '@/hooks/use-community';

const roomTypeIcons = {
  TEXT: Hash,
  VOICE: Volume2,
  ANNOUNCEMENT: Megaphone,
};

export default function CommunityPage() {
  const communities = useCommunities({ page: 1, limit: 20 });
  const createCommunity = useCreateCommunity();
  const createPost = useCreatePost();
  const addReaction = useAddReaction();
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newPost, setNewPost] = useState('');

  const communityList = communities.data ?? [];
  const activeCommunityId = selectedCommunityId || communityList[0]?.id || '';
  const rooms = useCommunityRooms(activeCommunityId);
  const roomList = rooms.data ?? [];
  const activeRoomId = selectedRoomId || roomList[0]?.id || '';
  const posts = useRoomPosts(activeRoomId, { page: 1, limit: 30 });
  const postList = posts.data ?? [];

  useEffect(() => {
    if (!selectedCommunityId && communityList[0]?.id) setSelectedCommunityId(communityList[0].id);
  }, [communityList, selectedCommunityId]);

  useEffect(() => {
    if (!roomList.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(roomList[0]?.id ?? '');
    }
  }, [roomList, selectedRoomId]);

  const activeCommunity = useMemo(
    () => communityList.find((community) => community.id === activeCommunityId),
    [activeCommunityId, communityList],
  );

  async function handleCreateCommunity() {
    const name = newCommunityName.trim();
    if (!name) return toast.error('Add a community name first');
    try {
      const community = await createCommunity.mutateAsync({ name, visibility: 'PUBLIC' });
      setNewCommunityName('');
      setSelectedCommunityId(community.id);
      toast.success('Community created');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Community could not be created');
    }
  }

  async function handlePostSubmit() {
    if (!activeRoomId) return toast.error('Create or select a room first');
    if (!newPost.trim()) return toast.error('Write a post first');
    try {
      await createPost.mutateAsync({ roomId: activeRoomId, data: { content: newPost.trim() } });
      setNewPost('');
      toast.success('Post published');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Post could not be published');
    }
  }

  async function react(postId: string) {
    try {
      await addReaction.mutateAsync({ postId, type: 'HEART' });
      toast.success('Reaction added');
      posts.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reaction failed');
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="rounded-2xl border-4 border-foreground bg-card p-5 shadow-elevated md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-retro text-sm uppercase tracking-wider text-muted-foreground">Community Operations</span>
            <h1 className="font-display text-3xl font-extrabold text-foreground">Community Console</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage real communities, rooms, posts, and reactions from the API.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={newCommunityName} onChange={(event) => setNewCommunityName(event.target.value)} placeholder="New community name" />
            <Button disabled={createCommunity.isPending} onClick={handleCreateCommunity}>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="font-display text-sm font-black uppercase text-foreground">Communities</h2>
              {communities.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
              ) : communityList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No communities yet. Create one to start posting.</p>
              ) : (
                communityList.map((community) => (
                  <button
                    key={community.id}
                    type="button"
                    onClick={() => setSelectedCommunityId(community.id)}
                    className={`w-full rounded-xl border-2 p-3 text-left text-sm font-bold transition ${activeCommunityId === community.id ? 'border-foreground bg-mango/20 text-foreground' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
                  >
                    {community.name}
                    <span className="mt-1 block text-xs font-medium text-muted-foreground">{community._count?.rooms ?? 0} rooms</span>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="font-display text-sm font-black uppercase text-foreground">Rooms</h2>
              {rooms.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-muted" />)}</div>
              ) : roomList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rooms found for this community.</p>
              ) : (
                roomList.map((room) => {
                  const Icon = roomTypeIcons[room.type as keyof typeof roomTypeIcons] ?? Hash;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${activeRoomId === room.id ? 'border-foreground bg-violet/15 text-foreground' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-bold">{room.name}</span>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4">
                <h2 className="font-display text-xl font-black text-foreground">{activeCommunity?.name ?? 'Community Feed'}</h2>
                <p className="text-sm text-muted-foreground">Posts are persisted through `/communities/rooms/:roomId/posts`.</p>
              </div>
              <div className="flex gap-3">
                <Input value={newPost} onChange={(event) => setNewPost(event.target.value)} placeholder="Share an update with this room..." />
                <Button disabled={createPost.isPending || !activeRoomId} onClick={handlePostSubmit}>
                  <Send className="mr-2 h-4 w-4" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {posts.isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />)}</div>
          ) : posts.isError ? (
            <Card><CardContent className="p-8 text-center text-sm text-red-600">{posts.error instanceof Error ? posts.error.message : 'Posts could not be loaded.'}</CardContent></Card>
          ) : postList.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No posts in this room yet.</CardContent></Card>
          ) : (
            postList.map((post) => (
              <Card key={post.id} className="border-2 border-border">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{post.author?.name ?? 'Member'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                    {post.pinned && <span className="rounded-full bg-mango px-2 py-1 text-xs font-bold text-foreground">Pinned</span>}
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.content}</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 hover:text-foreground" onClick={() => react(post.id)}>
                      <Heart className="h-4 w-4" />
                      {post._count?.reactions ?? post.reactions?.length ?? 0}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post._count?.comments ?? post.comments?.length ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
