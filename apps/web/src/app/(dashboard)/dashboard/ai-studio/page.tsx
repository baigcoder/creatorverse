'use client';

import { useState } from 'react';
import { Bot, FileText, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCourseOutline, useEmailCampaign, useLandingCopy, useLessonScript, useQuizGenerate } from '@/hooks/use-ai';

type ResultValue = Record<string, unknown> | unknown[] | string | null;

function ResultPanel({ value }: { value: ResultValue }) {
  if (!value) {
    return <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Generated output will appear here.</div>;
  }

  return (
    <pre className="max-h-[520px] overflow-auto rounded-2xl border bg-muted/40 p-4 text-xs leading-6 text-foreground dark:border-border-dark">
      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function AiStudioPage() {
  const [result, setResult] = useState<ResultValue>(null);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [content, setContent] = useState('');
  const courseOutline = useCourseOutline();
  const lessonScript = useLessonScript();
  const quiz = useQuizGenerate();
  const landingCopy = useLandingCopy();
  const emailCampaign = useEmailCampaign();

  async function run(label: string, action: () => Promise<unknown>) {
    try {
      const output = await action();
      setResult(output as ResultValue);
      toast.success(`${label} generated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${label} generation failed`);
    }
  }

  const isBusy = courseOutline.isPending || lessonScript.isPending || quiz.isPending || landingCopy.isPending || emailCampaign.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate course outlines, lessons, quizzes, landing copy, and campaigns from one creator cockpit.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <Card className="border-accent-purple/20 bg-gradient-to-br from-accent-purple/5 to-accent-cyan/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-accent-purple" />
                Prompt inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Topic / title" placeholder="AI-powered personal branding" value={topic} onChange={(event) => setTopic(event.target.value)} />
              <Input label="Audience" placeholder="Coaches, creators, beginners" value={audience} onChange={(event) => setAudience(event.target.value)} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Source content</label>
                <textarea
                  className="min-h-36 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mango-500 dark:border-border-dark"
                  placeholder="Paste lesson notes, offer details, or campaign context..."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Button
              className="justify-start gap-2"
              disabled={isBusy || topic.trim().length < 3}
              onClick={() => run('Course outline', () => courseOutline.mutateAsync({ topic, audience, level: 'BEGINNER', duration: '4 weeks' }))}
            >
              <Sparkles className="h-4 w-4" />
              Generate course outline
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={isBusy || topic.trim().length < 3}
              onClick={() => run('Lesson script', () => lessonScript.mutateAsync({ title: topic, topic, level: 'BEGINNER', duration: '10 minutes' }))}
            >
              <FileText className="h-4 w-4" />
              Generate lesson script
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={isBusy || content.trim().length < 10}
              onClick={() => run('Quiz', () => quiz.mutateAsync({ content, questionType: 'MCQ', questionCount: 5, difficulty: 'BEGINNER' }))}
            >
              <Bot className="h-4 w-4" />
              Generate quiz
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={isBusy || topic.trim().length < 3}
              onClick={() => run('Landing copy', () => landingCopy.mutateAsync({ courseTitle: topic, courseDescription: content, targetAudience: audience }))}
            >
              <Sparkles className="h-4 w-4" />
              Generate landing copy
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              disabled={isBusy || topic.trim().length < 3}
              onClick={() => run('Email campaign', () => emailCampaign.mutateAsync({ goal: topic, audience, product: content, tone: 'friendly and conversion-focused' }))}
            >
              <Mail className="h-4 w-4" />
              Generate email campaign
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated output</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultPanel value={result} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
