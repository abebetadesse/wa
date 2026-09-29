"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, ErrorState, LoadingState } from "@/components/ui";
import { useRealtime } from "@/features/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderSide: "client" | "business";
  body: string;
  createdAt: string;
  readAt: string | null;
}

interface Thread {
  side: "client" | "business";
  messages: Message[];
}

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const day = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });

/** A live conversation thread. Messages from either side appear instantly via realtime events. */
export function Chat({ conversationId, title }: { conversationId: string; title?: string }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Thread>(`/api/conversations/${conversationId}/messages`);
      setThread(data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [conversationId]);

  useEffect(() => {
    setThread(null);
    load();
  }, [load]);

  useRealtime(["message.created"], (event) => {
    if (event.payload.conversationId !== conversationId) return;
    const message = event.payload.message as Message;
    setThread((current) => (current && !current.messages.some((m) => m.id === message.id) ? { ...current, messages: [...current.messages, message] } : current));
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread?.messages.length]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const message = await apiFetch<Message>(`/api/conversations/${conversationId}/messages`, { method: "POST", json: { body } });
      setDraft("");
      setThread((current) => (current && !current.messages.some((m) => m.id === message.id) ? { ...current, messages: [...current.messages, message] } : current));
    } catch (err) {
      setSendError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!thread) return <LoadingState label="Loading conversation…" />;

  let lastDay = "";
  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-border bg-card">
      {title && <div className="border-b border-border px-5 py-3 font-display font-bold text-foreground">{title}</div>}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5" aria-live="polite">
        {thread.messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Say selam 👋 — messages are private between you and this business.</p>}
        {thread.messages.map((message) => {
          const mine = message.senderSide === thread.side;
          const currentDay = day(message.createdAt);
          const showDay = currentDay !== lastDay;
          lastDay = currentDay;
          return (
            <div key={message.id}>
              {showDay && <p className="my-3 text-center text-xs font-semibold text-muted-foreground">{currentDay}</p>}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm", mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground")}>
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className={cn("mt-1 text-right text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{time(message.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {sendError && <Alert tone="danger" className="mx-4 mb-2">{sendError}</Alert>}
      <form onSubmit={send} className="flex items-end gap-2 border-t border-border p-3">
        <label htmlFor={`draft-${conversationId}`} className="sr-only">Message</label>
        <textarea
          id={`draft-${conversationId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={4000}
          placeholder="Write a message…"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button type="submit" disabled={!draft.trim() || sending} className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40" aria-label="Send">
          <Send className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
