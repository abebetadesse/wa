/**
 * strandStepOrchestrator.ts
 *
 * Enhancement 4 – Multi-Strand Step-by-Step Recommendation Engine
 *
 * Orchestrates the 11 knowledge strands sequentially / in batches and emits
 * progress events so the caller (UI or API route) can display a live step-by-step
 * view without blocking.
 *
 * Architecture:
 *  - Domain A strands (scientific) run in parallel.
 *  - Domain B strands (cultural / astrological) run in a separate parallel
 *    batch AFTER Domain A has completed.
 *  - A safety gate checks Domain A findings before Domain B is presented.
 *  - Each strand emits a StrandProgressEvent so the UI can tick off steps.
 *
 * Safety contract:
 *  - No strand output may claim to diagnose, prescribe, cure, or replace
 *    emergency services.
 *  - The final merged output includes the mandatory disclaimer.
 */

import type {
  KnowledgeStrandType,
  StrandFinding,
  UserProfile,
} from "@/lib/knowledge/types";
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import type { CaseSummaryCard } from "./caseSummaryEngine";
import type { StrandTier } from "./caseSummaryEngine";

// ─── Progress event types ──────────────────────────────────────────────────────

export type StrandStatus =
  | "pending"
  | "running"
  | "complete"
  | "error"
  | "skipped";

export interface StrandProgressEvent {
  strand: KnowledgeStrandType;
  status: StrandStatus;
  /** ISO timestamp when the status changed */
  timestamp: string;
  /** Human-readable step label */
  label: string;
  /** Number of findings returned (0 while status ≠ "complete") */
  findingCount: number;
  /** Domain: "A" = scientific, "B" = cultural */
  domain: "A" | "B";
  /** Milliseconds elapsed (0 while status ≠ "complete") */
  elapsedMs: number;
  /** Optional error message */
  error?: string;
}

export interface StrandStepResult {
  strand: KnowledgeStrandType;
  domain: "A" | "B";
  findings: StrandFinding[];
  elapsedMs: number;
}

export interface MultiStrandStepOutput {
  /** Events in the order they were emitted (for replay / logging) */
  events: StrandProgressEvent[];
  /** Merged findings keyed by strand */
  results: Partial<Record<KnowledgeStrandType, StrandFinding[]>>;
  tiers: Array<{
    tier: StrandTier;
    label: string;
    description: string;
    strands: Array<{ strand: KnowledgeStrandType; label: string; findings: StrandFinding[] }>;
  }>;
  /** Summary counts */
  summary: {
    totalStrands: number;
    completed: number;
    errored: number;
    skipped: number;
    durationMs: number;
  };
  /** Safety gate passed? If false, Domain B was suppressed */
  safetyGatePassed: boolean;
  /** Mandatory non-diagnostic disclaimer */
  disclaimer: string;
}

// ─── Domain classification ────────────────────────────────────────────────────

const DOMAIN_A_STRANDS: KnowledgeStrandType[] = [
  "biological",
  "biochemical",
  "medication",
  "addiction",
  "ecological",
  "epidemiological",
  "psychological",
  "socioeconomic",
  "dietary",
];

const DOMAIN_B_STRANDS: KnowledgeStrandType[] = ["cultural", "astrological"];

const STRAND_LABELS: Record<KnowledgeStrandType, string> = {
  biological: "Biological & Genetic Factors",
  biochemical: "Biochemical & Nutritional Analysis",
  medication: "Pharmaceutical & Herb-Drug Safety",
  addiction: "Substance Use & Addiction Screening",
  ecological: "Agro-ecological & Environmental Context",
  epidemiological: "Epidemiological & Endemic Disease Risk",
  psychological: "Psychological & Mental Wellbeing",
  socioeconomic: "Socioeconomic & Livelihood Factors",
  dietary: "Ethiopian Dietary & Fasting Patterns",
  cultural: "Cultural Traditions & Ancestral Wisdom",
  astrological: "Geez Astrology & Numerology (Domain B)",
};

const TIER_PRESENTATION: Record<StrandTier, { label: string; description: string }> = {
  biomedical: {
    label: "Biomedical and Clinical Evidence",
    description: "Clinical, pharmacological, biological, and population-health evidence.",
  },
  "evidence-informed": {
    label: "Evidence-Informed Context",
    description: "Nutrition, environment, psychological, social, and substance-use context.",
  },
  traditional: {
    label: "Traditional Medicine",
    description: "Traditional knowledge, separately labeled and not equivalent to clinical evidence.",
  },
  cultural: {
    label: "Cultural and Spiritual Reflection",
    description: "Reflective cultural content, not clinical evidence or medical advice.",
  },
};

const STRAND_TIERS: Record<KnowledgeStrandType, StrandTier> = {
  biological: "biomedical",
  biochemical: "biomedical",
  medication: "biomedical",
  epidemiological: "biomedical",
  dietary: "evidence-informed",
  ecological: "evidence-informed",
  psychological: "evidence-informed",
  socioeconomic: "evidence-informed",
  addiction: "evidence-informed",
  cultural: "cultural",
  astrological: "cultural",
};

export function groupResultsByTier(
  results: Partial<Record<KnowledgeStrandType, StrandFinding[]>>,
  requestedStrands: KnowledgeStrandType[],
): MultiStrandStepOutput["tiers"] {
  const order: StrandTier[] = ["biomedical", "evidence-informed", "traditional", "cultural"];
  return order.map((tier) => ({
    tier,
    ...TIER_PRESENTATION[tier],
    strands: requestedStrands
      .filter((strand) => STRAND_TIERS[strand] === tier && (results[strand]?.length ?? 0) > 0)
      .map((strand) => ({ strand, label: STRAND_LABELS[strand], findings: results[strand] ?? [] })),
  })).filter((group) => group.strands.length > 0);
}

const MANDATORY_DISCLAIMER =
  "These findings are educational recommendations based on Ethiopian scientific " +
  "and cultural knowledge systems. They do not constitute medical diagnosis, " +
  "prescription, or a substitute for licensed professional care. If you are in " +
  "immediate danger, please call emergency services.";

// ─── Core orchestrator function ────────────────────────────────────────────────

export interface StrandStepOrchestratorInput {
  /** The endorsed case summary card */
  card: CaseSummaryCard;
  /** Full user profile for personalisation */
  userProfile: UserProfile;
  /** Subset of strands to run (defaults to card.suggestedStrands or all) */
  strandFilter?: KnowledgeStrandType[];
  /** When true, Domain B (cultural/astrological) is always suppressed */
  suppressDomainB?: boolean;
  /** Callback invoked each time a strand status changes */
  onProgress?: (event: StrandProgressEvent) => void;
}

/**
 * Runs all suggested strands in the correct domain order, emitting progress
 * events along the way. Returns a complete MultiStrandStepOutput.
 *
 * This function is async and resolves only after all strands complete.
 */
export async function runStrandStepOrchestrator(
  input: StrandStepOrchestratorInput
): Promise<MultiStrandStepOutput> {
  const overallStart = Date.now();
  const events: StrandProgressEvent[] = [];
  const results: Partial<Record<KnowledgeStrandType, StrandFinding[]>> = {};

  const requestedStrands =
    input.strandFilter ||
    input.card.suggestedStrands ||
    [...DOMAIN_A_STRANDS, ...DOMAIN_B_STRANDS];

  const domainAToRun = DOMAIN_A_STRANDS.filter((s) =>
    requestedStrands.includes(s)
  );
  const domainBToRun = DOMAIN_B_STRANDS.filter((s) =>
    requestedStrands.includes(s)
  );

  let completed = 0;
  let errored = 0;
  let skipped = 0;

  const emit = (event: StrandProgressEvent) => {
    events.push(event);
    input.onProgress?.(event);
  };

  // Emit pending for all strands upfront (gives the UI a skeleton view)
  for (const strand of [...domainAToRun, ...domainBToRun]) {
    emit({
      strand,
      status: "pending",
      timestamp: new Date().toISOString(),
      label: STRAND_LABELS[strand],
      findingCount: 0,
      domain: DOMAIN_A_STRANDS.includes(strand) ? "A" : "B",
      elapsedMs: 0,
    });
  }

  // ─── Domain A – parallel ──────────────────────────────────────────────────

  const runDomainAStrand = async (
    strand: KnowledgeStrandType
  ): Promise<StrandStepResult> => {
    const start = Date.now();
    emit({
      strand,
      status: "running",
      timestamp: new Date().toISOString(),
      label: STRAND_LABELS[strand],
      findingCount: 0,
      domain: "A",
      elapsedMs: 0,
    });
    try {
      const strandInstance = globalOrchestrator.strands[strand];
      const findings = await strandInstance.query(
        input.card.rawNarrative,
        input.userProfile
      );
      const elapsed = Date.now() - start;
      emit({
        strand,
        status: "complete",
        timestamp: new Date().toISOString(),
        label: STRAND_LABELS[strand],
        findingCount: findings.length,
        domain: "A",
        elapsedMs: elapsed,
      });
      return { strand, domain: "A", findings, elapsedMs: elapsed };
    } catch (err) {
      const elapsed = Date.now() - start;
      const msg = err instanceof Error ? err.message : "Unknown error";
      emit({
        strand,
        status: "error",
        timestamp: new Date().toISOString(),
        label: STRAND_LABELS[strand],
        findingCount: 0,
        domain: "A",
        elapsedMs: elapsed,
        error: msg,
      });
      return { strand, domain: "A", findings: [], elapsedMs: elapsed };
    }
  };

  const domainAResults = await Promise.all(domainAToRun.map(runDomainAStrand));

  for (const r of domainAResults) {
    results[r.strand] = r.findings;
    if (r.findings.length > 0) completed++;
    else errored++;
  }

  // ─── Domain A safety gate ─────────────────────────────────────────────────

  const safetyGatePassed =
    !input.suppressDomainB &&
    // Gate: at least one Domain A strand produced findings
    domainAResults.some((r) => r.findings.length > 0);

  // ─── Domain B – parallel (only when gate passes) ──────────────────────────

  if (!safetyGatePassed || domainBToRun.length === 0) {
    for (const strand of domainBToRun) {
      emit({
        strand,
        status: "skipped",
        timestamp: new Date().toISOString(),
        label: STRAND_LABELS[strand],
        findingCount: 0,
        domain: "B",
        elapsedMs: 0,
        error: !safetyGatePassed
          ? "Domain B suppressed: safety gate requires Domain A findings first."
          : undefined,
      });
      skipped++;
    }
  } else {
    const runDomainBStrand = async (
      strand: KnowledgeStrandType
    ): Promise<StrandStepResult> => {
      const start = Date.now();
      emit({
        strand,
        status: "running",
        timestamp: new Date().toISOString(),
        label: STRAND_LABELS[strand],
        findingCount: 0,
        domain: "B",
        elapsedMs: 0,
      });
      try {
        const strandInstance = globalOrchestrator.strands[strand];
        const findings = await strandInstance.query(
          input.card.rawNarrative,
          input.userProfile
        );
        const elapsed = Date.now() - start;
        emit({
          strand,
          status: "complete",
          timestamp: new Date().toISOString(),
          label: STRAND_LABELS[strand],
          findingCount: findings.length,
          domain: "B",
          elapsedMs: elapsed,
        });
        return { strand, domain: "B", findings, elapsedMs: elapsed };
      } catch (err) {
        const elapsed = Date.now() - start;
        const msg = err instanceof Error ? err.message : "Unknown error";
        emit({
          strand,
          status: "error",
          timestamp: new Date().toISOString(),
          label: STRAND_LABELS[strand],
          findingCount: 0,
          domain: "B",
          elapsedMs: elapsed,
          error: msg,
        });
        return { strand, domain: "B", findings: [], elapsedMs: elapsed };
      }
    };

    const domainBResults = await Promise.all(
      domainBToRun.map(runDomainBStrand)
    );
    for (const r of domainBResults) {
      results[r.strand] = r.findings;
      if (r.findings.length > 0) completed++;
      else errored++;
    }
  }

  return {
    events,
    results,
    tiers: groupResultsByTier(results, requestedStrands),
    summary: {
      totalStrands: requestedStrands.length,
      completed,
      errored,
      skipped,
      durationMs: Date.now() - overallStart,
    },
    safetyGatePassed,
    disclaimer: MANDATORY_DISCLAIMER,
  };
}

/**
 * Synchronous utility: given a list of progress events, returns the latest
 * status for each strand (useful for rendering a step list).
 */
export function buildStepList(
  events: StrandProgressEvent[]
): StrandProgressEvent[] {
  const latest = new Map<KnowledgeStrandType, StrandProgressEvent>();
  for (const ev of events) {
    latest.set(ev.strand, ev);
  }
  return [...latest.values()];
}
