/**
 * Citations in case reports.
 *
 * Every citation is built here from a grounded knowledge finding (and the stored literature attached
 * to it). A language model writing a section is shown the allowed citations by id and may only
 * refer to those: ids it returns that are not on the list are dropped, and a section whose text
 * cites anything else (an unknown [id] marker, a PMID, DOI or link that is neither on the list nor
 * already in the section) is discarded, like a section that leaks a masked name.
 */
import type { StrandFinding } from "@/lib/knowledge/types";
import type { CaseAnalysis, Citation, ReportSection } from "./types";

const MAX_TITLE = 200;
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
const firstString = (value: unknown): string | undefined =>
  Array.isArray(value) ? value.find((item): item is string => typeof item === "string" && item.trim().length > 0)?.trim() : undefined;

/** "psychological" + "GENERALIZED ANXIETY DISORDER" → "psychological:generalized-anxiety-disorder". */
export function citationId(strand: string, name: string): string {
  const slug = name.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
  return `${strand}:${slug || "entry"}`;
}

const isUrl = (value: string | undefined): value is string => Boolean(value && /^https?:\/\/\S+$/i.test(value));

/** A grounded finding as a citable source. */
export function citationFor(strand: string, finding: StrandFinding): Citation {
  const literature = finding.pubmedEvidence?.find((entry) => entry.title);
  const declared = firstString(finding.sources);
  const pmid = literature?.pmid && /^\d{1,10}$/.test(literature.pmid) ? literature.pmid : undefined;
  const url = isUrl(declared) ? declared : literature?.url ?? (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined);
  const source = declared && !isUrl(declared)
    ? clip(declared, MAX_TITLE)
    : literature
      ? clip([literature.title, literature.journal, literature.pubDate].filter(Boolean).join(" — "), MAX_TITLE)
      : `${strand} knowledge strand`;
  return {
    id: citationId(strand, finding.name),
    title: clip(finding.name, MAX_TITLE),
    source,
    ...(url ? { url } : {}),
    ...(pmid ? { pmid } : {}),
  };
}

type CitingAnalysis = Pick<CaseAnalysis, "strands" | "reflections" | "publishScope" | "safety">;

const unique = (citations: Array<Citation | undefined>) => {
  const seen = new Set<string>();
  return citations.filter((citation): citation is Citation => Boolean(citation) && !seen.has(citation!.id) && Boolean(seen.add(citation!.id)));
};

/** Evidence citations (Domain A) a published evidence section may use: none for reflection-only cases. */
export function evidenceCitations(analysis: CitingAnalysis | null | undefined): Citation[] {
  if (!analysis || analysis.publishScope !== "full") return [];
  return unique(analysis.strands.filter((entry) => entry.layer === "A").flatMap((entry) => entry.findings.map((finding) => finding.citation)));
}

/** Reflection citations (Domain B): none while a safety signal withholds Domain B. */
export function reflectionCitations(analysis: CitingAnalysis | null | undefined): Citation[] {
  if (!analysis || analysis.safety.domainBSuppressed) return [];
  return unique(analysis.reflections.map((finding) => finding.citation));
}

/** What a section may cite: reflections for a cultural section, evidence otherwise. */
export function sectionCitations(analysis: CitingAnalysis | null | undefined, section: Pick<ReportSection, "cultural">): Citation[] {
  return section.cultural ? reflectionCitations(analysis) : evidenceCitations(analysis);
}

// ── Checking what a model returned ───────────────────────────────────────────

/** An inline reference to a citation id, e.g. [psychological:generalized-anxiety-disorder]. */
const MARKER = /\[([a-z_]+:[\p{L}\p{M}\p{N}-]+)\]/gu;
const PMID = /\bPMID:?\s*(\d{4,10})\b/gi;
const LINK = /\bhttps?:\/\/[^\s)\]"'<>]+/gi;
const DOI = /\b10\.\d{4,9}\/[^\s)\]"'<>]+/g;

export interface CitationCheck {
  /** Allowed citations the model used, in order of first reference. */
  cited: Citation[];
  /** Ids in the model's citation list that are not allowed; never shown to anyone. */
  dropped: string[];
  /** References in the text to sources that are not allowed. Any of these discards the section. */
  unsupported: string[];
  /** Replaces the [id] markers with [1], [2] … in the order of `cited`. */
  renumber: (text: string) => string;
}

/**
 * Checks a model's section against the allowed citations. `texts` is what the model wrote (body and
 * items), `ids` its declared citation list, and `original` the section text it was given: a PMID or
 * link already there is the reviewer's and stays allowed.
 */
export function checkModelCitations(texts: string[], ids: unknown, allowed: Citation[], original: string): CitationCheck {
  const byId = new Map(allowed.map((citation) => [citation.id, citation]));
  const order: string[] = [];
  const unsupported: string[] = [];
  const record = (id: string) => {
    if (!order.includes(id)) order.push(id);
  };

  for (const text of texts) {
    for (const [, id] of text.matchAll(MARKER)) {
      if (byId.has(id)) record(id);
      else unsupported.push(`[${id}]`);
    }
    for (const [whole, pmid] of text.matchAll(PMID)) {
      if (!allowed.some((citation) => citation.pmid === pmid) && !original.includes(pmid)) unsupported.push(whole);
    }
    for (const [link] of [...text.matchAll(LINK), ...text.matchAll(DOI)]) {
      const bare = link.replace(/[.,;:]+$/, "");
      const listed = allowed.some((citation) => citation.url && (citation.url.includes(bare) || bare.replace(/\/$/, "") === citation.url.replace(/\/$/, "")));
      if (!listed && !original.includes(bare)) unsupported.push(bare);
    }
  }

  const dropped: string[] = [];
  for (const id of Array.isArray(ids) ? ids : []) {
    if (typeof id !== "string") continue;
    if (byId.has(id.trim())) record(id.trim());
    else dropped.push(id);
  }

  const number = new Map(order.map((id, index) => [id, index + 1]));
  return {
    cited: order.map((id) => byId.get(id)!),
    dropped,
    unsupported: [...new Set(unsupported)],
    renumber: (text) => text.replace(MARKER, (marker, id: string) => (number.has(id) ? `[${number.get(id)}]` : marker)),
  };
}

/** How a citation reads in a section's source list. */
export const citationLabel = (citation: Citation, index: number) => `[${index + 1}] ${citation.title} — ${citation.source}`;

/**
 * A saved draft keeps only citations the case's analysis grounded, in the platform's own wording,
 * so an edited draft cannot carry a source the analysis never found.
 */
export function keepGroundedCitations(sections: ReportSection[], analysis: CitingAnalysis | null | undefined): ReportSection[] {
  const known = new Map([...evidenceCitations(analysis), ...reflectionCitations(analysis)].map((citation) => [citation.id, citation]));
  return sections.map((section) => {
    const cited = section.evidence?.citations;
    if (!cited) return section;
    const kept = cited.map((citation) => known.get(citation.id)).filter((citation): citation is Citation => Boolean(citation));
    const { citations: _omitted, ...rest } = section.evidence!;
    return { ...section, evidence: kept.length ? { ...rest, citations: kept } : rest };
  });
}
