'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTutorChat } from '@/hooks/use-ai';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ sourceType: string; sourceId: string | null; preview: string }>;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hi! I\'m your AI Tutor. I can answer questions about your course content, explain difficult concepts, create practice questions, and summarize lessons. What would you like to know?',
    timestamp: new Date(),
  },
];

const suggestedQuestions = [
  'Explain the concept of design systems',
  'What are the key principles of UX research?',
  'Create practice questions about wireframing',
  'Summarize the lesson on user testing',
];

export default function AITutorPage() {
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tutorChat = useTutorChat();

  useEffect(() => {
    setCourseId(new URLSearchParams(window.location.search).get('courseId') ?? undefined);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tutorChat.isPending]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || tutorChat.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const result = await tutorChat.mutateAsync({ question, courseId, conversationId });
      setConversationId(result.conversationId);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI tutor could not answer right now.';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col space-y-5">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            AI Tutor Console
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Ask questions, summarize lessons, and query your course knowledge database.
          </p>
        </div>
        <Link
          href="/learn"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Hub
        </Link>
      </motion.div>

      {/* Messages Console */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 items-start ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                message.role === 'assistant'
                  ? 'border-violet/30 bg-violet/10 text-violet'
                  : 'border-cyan/30 bg-cyan/10 text-cyan'
              }`}>
                {message.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              
              <div className={`max-w-[75%] rounded-2xl border p-4 text-sm leading-relaxed ${
                message.role === 'assistant'
                  ? 'border-white/[0.06] bg-white/[0.03] text-slate-300'
                  : 'border-violet/20 bg-violet/10 text-white font-medium'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-2.5">
                    {message.sources.map((source) => (
                      <span
                        key={`${source.sourceType}-${source.sourceId ?? source.preview}`}
                        title={source.preview}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase"
                      >
                        <BookOpen className="h-3 w-3 text-cyan" />
                        {source.sourceType}{source.sourceId ? `: ${source.sourceId.slice(0, 8)}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {tutorChat.isPending && (
            <div className="flex gap-3 items-start">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-violet/30 bg-violet/10 text-violet">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              onClick={() => handleSuggestion(question)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input Terminal */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question about your course..."
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet/30 transition-all"
        />
        <Button 
          onClick={handleSend} 
          disabled={!input.trim() || tutorChat.isPending} 
          className="rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold text-xs py-3 px-5 h-auto gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
