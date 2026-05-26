'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bot, Mail, Megaphone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import apiFetch from '@/lib/api-client';

type EmailCampaignResult = {
  subject?: string;
  emails?: Array<{ subject?: string; body?: string }>;
  sequence?: Array<{ subject?: string; body?: string }>;
  body?: string;
};

export default function MarketingPage() {
  const [goal, setGoal] = useState('Launch a new course to warm audience');
  const [audience, setAudience] = useState('Creators and coaches');
  const [product, setProduct] = useState('SkillMango course');
  const [campaign, setCampaign] = useState<EmailCampaignResult | null>(null);
  const generate = useMutation({
    mutationFn: (payload: { goal: string; audience?: string; product?: string; tone?: string }) =>
      apiFetch<EmailCampaignResult>('/ai/email-campaign', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (data) => {
      setCampaign(data);
      toast.success('Campaign draft generated');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'AI campaign generation failed'),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    generate.mutate({ goal, audience, product, tone: 'premium, concise, creator-first' });
  }

  const emails = campaign?.emails ?? campaign?.sequence ?? (campaign?.body ? [{ subject: campaign.subject, body: campaign.body }] : []);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase text-mango-500">Creator Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Marketing automation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Generate campaign sequences today; delivery queues, segmentation, and scheduling are isolated for the next backend-depth package.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Bot className="h-5 w-5 text-accent-purple" />AI campaign brief</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Input label="Campaign goal" value={goal} onChange={(event) => setGoal(event.target.value)} />
              <Input label="Audience" value={audience} onChange={(event) => setAudience(event.target.value)} />
              <Input label="Offer / product" value={product} onChange={(event) => setProduct(event.target.value)} />
              <Button type="submit" disabled={generate.isPending} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {generate.isPending ? 'Generating...' : 'Generate campaign'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Campaign draft</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {generate.isPending ? (
              Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />)
            ) : generate.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">The campaign draft could not be generated.</div>
            ) : emails.length ? (
              emails.map((email, index) => (
                <div key={index} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-mango-500" />Email {index + 1}</div>
                  <h2 className="mt-3 font-semibold">{email.subject ?? campaign?.subject ?? 'Campaign email'}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{email.body ?? JSON.stringify(email, null, 2)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <Megaphone className="mx-auto h-8 w-8 text-mango-500" />
                <p className="mt-3 text-sm text-muted-foreground">Brief the AI to draft a launch sequence, reminder campaign, or community announcement.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
