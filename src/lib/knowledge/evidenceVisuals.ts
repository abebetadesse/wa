import { EvidenceItem, KnowledgeStrandType, StrandFinding } from "./types";

/**
 * Default illustration shown for a finding when nothing more specific matches.
 * One static SVG per strand, served from /public/images/evidence.
 */
const STRAND_VISUALS: Record<KnowledgeStrandType, { imageUrl: string; imageAlt: string }> = {
  biochemical: { imageUrl: "/images/evidence/strand-biochemical.svg", imageAlt: "Molecular pathway illustration" },
  biological: { imageUrl: "/images/evidence/strand-biological.svg", imageAlt: "Cell and physiology illustration" },
  medication: { imageUrl: "/images/evidence/strand-medication.svg", imageAlt: "Medication safety illustration" },
  addiction: { imageUrl: "/images/evidence/strand-addiction.svg", imageAlt: "Substance-use pattern illustration" },
  ecological: { imageUrl: "/images/evidence/strand-ecological.svg", imageAlt: "Highland ecology illustration" },
  epidemiological: { imageUrl: "/images/evidence/strand-epidemiological.svg", imageAlt: "Regional health-risk illustration" },
  psychological: { imageUrl: "/images/evidence/strand-psychological.svg", imageAlt: "Mind and stress-response illustration" },
  socioeconomic: { imageUrl: "/images/evidence/strand-socioeconomic.svg", imageAlt: "Household resources illustration" },
  dietary: { imageUrl: "/images/evidence/strand-dietary.svg", imageAlt: "Ethiopian food and nutrition illustration" },
  cultural: { imageUrl: "/images/evidence/strand-cultural.svg", imageAlt: "Buna coffee ceremony illustration" },
  astrological: { imageUrl: "/images/evidence/strand-astrological.svg", imageAlt: "AwudeNegest star-chart illustration" },
};

/**
 * More specific illustration chosen by keyword match against the finding's
 * name/category/matches, so a finding about iron gets an iron illustration
 * rather than the generic biochemical default, etc.
 */
const KEYWORD_VISUALS: Array<{ test: RegExp; imageUrl: string; imageAlt: string }> = [
  { test: /iron/i, imageUrl: "/images/evidence/evidence-iron.svg", imageAlt: "Iron intake illustration" },
  { test: /b12|cobalamin|folate|vitamin|zinc|calcium|magnesium/i, imageUrl: "/images/evidence/evidence-vitamin.svg", imageAlt: "Vitamin and micronutrient illustration" },
  { test: /herb|tena adam|kosso|ruta chalepensis|hagenia|damakesse/i, imageUrl: "/images/evidence/evidence-herb.svg", imageAlt: "Traditional herb illustration" },
  { test: /teff|grain|sorghum|maize|fermentation|phytate|phytic/i, imageUrl: "/images/evidence/evidence-grain.svg", imageAlt: "Grain and fermentation illustration" },
  { test: /altitude|highland|hypoxia|dega|wurch/i, imageUrl: "/images/evidence/evidence-altitude.svg", imageAlt: "High-altitude terrain illustration" },
  { test: /fast|tsom|ramadan/i, imageUrl: "/images/evidence/evidence-fasting.svg", imageAlt: "Religious fasting illustration" },
  { test: /pregnan|lactat|maternal/i, imageUrl: "/images/evidence/evidence-pregnancy.svg", imageAlt: "Pregnancy and maternal-care illustration" },
  { test: /safety|toxicity|danger|red.?flag|critical|interaction/i, imageUrl: "/images/evidence/evidence-safety.svg", imageAlt: "Safety alert illustration" },
];

function resolveVisual(finding: StrandFinding): { imageUrl: string; imageAlt: string } {
  const haystack = `${finding.name} ${finding.category || ""} ${finding.type} ${(finding.matches || []).join(" ")}`.toLowerCase();
  const keywordMatch = KEYWORD_VISUALS.find((entry) => entry.test.test(haystack));
  return keywordMatch || STRAND_VISUALS[finding.strand];
}

/**
 * Build the illustrated evidence entries for a single finding: one image +
 * description per distinct piece of evidence the strand already produced
 * (the raw `evidence` string, plus any Ethiopian-context notes).
 */
export function buildEvidenceItems(finding: StrandFinding): EvidenceItem[] {
  const visual = resolveVisual(finding);
  const strandVisual = STRAND_VISUALS[finding.strand];
  const items: EvidenceItem[] = [];

  if (finding.evidence) {
    items.push({
      description: finding.evidence,
      imageUrl: visual.imageUrl,
      imageAlt: visual.imageAlt,
      caption: finding.name,
      source: finding.sources?.[0],
    });
  }

  const culturalContext = Array.isArray(finding.ethiopian_context)
    ? finding.ethiopian_context
    : finding.ethiopian_context
      ? [finding.ethiopian_context]
      : [];
  for (const context of culturalContext) {
    items.push({
      description: context,
      imageUrl: strandVisual.imageUrl,
      imageAlt: strandVisual.imageAlt,
      caption: "Ethiopian context",
    });
  }

  if (!items.length) {
    items.push({
      description: finding.description,
      imageUrl: visual.imageUrl,
      imageAlt: visual.imageAlt,
      caption: finding.name,
    });
  }

  return items;
}

/**
 * Attach `evidenceItems` to every finding across all strand results in place.
 * Single integration point so every knowledge strand gets illustrated
 * evidence without each strand file needing to know about images.
 */
export function attachEvidenceVisuals(
  strandResults: Record<KnowledgeStrandType, StrandFinding[]>,
): Record<KnowledgeStrandType, StrandFinding[]> {
  for (const findings of Object.values(strandResults)) {
    for (const finding of findings) {
      finding.evidenceItems = buildEvidenceItems(finding);
    }
  }
  return strandResults;
}
