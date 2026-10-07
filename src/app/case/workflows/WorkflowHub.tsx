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

export const STAGE_LABELS: Record<OwnerView["stage"], { label: string; tone: "neutral" | "brand" | "gold" | "success" | "warning" | "danger" }> = {
  intake: { label: "In progress", tone: "neutral" },
  referred: { label: "Referral advised", tone: "warning" },
  crisis_routed: { label: "Support first", tone: "danger" },
  awaiting_expert: { label: "Waiting for reviewer", tone: "brand" },
  in_review: { label: "In review", tone: "brand" },
  visible_to_user: { label: "Report ready", tone: "success" },
  full_report_released: { label: "Full report", tone: "success" },
  consultation_requested: { label: "Consultation requested", tone: "gold" },
};

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
          <section aria-labelledby="start-heading" className="flex flex-col gap-4">
            <h2 id="start-heading" className="font-display text-xl font-bold text-foreground">Start a new case</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.domains.map((domain) => {
                const Icon = ICONS[domain.domain];
                return (
                  <li key={domain.domain}>
                    <Link
                      href={`/case/workflows/new/${domain.domain}`}
                      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Card className="h-full transition-colors group-hover:border-input">
                        <CardHeader>
                          <Icon className="size-6 text-brand" aria-hidden="true" />
                          <CardTitle>{domain.label}</CardTitle>
                          <CardDescription>{domain.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Full report {domain.pricing.reportEtb} ETB</span>
                          <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="mine-heading" className="flex flex-col gap-4">
            <h2 id="mine-heading" className="font-display text-xl font-bold text-foreground">Your cases</h2>
            {data.cases.length === 0 ? (
              <EmptyState title="No cases yet" description="Cases you start appear here, so you can come back to them at any time." />
            ) : (
              <ul className="flex flex-col gap-3">
                {data.cases.map((item) => {
                  const stage = STAGE_LABELS[item.stage];
                  return (
                    <li key={item.id}>
                      <Card>
                        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <p className="font-semibold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Started {new Date(item.createdAt).toLocaleDateString()} · updated {new Date(item.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge tone={stage.tone}>{stage.label}</Badge>
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
