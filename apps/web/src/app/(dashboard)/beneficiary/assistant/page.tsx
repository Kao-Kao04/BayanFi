'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { beneficiaryNav } from '@/lib/nav';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

const suggestions = [
  'Am I eligible for the scholarship program?',
  'What documents do I need?',
  'When will my aid arrive?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', text: 'Hi! I am the BayanFi assistant. Ask me about eligibility, requirements, or your application status.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post<{ reply: string }>('/ai/chat', { message: text });
      setMessages((m) => [...m, { role: 'assistant', text: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Sorry, I could not reach the assistant right now. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell title="BayanFi Assistant" nav={beneficiaryNav}>
      <Card className="glass-card flex h-[calc(100vh-10rem)] flex-col">
        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  m.role === 'assistant'
                    ? 'bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-inset ring-primary/10'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                {m.role === 'assistant' ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />}
              </div>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  m.role === 'assistant' ? 'bg-muted/60' : 'gradient-bg text-white'
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center rounded-2xl bg-muted/60 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </CardContent>

        <div className="border-t p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
            />
            <Button type="submit" variant="gradient" size="icon" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </DashboardShell>
  );
}
