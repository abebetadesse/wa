"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Briefcase, Compass, Heart, Scale, Users, Dna } from "lucide-react";
import type { OwnerView } from "@/server/cases/views";
import type { WorkflowDomain } from "@/server/cases/types";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Badge, ButtonLink, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";

interface DomainSummary {
  domain: WorkflowDomain;
  label: string;
  description: string;
  pricing: { reportEtb: number; consultationEtb: number };
}

const ICONS: Record<WorkflowDomain, typeof Briefcase> = {
  career: Briefcase,
  legal: Scale,
  relationship: Heart,
  social: Users,
  spiritual: Compass,
  biological: Dna,
};

/** Each domain gets its own distinct accent so the grid is visually scannable. */
const DOMAIN_COLORS: Record<WorkflowDomain, string> = {
  career:       "text-amber-500",
  legal:        "text-blue-500",
  relationship: "text-rose-500",
  social:       "text-emerald-500",
  spiritual:    "text-violet-500",
  biological:   "text-teal-500",
};

export const STAGE_LABELS: Record<OwnerView["stage"], { label: string; tone: "neutral" | "brand" | "gold" | "success" | "warning" | "danger" }> = {
  intake:                 { label: "In progress",           tone: "neutral" },
  referred:               { label: "Referral advised",      tone: "warning" },
  crisis_routed:          { label: "Support first",         tone: "danger" },
  awaiting_expert:        { label: "Waiting for reviewer",  tone: "brand" },
  in_review:              { label: "In review",             tone: "brand" },
  visible_to_user:        { label: "Report ready",          tone: "success" },
  full_report_released:   { label: "Full report",           tone: "success" },
  consultation_requested: { label: "Consultation requested",tone: "gold" },
};

/** Returns the pipeline progress 0–100 for a given stage. */
function stageProgress(stage: OwnerView["stage"]): number {
  const pct: Record<OwnerView["stage"], number> = {
    intake:                 12,
    referred:               20,
    crisis_routed:          20,
    awaiting_expert:        40,
    in_review:              60,
    visible_to_user:        75,
    full_report_released:   90,
    consultation_requested: 100,
  };
  return pct[stage] ?? 12;
}

/** Returns a human-readable relative time string, e.g. "3 days ago". */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)   return "just now";
  if (diffMin < 60)  return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)    return `${diffH} hour${diffH === 1 ? "" : "s"} ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7)     return `${diffD} day${diffD === 1 ? "" : "s"} ago`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5)     return `${diffW} week${diffW === 1 ? "" : "s"} ago`;
  const diffMo = Math.floor(diffD / 30);
  return `${diffMo} month${diffMo === 1 ? "" : "s"} ago`;
}

export function WorkflowHub() {
  const [data, setData] = useState<{ domains: DomainSummary[]; cases: OwnerView[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await apiFetch("/api/case-workflows"));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        eyebrow="Expert-reviewed cases"
        title="Get guidance from a verified practitioner"
        description="Answer a short safety check and a few questions. A human practitioner reviews every report before you see it."
      />

      {error && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <LoadingState label="Loading case types…" />}

      {data && (
        <div className="flex flex-col gap-10">
          {/* ── Start a new case ─────────────────────────────────────────── */}
          <section aria-labelledby="start-heading" className="flex flex-col gap-4">
            <h2 id="start-heading" className="font-display text-xl font-bold text-foreground">Start a new case</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.domains.map((domain) => {
                const Icon = ICONS[domain.domain];
                const iconColor = DOMAIN_COLORS[domain.domain];
                return (
                  <li key={domain.domain}>
                    <Link
                      href={`/case/workflows/new/${domain.domain}`}
                      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Card className="h-full transition-all duration-200 group-hover:border-input group-hover:shadow-sm">
                        <CardHeader>
                          <Icon className={`size-6 ${iconColor}`} aria-hidden="true" />
                          <CardTitle>{domain.label}</CardTitle>
                          <CardDescription>{domain.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Full report {domain.pricing.reportEtb} ETB</span>
                          <ArrowRight className={`size-4 ${iconColor} transition-transform group-hover:translate-x-1`} aria-hidden="true" />
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ── Your cases ───────────────────────────────────────────────── */}
          <section aria-labelledby="mine-heading" className="flex flex-col gap-4">
            <h2 id="mine-heading" className="font-display text-xl font-bold text-foreground">Your cases</h2>
            {data.cases.length === 0 ? (
              <EmptyState
                title="No cases yet"
                description="Cases you start appear here, so you can come back to them at any time."
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {data.cases.map((item) => {
                  const stage   = STAGE_LABELS[item.stage];
                  const pct     = stageProgress(item.stage);
                  const Icon    = ICONS[item.domain as WorkflowDomain] ?? Briefcase;
                  const iconCl  = DOMAIN_COLORS[item.domain as WorkflowDomain] ?? "text-brand";
                  return (
                    <li key={item.id}>
                      <Card className="transition-shadow hover:shadow-sm">
                        {/* Progress bar at top of card */}
                        <div
                          className="h-1 w-full overflow-hidden rounded-t-2xl bg-border"
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Case progress: ${pct}%`}
                        >
                          <div
                            className="h-full rounded-full bg-brand transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <CardContent className="flex flex-wrap items-center gap-4 pt-4">
                          {/* Domain icon */}
                          <span className={`hidden shrink-0 sm:block ${iconCl}`}>
                            <Icon className="size-5" aria-hidden="true" />
                          </span>

                          {/* Label + timestamps */}
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <p className="font-semibold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Started {relativeTime(item.createdAt)}
                              {" · "}
                              <span title={new Date(item.updatedAt).toLocaleString()}>
                                updated {relativeTime(item.updatedAt)}
                              </span>
                            </p>
                          </div>

                          {/* Stage badge + progress % */}
                          <div className="flex items-center gap-2">
                            <Badge tone={stage.tone}>{stage.label}</Badge>
                            <span className="tabular-nums text-xs font-semibold text-muted-foreground">{pct}%</span>
                          </div>

                          <ButtonLink href={`/case/workflows/${item.id}`} variant="outline" size="sm">Open</ButtonLink>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
