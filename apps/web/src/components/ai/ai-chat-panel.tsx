'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, BookOpen, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ lessonId: string; lessonTitle: string; sectionTitle: string }>;
  timestamp: Date;
}

interface AIChatPanelProps {
  onSendMessage: (message: string) => Promise<any>;
  courseId?: string;
  suggestedQuestions?: string[];
  className?: string;
}

export function AIChatPanel({ onSendMessage, courseId, suggestedQuestions, className }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await onSendMessage(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response?.answer || response?.content || response?.message || 'I couldn\'t find a specific answer. Consider asking your instructor for more help.',
        sources: response?.sources || response?.references,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date() };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultSuggestions = ['Can you summarize this lesson?', 'What are the key takeaways?', 'Give me a practice question', 'Explain this concept simpler'];

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-mango to-accent-purple flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">AI Tutor</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your course</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-mango/20 to-accent-purple/20 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-mango" />
            </div>
            <h3 className="font-semibold">Ask me anything</h3>
            <p className="text-sm text-muted-foreground mt-1">I can help you understand course content, quiz yourself, or find specific topics.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {(suggestedQuestions || defaultSuggestions).map((q, i) => (
                <button key={i} className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors" onClick={() => setInput(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-mango to-accent-purple flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', msg.role === 'user' ? 'bg-mango text-white' : 'bg-muted')}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium">Sources:</p>
                  {msg.sources.map((src, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3" />{src.lessonTitle || src.sectionTitle}</p>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-mango to-accent-purple flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mango/50"
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="h-10 w-10 rounded-xl bg-mango text-white flex items-center justify-center disabled:opacity-50 hover:bg-mango/90 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Card>
  );
}