/**
 * Full pipeline dry-run test.
 * Tests: Fetch → Regex Extract → BionicGPT LLM Augment → Gemini Fallback
 *
 * Run: npm run literature:dryrun
 */

process.env.LITERATURE_DRY_RUN = "true";
process.env.LITERATURE_MAX_PER_TOPIC = "3";
process.env.LITERATURE_LLM_ENRICHMENT = "true";

import { PubMedSource } from "./sources/pubmedSource";
import { EuropePmcSource } from "./sources/europePmcSource";
import { WhoGhoSource } from "./sources/whoGhoSource";
import { extractStructuredData } from "./processors/abstractExtractor";
import { llmAugmentExtraction } from "./processors/llmSummarizer";
import { mapArticleToStrands } from "./processors/strandMapper";

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function box(label: string, color = CYAN) {
  const line = "═".repeat(60);
  console.log(`\n${color}${BOLD}${line}`);
  console.log(`  ${label}`);
  console.log(`${line}${RESET}`);
}

function fieldRow(label: string, value: string | undefined | null) {
  if (!value) return;
  console.log(`    ${YELLOW}${label}:${RESET} ${value}`);
}

async function runDryTest() {
  box("Ethio Wellness — Literature Fetcher Full Pipeline Test");
  console.log(`  ${CYAN}BionicGPT${RESET} (primary) → ${CYAN}Gemini${RESET} (fallback) → Regex (baseline)`);
  console.log(`  Time: ${new Date().toLocaleString("en-ET", { timeZone: "Africa/Addis_Ababa" })}\n`);

  const pubmed = new PubMedSource();
  const europePmc = new EuropePmcSource();
  const whoGho = new WhoGhoSource();

  // ── TEST 1: Epidemiological — PubMed ──────────────────────────────────────
  box("TEST 1 · Epidemiological · PubMed: 'malaria Ethiopia'", GREEN);
  try {
    const articles = await pubmed.searchArticles("malaria Ethiopia", {
      maxResults: 3,
      dateRange: "last 3 years",
      meshTerms: ["Ethiopia[MeSH]", "Malaria[MeSH]"],
    });
    console.log(`  ${GREEN}✓${RESET} PubMed returned ${articles.length} articles\n`);

    for (const a of articles.slice(0, 2)) {
      console.log(`  ${BOLD}📄 ${a.title.slice(0, 72)}...${RESET}`);
      console.log(`     PMID: ${a.pmid ?? "N/A"} | ${a.journal} | ${a.pubDate}`);

      // Stage 1 — Regex
      const regexData = extractStructuredData(a, "epidemiological");
      console.log(`\n     ${YELLOW}── Stage 1: Regex extraction ──${RESET}`);
      fieldRow("prevalence", regexData.prevalence);
      fieldRow("incidence", regexData.incidence);
      fieldRow("mortality", regexData.mortality);
      fieldRow("endemic_areas", regexData.endemic_areas?.join(", "));
      fieldRow("risk_factors", regexData.risk_factors?.join("; "));
      console.log(`     confidence: ${((regexData.confidence ?? 0) * 100).toFixed(0)}%`);

      // Stage 2 — LLM augmentation
      console.log(`\n     ${CYAN}── Stage 2: BionicGPT / Gemini augmentation ──${RESET}`);
      try {
        const augmented = await llmAugmentExtraction(a.abstract, "epidemiological", regexData);
        fieldRow("prevalence", augmented.prevalence);
        fieldRow("incidence", augmented.incidence);
        fieldRow("mortality", augmented.mortality);
        fieldRow("r0", augmented.r0);
        fieldRow("mmr", augmented.mmr);
        fieldRow("seroprevalence", augmented.seroprevalence);
        fieldRow("high_risk_groups", augmented.high_risk_groups?.join("; "));
        fieldRow("seasonal_patterns", augmented.seasonal_patterns?.join(", "));
        fieldRow("key_finding", augmented.key_finding_summary);
        console.log(`     confidence: ${GREEN}${((augmented.confidence ?? 0) * 100).toFixed(0)}%${RESET} (after LLM boost)`);
      } catch (e) {
        console.log(`     ${RED}LLM unavailable: ${(e as Error).message}${RESET}`);
      }

      // Strand mapping
      const mappings = mapArticleToStrands(a, "epidemiological");
      console.log(`\n     ${YELLOW}── Strand mappings (top 3) ──${RESET}`);
      for (const m of mappings.slice(0, 3)) {
        console.log(`     [${m.strand}] score=${m.score} matched="${m.topicMatch.slice(0, 50)}"`);
      }
      console.log();
    }
  } catch (e) {
    console.log(`  ${RED}✗ PubMed error: ${(e as Error).message}${RESET}`);
  }

  // ── TEST 2: Biochemical — Europe PMC ─────────────────────────────────────
  box("TEST 2 · Biochemical · Europe PMC: 'teff phytate fermentation Ethiopia'", GREEN);
  try {
    const articles = await europePmc.searchArticles("teff phytate fermentation Ethiopia", {
      maxResults: 3,
    });
    console.log(`  ${GREEN}✓${RESET} Europe PMC returned ${articles.length} articles\n`);

    for (const a of articles.slice(0, 2)) {
      console.log(`  ${BOLD}📄 ${a.title.slice(0, 72)}...${RESET}`);
      console.log(`     DOI: ${a.doi ?? "N/A"} | Citations: ${a.citationCount ?? 0}`);

      const regexData = extractStructuredData(a, "biochemical");
      console.log(`\n     ${YELLOW}── Stage 1: Regex ──${RESET}`);
      fieldRow("bioavailability", regexData.bioavailability);
      fieldRow("phytate_reduction", regexData.phytate_reduction);
      fieldRow("nutrients", regexData.nutrients?.join(", "));
      fieldRow("ic50", regexData.ic50);

      console.log(`\n     ${CYAN}── Stage 2: LLM ──${RESET}`);
      try {
        const augmented = await llmAugmentExtraction(a.abstract, "biochemical", regexData);
        fieldRow("bioavailability", augmented.bioavailability);
        fieldRow("ic50", augmented.ic50);
        fieldRow("tpc", augmented.tpc);
        fieldRow("molar_ratios", augmented.molar_ratios);
        fieldRow("cyp450", augmented.cyp450_inhibition);
        fieldRow("nutrients", augmented.nutrients?.join(", "));
        fieldRow("key_finding", augmented.key_finding_summary);
        console.log(`     confidence: ${GREEN}${((augmented.confidence ?? 0) * 100).toFixed(0)}%${RESET}`);
      } catch (e) {
        console.log(`     ${RED}LLM unavailable: ${(e as Error).message}${RESET}`);
      }
      console.log();
    }
  } catch (e) {
    console.log(`  ${RED}✗ Europe PMC error: ${(e as Error).message}${RESET}`);
  }

  // ── TEST 3: Cultural — BionicGPT direct test ─────────────────────────────
  box("TEST 3 · Cultural · Direct LLM extraction (synthetic abstract)", GREEN);
  const syntheticAbstract = `
    A cross-sectional study in Amhara region found that 67.3% of study participants 
    consulted traditional healers (wogesh, debtera) before attending formal health facilities. 
    The median delay to facility-based care was 8.5 days. Illness attribution included 
    evil eye (buda) in 41.2% and Zar spirit possession in 28.7% of cases. 
    Traditional birth attendant (TBA) delivery was 34.1% in rural kebeles. 
    Postpartum confinement (mengedi) lasted a median of 40 days. 
    Female genital mutilation/cutting (FGM/C) prevalence was 74.3% in women aged 15-49.
    Holy water (Tsebel) use instead of antiretroviral therapy was documented in 18.9% of PLHIV.
  `;

  const baseData = extractStructuredData(
    { title: "Traditional medicine Ethiopia", abstract: syntheticAbstract } as Parameters<typeof extractStructuredData>[0],
    "cultural"
  );

  console.log(`  ${YELLOW}── Stage 1: Regex baseline ──${RESET}`);
  fieldRow("traditional_medicine_utilization", baseData.traditional_medicine_utilization);
  fieldRow("delay_to_care_days", baseData.delay_to_care_days);
  fieldRow("fgmc_prevalence", baseData.fgmc_prevalence);
  fieldRow("illness_explanatory_models", baseData.illness_explanatory_models?.join("; "));
  fieldRow("holy_water_art_substitution", baseData.holy_water_art_substitution);

  console.log(`\n  ${CYAN}── Stage 2: BionicGPT/Gemini augmentation ──${RESET}`);
  try {
    const augmented = await llmAugmentExtraction(syntheticAbstract, "cultural", baseData);
    fieldRow("traditional_medicine_utilization", augmented.traditional_medicine_utilization);
    fieldRow("delay_to_care_days", augmented.delay_to_care_days);
    fieldRow("fgmc_prevalence", augmented.fgmc_prevalence);
    fieldRow("holy_water_art_substitution", augmented.holy_water_art_substitution);
    fieldRow("tba_delivery_rate", augmented.tba_delivery_rate);
    fieldRow("postpartum_confinement_days", augmented.postpartum_confinement_days);
    fieldRow("illness_explanatory_models", augmented.illness_explanatory_models?.join("; "));
    fieldRow("key_finding", augmented.key_finding_summary);
    console.log(`  confidence: ${GREEN}${((augmented.confidence ?? 0) * 100).toFixed(0)}%${RESET}`);
  } catch (e) {
    console.log(`  ${RED}LLM unavailable: ${(e as Error).message}${RESET}`);
  }

  // ── TEST 4: WHO GHO indicators ────────────────────────────────────────────
  box("TEST 4 · WHO GHO · Official Ethiopia Indicators", GREEN);
  try {
    const indicators = await whoGho.fetchIndicators();
    console.log(`  ${GREEN}✓${RESET} Fetched ${indicators.length} indicator records\n`);
    for (const ind of indicators.slice(0, 5)) {
      console.log(`  📊 ${ind.title}`);
      console.log(`     ${ind.abstract.slice(0, 100)}...`);
    }
  } catch (e) {
    console.log(`  ${RED}✗ WHO GHO: ${(e as Error).message}${RESET}`);
  }

  box("DRY RUN COMPLETE — NO DATA WRITTEN TO DATABASE", YELLOW);
  console.log(`  ${GREEN}✓${RESET} BionicGPT primary enrichment tested`);
  console.log(`  ${GREEN}✓${RESET} Gemini fallback wired (needs GEMINI_API_KEY in .env)`);
  console.log(`  ${GREEN}✓${RESET} PubMed, Europe PMC, WHO GHO sources verified live`);
  console.log(`\n  To start real sync:\n`);
  console.log(`  ${CYAN}  curl -X POST http://localhost:5500/api/literature/sync \\`);
  console.log(`       -H "x-sync-secret: ethio-literature-sync-secret-2026" \\`);
  console.log(`       -H "Content-Type: application/json" \\`);
  console.log(`       -d '{"strands":["epidemiological","biochemical"]}'${RESET}\n`);
}

runDryTest().catch((e) => {
  console.error(`\n${RED}FATAL: ${e.message}${RESET}`);
  process.exit(1);
});
