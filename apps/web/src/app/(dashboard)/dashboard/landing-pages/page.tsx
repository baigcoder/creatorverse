'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, Globe2, Loader2, Plus, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { landingPagesApi } from '@/services';

export default function LandingPagesDashboardPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const pages = useQuery({ queryKey: ['landing-pages'], queryFn: landingPagesApi.list });
  const createPage = useMutation({
    mutationFn: landingPagesApi.create,
    onSuccess: () => {
      setTitle('');
      setSeoDescription('');
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast.success('Landing page created');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Page could not be created'),
  });
  const publishPage = useMutation({
    mutationFn: landingPagesApi.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast.success('Page published');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Publish failed'),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return toast.error('Add a page title first');
    createPage.mutate({ title: title.trim(), seoDescription: seoDescription.trim() || undefined });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-mango-500">Conversion Builder</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Landing pages</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create publish-ready offer pages with default SkillMango sections, SEO fields, and public slugs.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground">Pages</p><p className="text-2xl font-bold">{pages.data?.length ?? 0}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground">Published</p><p className="text-2xl font-bold">{pages.data?.filter((page: any) => page.status === 'PUBLISHED').length ?? 0}</p></div>
            <div className="rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground">Templates</p><p className="text-2xl font-bold">1</p></div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Plus className="h-5 w-5 text-mango-500" />Create page</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Input label="Page title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Creator launch masterclass" />
              <Input label="SEO description" value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} placeholder="Describe the offer for search and sharing" />
              <Button type="submit" disabled={createPage.isPending} className="w-full">
                {createPage.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                Create draft
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your pages</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pages.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />)
            ) : pages.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Landing pages could not be loaded.</div>
            ) : pages.data?.length ? (
              pages.data.map((page: any) => (
                <div key={page.id} className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-mango-500" />
                      <h2 className="font-semibold">{page.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">/{page.slug} · {page.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={publishPage.isPending || page.status === 'PUBLISHED'} onClick={() => publishPage.mutate(page.id)}>
                      <Globe2 className="mr-2 h-4 w-4" />Publish
                    </Button>
                    {page.status === 'PUBLISHED' && (
                      <Link href={`/lp/${page.slug}`} target="_blank">
                        <Button size="sm" variant="outline"><ExternalLink className="h-4 w-4" /></Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No landing pages yet. Create your first draft to start building a launch funnel.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
