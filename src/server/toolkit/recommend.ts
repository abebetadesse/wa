/**
 * Behaviour-based recommendations for a business's toolkit. Pure: the caller gathers the signals.
 *
 * Signals, strongest first:
 *   - what the business actually does: bookings per service kind in the last 90 days
 *   - what its team actually uses: tool opens in the last 60 days, recent ones weighing more
 *   - knowledge sets it subscribes to (curated by administrators)
 *   - its category (herbalist, debtera …) and the service kinds it offers
 *   - affinity: strands of the tools it already relies on
 */
import type { KnowledgeStrandType } from "@/lib/knowledge/types";

export interface ScoringTool {
  key: string;
  strands: string[];
  suggestedFor: { categories: string[]; serviceKinds: string[] };
}

export interface BusinessSignals {
  categorySlug: string;
  /** Service kinds the business offers (active services). */
  serviceKinds: string[];
  /** Bookings per service kind, last 90 days. */
  bookingsByKind: Record<string, number>;
  /** Tool opens by the team, each with its age in days. */
  usage: { toolKey: string; ageDays: number }[];
  /** Tools included by the business's subscribed knowledge sets. */
  setTools: string[];
  /** Case reviews completed per case domain (from booking-linked cases). */
  caseDomains?: Record<string, number>;
}

export interface Recommendation {
  key: string;
  score: number;
  reasons: string[];
}

const WEIGHTS = { category: 2, serviceKind: 1.5, bookings: 2.5, usage: 3, set: 2, strand: 1, pathway: 2 };

/** Recency-weighted usage: an open today counts 1, one 30 days ago about 0.5. */
export function usageScore(usage: BusinessSignals["usage"], toolKey: string) {
  return usage.filter((event) => event.toolKey === toolKey).reduce((sum, event) => sum + Math.pow(0.5, Math.max(0, event.ageDays) / 30), 0);
}

/** How strongly the business leans on each knowledge strand, normalised to 0–1. */
export function strandAffinity(tools: ScoringTool[], signals: BusinessSignals): Record<string, number> {
  const weights: Record<string, number> = {};
  const byKey = new Map(tools.map((tool) => [tool.key, tool]));
  const add = (key: string, weight: number) => {
    for (const strand of byKey.get(key)?.strands ?? []) weights[strand] = (weights[strand] ?? 0) + weight;
  };
  for (const key of new Set(signals.usage.map((event) => event.toolKey))) add(key, usageScore(signals.usage, key));
  for (const key of signals.setTools) add(key, 0.5);
  const max = Math.max(0, ...Object.values(weights));
  return max > 0 ? Object.fromEntries(Object.entries(weights).map(([strand, value]) => [strand, Math.round((value / max) * 100) / 100])) : {};
}

export function recommendTools(tools: ScoringTool[], signals: BusinessSignals, options: { exclude?: Iterable<string>; limit?: number } = {}): Recommendation[] {
  const exclude = new Set(options.exclude ?? []);
  const affinity = strandAffinity(tools, signals);
  const setTools = new Set(signals.setTools);
  const results: Recommendation[] = [];

  for (const tool of tools) {
    if (exclude.has(tool.key)) continue;
    let score = 0;
    const reasons: string[] = [];

    if (tool.suggestedFor.categories.includes(signals.categorySlug)) {
      score += WEIGHTS.category;
      reasons.push("Suits your kind of practice");
    }
    const offered = tool.suggestedFor.serviceKinds.filter((kind) => signals.serviceKinds.includes(kind));
    if (offered.length) {
      score += WEIGHTS.serviceKind;
      const booked = offered.reduce((sum, kind) => sum + (signals.bookingsByKind[kind] ?? 0), 0);
      if (booked > 0) {
        score += WEIGHTS.bookings * Math.log2(1 + booked);
        reasons.push(`Used in services you're booked for (${booked} in 90 days)`);
      } else {
        reasons.push("Matches a service you offer");
      }
    }
    const pathwayDomain = tool.key.startsWith("pathway-") ? tool.key.slice("pathway-".length) : null;
    if (pathwayDomain && (signals.caseDomains?.[pathwayDomain] ?? 0) > 0) {
      score += WEIGHTS.pathway * Math.log2(1 + signals.caseDomains![pathwayDomain]);
      reasons.push("Your clients open these cases");
    }
    const used = usageScore(signals.usage, tool.key);
    if (used > 0) {
      score += WEIGHTS.usage * Math.log2(1 + used);
      reasons.push("Your team uses this");
    }
    if (setTools.has(tool.key)) {
      score += WEIGHTS.set;
      reasons.push("In a knowledge set you follow");
    }
    const strandFit = tool.strands.length ? tool.strands.reduce((sum, strand) => sum + (affinity[strand] ?? 0), 0) / tool.strands.length : 0;
    if (strandFit > 0.25) {
      score += WEIGHTS.strand * strandFit;
      reasons.push("Close to the knowledge you rely on");
    }
    if (score > 0) results.push({ key: tool.key, score: Math.round(score * 100) / 100, reasons });
  }

  return results.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key)).slice(0, options.limit ?? results.length);
}

export type { KnowledgeStrandType };
