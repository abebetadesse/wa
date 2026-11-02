"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { effectiveCautions, CONDITION_LABELS, type Cautions, type Condition } from "@/server/safety/rules";
import { cn } from "@/lib/utils";
import { findByLabel } from "@/server/safety/match";
import { withBasePath } from '@/lib/base-path';

interface ReferenceEntry {
  slug: string;
  name: string;
  kind: string;
  category: string;
  scientificName: string | null;
  amharicName: string | null;
  aliases: string[];
  properties: string[];
  cautions: Cautions;
}

let cache: Promise<ReferenceEntry[]> | null = null;

/** The safety matrix reference, fetched once per page and shared by every badge. */
export function useSafetyReference() {
  const [entries, setEntries] = useState<ReferenceEntry[] | null>(null);
  useEffect(() => {
    cache ??= fetch(withBasePath("/api/safety/substances"))
      .then((res) => res.json())
      .then((payload) => (payload?.success ? (payload.data.substances as ReferenceEntry[]) : []))
      .catch(() => []);
    let active = true;
    cache.then((list) => active && setEntries(list));
    return () => {
      active = false;
    };
  }, []);
  return entries;
}

export const findEntry = (entries: ReferenceEntry[], label: string) => findByLabel(entries, label);

/**
 * Live safety status for a plant mentioned in cultural content, from the safety matrix, so
 * reflective material never shows a remedy as "safe" when the reference says otherwise.
 */
export function HerbSafetyBadge({ label, className }: { label: string; className?: string }) {
  const entries = useSafetyReference();
  if (!entries) return null;
  const entry = findEntry(entries, label);
  if (!entry) return <span className={cn("text-[11px] text-muted-foreground", className)}>Not in the safety reference yet</span>;
  const cautions = effectiveCautions({ slug: entry.slug, name: entry.name, kind: entry.kind as "modern" | "traditional", category: entry.category, properties: entry.properties, cautions: entry.cautions });
  const avoid = (Object.entries(cautions) as [Condition, { level: string }][]).filter(([, c]) => c.level === "avoid").map(([c]) => CONDITION_LABELS[c]);
  const toxic = entry.properties.includes("toxic_internal");
  const interacts = entry.properties.length > 0;
  const tone = toxic || avoid.length ? "border-danger/40 bg-danger/15 text-danger-strong" : interacts ? "border-gold/40 bg-gold/15 text-gold-strong" : "border-brand/30 bg-brand/10 text-brand-strong";
  const text = toxic ? "Poisonous if swallowed" : avoid.length ? `Avoid: ${avoid.slice(0, 2).join(", ")}` : interacts ? "Can interact with medicines" : "No interactions recorded";
  return (
    <Link href={`/safety?items=${entry.slug}`} title="Open in the safety matrix" className={cn("inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold hover:underline", tone, className)}>
      {text} →
    </Link>
  );
}
