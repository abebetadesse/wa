"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpenCheck, Eye, EyeOff, Layers, Pin, PinOff, Plus, Search, Sparkles, X } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, ErrorState, Input, LoadingState, PageHeader } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { cn } from "@/lib/utils";
import { GROUP_LABELS, STRAND_LABELS } from "@/features/toolkit/labels";

interface Tool {
  key: string;
  name: string;
  description: string;
  group: string;
  href: string;
  audience: string;
  strands: string[];
}

interface Toolkit {
  business: { id: string; name: string; category: string; categorySlug: string };
  tools: (Tool & { pinned: boolean; sets: string[]; added: boolean; opens: number; score: number })[];
  hidden: Tool[];
  recommendations: (Tool & { reasons: string[]; score: number })[];
  strands: { strand: string; weight: number; tools: string[] }[];
  sets: {
    subscribed: { id: string; name: string; description: string; guidance: string | null; version: number; updated: boolean; origin: string; toolKeys: string[]; strands: string[] }[];
    available: { id: string; name: string; description: string; version: number; forYourCategory: boolean; toolKeys: string[]; strands: string[] }[];
  };
  catalogue: Tool[];
  activity: { opens60: number; topTools: { key: string; name: string; weight: number }[] };
}

export default function ToolkitPage() {
  const { business, can } = useWorkspace();
  const toast = useToast();
  const base = `/api/workspace/businesses/${business.id}/toolkit`;
  const { data, error, reload } = useApi<Toolkit>(base, { liveTypes: ["toolkit."] });
  const [browsing, setBrowsing] = useState(false);
  const editable = can("manageToolkit");

  async function choose(key: string, body: { state?: "added" | "hidden" | "default"; pinned?: boolean }, message?: string) {
    try {
      await apiFetch(`${base}/tools/${encodeURIComponent(key)}`, { method: "PUT", json: body });
      if (message) toast({ tone: "success", title: message });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not update your toolkit", body: errorMessage(err) });
    }
  }

  async function setAction(setId: string, action: "subscribe" | "remove" | "seen", message?: string) {
    try {
      await apiFetch(`${base}/sets/${setId}`, { method: "POST", json: { action } });
      if (message) toast({ tone: "success", title: message });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not update knowledge sets", body: errorMessage(err) });
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState label="Gathering your toolkit…" />;

  const openHref = (tool: Tool) => (tool.href.startsWith("/") ? `${tool.href}${tool.href.includes("?") ? "&" : "?"}toolkit=${business.id}` : tool.href);
  const nameOf = (key: string) => data.catalogue.find((tool) => tool.key === key)?.name ?? key;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Toolkit"
        description={`Knowledge and tools for your practice as a ${data.business.category.toLowerCase()}. It learns from the services you offer, what clients book and what your team opens.`}
        actions={editable ? <Button variant="outline" onClick={() => setBrowsing(true)}><Search className="size-4" aria-hidden="true" /> Browse all tools</Button> : undefined}
        className="mb-0"
      />

      {data.sets.subscribed.filter((set) => set.updated).map((set) => (
        <Alert key={set.id} tone="info" title={`${set.name} was updated (version ${set.version})`}>
          {set.guidance ?? set.description}{" "}
          <button type="button" className="font-semibold text-brand underline" onClick={() => setAction(set.id, "seen")}>Got it</button>
        </Alert>
      ))}

      {/* Your tools */}
      <section aria-labelledby="my-tools">
        <h2 id="my-tools" className="mb-3 font-display text-lg font-bold text-foreground">Your tools</h2>
        {data.tools.length === 0 ? (
          <EmptyState title="No tools yet" description="Follow a knowledge set below or add tools from the recommendations." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.tools.map((tool) => (
              <Card key={tool.key} className={cn("flex flex-col transition-colors hover:border-brand/40", tool.pinned && "border-gold/50")}>
                <CardContent className="flex flex-1 flex-col gap-3 pt-5">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <Badge tone={tool.group === "care_pathway" ? "gold" : tool.group === "evidence" ? "brand" : "neutral"}>{GROUP_LABELS[tool.group] ?? tool.group}</Badge>
                      <h3 className="mt-2 font-semibold text-foreground">{tool.name}</h3>
                    </div>
                    {editable && (
                      <div className="flex shrink-0">
                        <button type="button" onClick={() => choose(tool.key, { pinned: !tool.pinned })} aria-label={tool.pinned ? `Unpin ${tool.name}` : `Pin ${tool.name}`} className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-gold">
                          {tool.pinned ? <PinOff className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
                        </button>
                        <button type="button" onClick={() => choose(tool.key, { state: "hidden" }, `${tool.name} hidden`)} aria-label={`Hide ${tool.name}`} className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-danger">
                          <EyeOff className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground">{tool.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {tool.sets.length > 0 && <span className="inline-flex items-center gap-1"><Layers className="size-3.5" aria-hidden="true" /> {tool.sets.join(", ")}</span>}
                    {tool.opens > 0 && <span>· opened {tool.opens}× lately</span>}
                  </div>
                  <Link href={openHref(tool)} className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-brand-strong">
                    Open
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-gold" aria-hidden="true" /> Recommended for you</CardTitle>
            <CardDescription>Based on your category, the services clients book with you and what your team uses.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing new right now. Recommendations sharpen as you take bookings and use tools.</p>
            ) : (
              data.recommendations.map((tool) => (
                <div key={tool.key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.reasons.join(" · ")}</p>
                  </div>
                  <Link href={openHref(tool)} className="text-sm font-semibold text-brand hover:underline">Preview</Link>
                  {editable && <Button size="sm" onClick={() => choose(tool.key, { state: "added" }, `${tool.name} added`)}><Plus className="size-4" aria-hidden="true" /> Add</Button>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Connected strands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpenCheck className="size-5 text-brand" aria-hidden="true" /> Your knowledge strands</CardTitle>
            <CardDescription>The knowledge your practice draws on most, from the tools you use and follow.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.strands.length === 0 ? (
              <p className="text-sm text-muted-foreground">Open a few tools and your strands will appear here.</p>
            ) : (
              data.strands.map((entry) => (
                <div key={entry.strand}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{STRAND_LABELS[entry.strand] ?? entry.strand}</span>
                    <span className="text-xs text-muted-foreground">{entry.tools.length ? entry.tools.map(nameOf).slice(0, 2).join(", ") : "from your sets"}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand to-gold" style={{ width: `${Math.max(6, entry.weight * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
            {data.activity.opens60 > 0 && <p className="pt-2 text-xs text-muted-foreground">{data.activity.opens60} tool opens by your team in the last 60 days.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Knowledge sets */}
      <section aria-labelledby="sets">
        <h2 id="sets" className="mb-3 font-display text-lg font-bold text-foreground">Knowledge sets</h2>
        <p className="-mt-2 mb-3 text-sm text-muted-foreground">Prepared by the platform&apos;s knowledge team. Followed sets update automatically when they&apos;re improved.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {data.sets.subscribed.map((set) => (
            <Card key={set.id} className="border-brand/30">
              <CardContent className="flex flex-col gap-2 pt-5">
                <div className="flex items-center gap-2">
                  <h3 className="flex-1 font-semibold text-foreground">{set.name}</h3>
                  <Badge tone="success">Following · v{set.version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{set.description}</p>
                <p className="text-xs text-muted-foreground">{set.toolKeys.map(nameOf).join(" · ")}</p>
                {editable && <Button size="sm" variant="ghost" className="self-end" onClick={() => setAction(set.id, "remove", `Stopped following ${set.name}`)}><X className="size-4" aria-hidden="true" /> Stop following</Button>}
              </CardContent>
            </Card>
          ))}
          {data.sets.available.map((set) => (
            <Card key={set.id}>
              <CardContent className="flex flex-col gap-2 pt-5">
                <div className="flex items-center gap-2">
                  <h3 className="flex-1 font-semibold text-foreground">{set.name}</h3>
                  {set.forYourCategory && <Badge tone="gold">For {data.business.category}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{set.description}</p>
                <p className="text-xs text-muted-foreground">{set.toolKeys.map(nameOf).join(" · ")}</p>
                {editable && <Button size="sm" className="self-end" onClick={() => setAction(set.id, "subscribe", `Following ${set.name}`)}><Plus className="size-4" aria-hidden="true" /> Follow</Button>}
              </CardContent>
            </Card>
          ))}
        </div>
        {data.sets.subscribed.length + data.sets.available.length === 0 && <EmptyState title="No knowledge sets published yet" />}
      </section>

      {data.hidden.length > 0 && editable && (
        <Card>
          <CardHeader><CardTitle className="text-base">Hidden tools</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.hidden.map((tool) => (
              <Button key={tool.key} size="sm" variant="outline" onClick={() => choose(tool.key, { state: "default" }, `${tool.name} restored`)}>
                <Eye className="size-4" aria-hidden="true" /> {tool.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {browsing && <Catalogue toolkit={data} onClose={() => setBrowsing(false)} onAdd={(tool) => choose(tool.key, { state: "added" }, `${tool.name} added`)} />}
    </div>
  );
}

function Catalogue({ toolkit, onClose, onAdd }: { toolkit: Toolkit; onClose: () => void; onAdd: (tool: Tool) => void }) {
  const [query, setQuery] = useState("");
  const mine = new Set(toolkit.tools.map((tool) => tool.key));
  const q = query.trim().toLowerCase();
  const tools = toolkit.catalogue.filter((tool) => !q || `${tool.name} ${tool.description}`.toLowerCase().includes(q));
  const groups = [...new Set(tools.map((tool) => tool.group))];
  return (
    <div role="dialog" aria-modal="true" aria-label="All tools" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Input autoFocus placeholder="Search tools…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search tools" />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X className="size-5" aria-hidden="true" /></Button>
        </div>
        <div className="overflow-y-auto p-4">
          {groups.map((group) => (
            <div key={group} className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{GROUP_LABELS[group] ?? group}</p>
              <div className="flex flex-col gap-2">
                {tools.filter((tool) => tool.group === group).map((tool) => (
                  <div key={tool.key} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                    {mine.has(tool.key) ? <Badge tone="success">In your toolkit</Badge> : <Button size="sm" variant="outline" onClick={() => onAdd(tool)}><Plus className="size-4" aria-hidden="true" /> Add</Button>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {tools.length === 0 && <p className="text-sm text-muted-foreground">No tools match “{query}”.</p>}
        </div>
      </div>
    </div>
  );
}
