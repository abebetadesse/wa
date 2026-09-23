/**
 * LLM Summarizer — Literature Fetcher Processor
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses BionicGPT (primary) and Gemini (fallback) to extract deeply structured,
 * strand-specific data from article abstracts — going well beyond what regex alone
 * can capture.
 *
 * Called after abstractExtractor.ts to AUGMENT regex-extracted fields with
 * LLM-inferred fields that require semantic understanding:
 *   - key_finding_summary (concise 1-sentence Ethiopian-context finding)
 *   - Numeric stats buried in complex sentence structures
 *   - Strand-specific metrics (EIR, IC50, PHQ-9 norms, allele frequencies)
 *   - Drug interaction descriptions
 *   - Cultural illness explanatory models
 *
 * Fallback chain: BionicGPT → Gemini → null (silent, regex data still used)
 */

import { bionicChat, isBionicConfigured } from "@/lib/ai/bionicGPT";
import type { ExtractedLiteratureData } from "../types";
import type { KnowledgeStrandType } from "@/lib/knowledge/types";

// ─── Strand-specific extraction prompts ──────────────────────────────────────

const STRAND_EXTRACTION_PROMPTS: Record<KnowledgeStrandType, string> = {
  epidemiological: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "incidence": "X per 100,000 or null",
  "prevalence": "X% or null",
  "mortality": "X% or null",
  "case_fatality_rate": "X% or null",
  "r0": "number or null",
  "dalys": "number or null",
  "mmr": "X per 100,000 live births or null",
  "imr": "X per 1,000 or null",
  "seroprevalence": "X% or null",
  "high_risk_groups": ["string", ...],
  "endemic_areas": ["string", ...],
  "seasonal_patterns": ["string", ...],
  "risk_factors": ["string", ...],
  "key_finding_summary": "One sentence: what is the key finding relevant to Ethiopia?"
}`,

  ecological: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "entomological_inoculation_rate": "value or null",
  "sporozoite_rate": "X% or null",
  "biting_rate": "value or null",
  "insecticide_resistance": "description or null",
  "altitude_limits": "Xm or null",
  "fluoride_concentration_ppm": "X mg/L or null",
  "zoonotic_spillover_rate": "value or null",
  "ndvi_correlation": "correlation coefficient or null",
  "indoor_air_pm25": "X μg/m³ or null",
  "seasonal_patterns": ["string", ...],
  "endemic_areas": ["string", ...],
  "key_finding_summary": "One sentence: key ecological health finding for Ethiopia"
}`,

  biochemical: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "ic50": "value with units or null",
  "ec50": "value with units or null",
  "tpc": "total phenolic content value or null",
  "tfc": "total flavonoid content value or null",
  "antioxidant_dpph": "DPPH scavenging value or null",
  "half_life": "value or null",
  "cyp450_inhibition": "description of CYP isoforms affected or null",
  "serum_ferritin": "value or null",
  "serum_zinc": "value or null",
  "vitamin_d_25oh": "value or null",
  "hba1c": "X% or null",
  "fasting_blood_glucose": "value or null",
  "bioavailability": "X% or null",
  "molar_ratios": "antinutrient:mineral ratio or null",
  "nutrients": ["nutrient names mentioned", ...],
  "oxidative_stress_biomarkers": ["biomarker names", ...],
  "key_finding_summary": "One sentence: key biochemical finding relevant to Ethiopian diet/health"
}`,

  dietary: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "glycemic_index": "value or null",
  "glycemic_load": "value or null",
  "haz_score": "Z-score or null",
  "waz_score": "Z-score or null",
  "whz_score": "Z-score or null",
  "muac": "X cm or null",
  "sam_rate": "X% or null",
  "mam_rate": "X% or null",
  "mdd_w": "dietary diversity score or null",
  "exclusive_breastfeeding_rate": "X% or null",
  "mycotoxin_level_ppb": "X ppb or null",
  "phytate_reduction": "X% or null",
  "fermentation_ph": "pH value or null",
  "caloric_deficit": "X kcal/day or null",
  "nutrients": ["nutrient names", ...],
  "key_finding_summary": "One sentence: key dietary/nutrition finding for Ethiopia"
}`,

  medication: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "auc": "AUC value or null",
  "cmax": "Cmax value or null",
  "mic": "MIC value with units or null",
  "treatment_failure_rate": "X% or null",
  "adherence_percentage": "X% or null",
  "mdr_rate": "X% or null",
  "qt_prolongation": "description or null",
  "hepatotoxicity_incidence": "X per 10,000 or null",
  "loss_to_follow_up": "X% or null",
  "pfhrp2_deletion": "X% or null",
  "drug_interactions": ["description of interactions", ...],
  "treatment_protocols": ["protocol descriptions", ...],
  "key_finding_summary": "One sentence: key pharmacological/treatment finding for Ethiopia"
}`,

  psychological: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "phq9_score": "score or threshold or null",
  "gad7_score": "score or null",
  "pcl5_score": "score or null",
  "epds_score": "score or null",
  "whoqol_score": "value or null",
  "cd_risc_score": "resilience score or null",
  "suicide_rate": "rate or null",
  "treatment_gap": "X% or null",
  "relapse_rate": "X% or null",
  "ipv_rate": "X% or null",
  "epse_incidence": "incidence or null",
  "prevalence": "X% or null",
  "risk_factors": ["psychological risk factors", ...],
  "key_finding_summary": "One sentence: key mental health finding for Ethiopia"
}`,

  socioeconomic: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "oop_expenditure_pct": "X% or null",
  "che_rate": "X% or null",
  "cbhi_enrollment": "X% or null",
  "distance_to_facility": "distance/time or null",
  "mpi": "MPI value or null",
  "anc4_coverage": "X% or null",
  "sba_rate": "X% or null",
  "wash_access": "X% or null",
  "hfias_score": "score or null",
  "risk_factors": ["socioeconomic determinants", ...],
  "key_finding_summary": "One sentence: key socioeconomic health finding for Ethiopia"
}`,

  addiction: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "age_of_onset": "X years or null",
  "daily_consumption_grams": "X grams or null",
  "audit_score": "score or null",
  "ftnd_score": "score or null",
  "withdrawal_severity": "description or null",
  "substance_induced_psychosis": "X% or null",
  "relapse_rate": "X% or null",
  "rehabilitation_success": "X% or null",
  "prevalence": "X% or null",
  "risk_factors": ["addiction risk factors", ...],
  "key_finding_summary": "One sentence: key substance use finding for Ethiopia"
}`,

  biological: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "allele_frequency_hbs": "X% or null",
  "allele_frequency_g6pd": "X% or null",
  "hla_frequencies": "description or null",
  "epas1_variants": "description of EPAS1 variants or null",
  "microbiome_diversity": "alpha/beta diversity description or null",
  "firmicutes_bacteroidetes": "ratio or description or null",
  "cd4_count": "X cells/μL or null",
  "cytokine_profile": "description or null",
  "key_finding_summary": "One sentence: key biological/genetic finding for Ethiopian population"
}`,

  cultural: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "traditional_medicine_utilization": "X% or null",
  "delay_to_care_days": "X days or null",
  "fgmc_prevalence": "X% or null",
  "holy_water_art_substitution": "X% or null",
  "tba_delivery_rate": "X% or null",
  "postpartum_confinement_days": "X days or null",
  "illness_explanatory_models": ["cultural illness explanations", ...],
  "key_finding_summary": "One sentence: key cultural health practice finding for Ethiopia"
}`,

  astrological: `Extract from this abstract (return ONLY valid JSON, no markdown):
{
  "kiremt_malaria_odds_ratio": "OR value or null",
  "bega_meningitis_incidence": "incidence description or null",
  "belg_cholera_spike": "description or null",
  "lunar_cycle_correlation": "correlation or null",
  "fasting_caloric_deficit": "X kcal or null",
  "harvest_bmi_recovery": "description or null",
  "sad_prevalence": "X% or null",
  "seasonal_patterns": ["seasonal disease patterns", ...],
  "key_finding_summary": "One sentence: key seasonal/temporal health finding for Ethiopia"
}`,
};

// ─── Gemini fallback client ───────────────────────────────────────────────────

async function geminiExtract(
  abstract: string,
  strand: KnowledgeStrandType
): Promise<Partial<ExtractedLiteratureData> | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = STRAND_EXTRACTION_PROMPTS[strand];
  const fullPrompt = `${prompt}\n\nABSTRACT:\n${abstract.slice(0, 3000)}`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return parseJsonResponse(text);
  } catch {
    return null;
  }
}

// ─── JSON response parser (handles LLM quirks) ───────────────────────────────

function parseJsonResponse(text: string): Partial<ExtractedLiteratureData> | null {
  try {
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Sanitize: convert "null" strings to actual null, remove null fields
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === null || value === "null" || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      result[key] = value;
    }

    return result as Partial<ExtractedLiteratureData>;
  } catch {
    return null;
  }
}

// ─── Merge LLM results into extracted data ───────────────────────────────────

function mergeExtracted(
  base: ExtractedLiteratureData,
  llm: Partial<ExtractedLiteratureData>
): ExtractedLiteratureData {
  const merged = { ...base };

  for (const [key, value] of Object.entries(llm)) {
    if (value === null || value === undefined) continue;
    const k = key as keyof ExtractedLiteratureData;

    // Array fields: merge and deduplicate
    if (Array.isArray(value) && Array.isArray(merged[k])) {
      const existing = merged[k] as string[];
      const incoming = value as string[];
      (merged[k] as string[]) = [...new Set([...existing, ...incoming])];
    }
    // Scalar fields: LLM wins if regex didn't extract it
    else if (!merged[k]) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  // Boost confidence if LLM added fields
  const llmHits = Object.keys(llm).filter(
    (k) => k !== "key_finding_summary" && (llm as Record<string, unknown>)[k] !== null
  ).length;
  merged.confidence = Math.min((merged.confidence ?? 0) + llmHits * 0.06, 0.97);

  return merged;
}

// ─── Main export: LLM-augmented extraction ───────────────────────────────────

/**
 * Augments regex-extracted data with LLM-inferred structured fields.
 *
 * Fallback chain:
 *   1. BionicGPT (llama3 via BIONIC_GPT_API_KEY) — PRIMARY
 *   2. Gemini 1.5 Flash (via GEMINI_API_KEY) — FALLBACK
 *   3. null — returns base regex data unchanged (silent fail)
 *
 * Rate-limited: only processes abstracts longer than 200 chars.
 * Token cost: ~400-600 tokens per abstract (extraction prompt + abstract).
 */
export async function llmAugmentExtraction(
  abstract: string,
  strand: KnowledgeStrandType,
  baseExtracted: ExtractedLiteratureData
): Promise<ExtractedLiteratureData> {
  // Skip very short abstracts — not enough signal for LLM
  if (abstract.length < 200) return baseExtracted;

  // Skip if LLM enrichment is disabled
  if (process.env.LITERATURE_LLM_ENRICHMENT === "false") return baseExtracted;

  const prompt = STRAND_EXTRACTION_PROMPTS[strand];
  const systemMsg = `You are a precise biomedical data extraction AI focused on Ethiopian population health research. 
Extract ONLY numeric values, percentages, and short factual descriptions from the abstract.
Return ONLY valid JSON. Do not add commentary or markdown. Use null for fields not mentioned.`;

  // ── Try BionicGPT first ──────────────────────────────────────────────────
  if (isBionicConfigured()) {
    try {
      const response = await bionicChat({
        messages: [
          { role: "system", content: systemMsg },
          {
            role: "user",
            content: `${prompt}\n\nABSTRACT:\n${abstract.slice(0, 3000)}`,
          },
        ],
        temperature: 0.05, // Near-deterministic for data extraction
        maxTokens: 600,
      });

      const parsed = parseJsonResponse(response.content);
      if (parsed) {
        console.log(
          `[LLMSummarizer] BionicGPT extracted ${Object.keys(parsed).length} fields for strand: ${strand}`
        );
        return mergeExtracted(baseExtracted, parsed);
      }
    } catch (bionicErr) {
      console.warn(
        `[LLMSummarizer] BionicGPT failed (${(bionicErr as Error).message}), trying Gemini fallback...`
      );
    }
  }

  // ── Fallback: Gemini 1.5 Flash ──────────────────────────────────────────
  const geminiResult = await geminiExtract(abstract, strand);
  if (geminiResult) {
    console.log(
      `[LLMSummarizer] Gemini extracted ${Object.keys(geminiResult).length} fields for strand: ${strand}`
    );
    return mergeExtracted(baseExtracted, geminiResult);
  }

  // ── Both failed — return regex data unchanged ────────────────────────────
  return baseExtracted;
}

/**
 * Batch version — processes multiple abstracts with a concurrency limit.
 * Used by the main fetch cycle when processing an entire strand's articles.
 */
export async function llmBatchAugment(
  items: Array<{
    abstract: string;
    strand: KnowledgeStrandType;
    baseExtracted: ExtractedLiteratureData;
  }>,
  concurrency = 3
): Promise<ExtractedLiteratureData[]> {
  const results: ExtractedLiteratureData[] = new Array(items.length);

  // Process in batches of `concurrency` to respect rate limits
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((item) =>
        llmAugmentExtraction(item.abstract, item.strand, item.baseExtracted)
      )
    );

    batchResults.forEach((result, j) => {
      results[i + j] =
        result.status === "fulfilled"
          ? result.value
          : items[i + j].baseExtracted; // Fall back to regex result on error
    });

    // Small delay between batches to avoid rate limiting
    if (i + concurrency < items.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return results;
}
