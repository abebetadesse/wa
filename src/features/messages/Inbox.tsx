"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { useRealtime } from "@/features/realtime/RealtimeProvider";
import { Monogram } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";
import { Chat } from "./Chat";

interface ConversationSummary {
  id: string;
  counterpart: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
}

/** Conversation list + thread. `endpoint` lists conversations; `hrefFor` builds each thread link. */
export function Inbox({ endpoint, selectedId, hrefFor, emptyHint }: { endpoint: string; selectedId?: string; hrefFor: (id: string) => string; emptyHint: string }) {
  const [items, setItems] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await apiFetch<ConversationSummary[]>(endpoint));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load, selectedId]);

  useRealtime(["message.created"], () => load());

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return <LoadingState label="Loading messages…" />;
  if (items.length === 0 && !selectedId) return <EmptyState title="No messages yet" description={emptyHint} />;

  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <ul className={cn("flex flex-col gap-1 overflow-y-auto rounded-3xl border border-border bg-card p-2 lg:max-h-[70vh]", selectedId && "hidden lg:flex")}>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={hrefFor(item.id)}
              className={cn("flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors", item.id === selectedId ? "bg-brand/10" : "hover:bg-accent")}
              aria-current={item.id === selectedId ? "page" : undefined}
            >
              <Monogram name={item.counterpart ?? "?"} className="size-10 shrink-0 rounded-full text-sm" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center justify-between gap-2">
                  <span className={cn("truncate text-sm", item.unread ? "font-bold text-foreground" : "font-semibold text-foreground")}>{item.counterpart ?? "Client"}</span>
                  {item.lastMessageAt && <span className="shrink-0 text-[11px] text-muted-foreground">{new Date(item.lastMessageAt).toLocaleDateString()}</span>}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">{item.lastMessage ?? "No messages yet"}</span>
                  {item.unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-primary-foreground">{item.unread}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className={cn(!selectedId && "hidden lg:block")}>
        {selectedId ? (
          <Chat key={selectedId} conversationId={selectedId} title={selected?.counterpart ?? undefined} />
        ) : (
          <div className="flex h-full min-h-[28rem] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border text-muted-foreground">
            <MessageCircle className="size-8" aria-hidden="true" />
            <p className="text-sm">Choose a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
