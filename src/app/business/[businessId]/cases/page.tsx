"use client";

import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useSession } from "@/features/session/SessionProvider";
import { cn } from "@/lib/utils";

interface CaseSummary {
  id: string;
  label: string;
  stage: string;
  priority: "urgent" | "high" | "routine";
  concern: string | null;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Queue {
  waiting: CaseSummary[];
  inReview: CaseSummary[];
  approved: CaseSummary[];
}

const PRIORITY = { urgent: { label: "Urgent", tone: "danger" }, high: { label: "High", tone: "warning" }, routine: { label: "Routine", tone: "neutral" } } as const;

function Section({ title, hint, items, base, highlightMine }: { title: string; hint: string; items: CaseSummary[]; base: string; highlightMine?: string }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">{title} <span className="text-muted-foreground">({items.length})</span></h2>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const priority = PRIORITY[item.priority];
            return (
              <li key={item.id}>
                <Link href={`${base}/cases/${item.id}`} className={cn("flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 hover:border-input", highlightMine && item.reviewerId === highlightMine ? "border-brand/50" : "border-border")}>
                  {item.priority !== "routine" && <ShieldAlert className={cn("size-5", item.priority === "urgent" ? "text-danger" : "text-warning")} aria-hidden="true" />}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.concern ?? "No safety concern flagged"} · opened {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <Badge tone={priority.tone}>{priority.label}</Badge>
                  {highlightMine && item.reviewerId === highlightMine && <Badge tone="brand">Yours</Badge>}
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function CasesPage() {
  const { business, base } = useWorkspace();
  const { user } = useSession();
  const { data, error, reload } = useApi<Queue>(`/api/workspace/businesses/${business.id}/cases`, { liveTypes: ["case."] });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Cases to review"
        description="Clients who book a reading or review complete an intake. Check their answers and the draft, then approve the report they receive."
        className="mb-0"
      />
      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && data.waiting.length + data.inReview.length + data.approved.length === 0 && (
        <EmptyState title="No cases yet" description="Cases appear here when clients book a service linked to a reading or review." />
      )}
      {data && data.waiting.length + data.inReview.length + data.approved.length > 0 && (
        <>
          <Section title="Waiting" hint="Most urgent first. Open one and claim it to start." items={data.waiting} base={base} />
          <Section title="In review" hint="Claimed by someone on your team." items={data.inReview} base={base} highlightMine={user?.id} />
          <Section title="Approved" hint="Reports your clients can read." items={data.approved} base={base} />
        </>
      )}
    </div>
  );
}
