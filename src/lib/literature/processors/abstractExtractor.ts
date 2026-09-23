import type { RawArticle, ExtractedLiteratureData } from "../types";
import type { KnowledgeStrandType } from "@/lib/knowledge/types";

/**
 * Extracts deeply structured, strand-aware data from a PubMed/PMC abstract.
 *
 * Uses regex pattern matching WITHOUT requiring an LLM call.
 * Bionic GPT LLM summarisation is an optional enhancement (see bottom).
 */
export function extractStructuredData(
  article: RawArticle,
  strand: KnowledgeStrandType
): ExtractedLiteratureData {
  const text = `${article.title} ${article.abstract}`.toLowerCase();
  const raw = article.abstract;

  const data: ExtractedLiteratureData = {
    keywords: article.keywords,
    confidence: 0,
  } as ExtractedLiteratureData;

  let hits = 0;

  // ─── Universal patterns ─────────────────────────────────────────────────────

  // Prevalence: "prevalence of X was 24.3%", "affecting 12% of"
  const prevMatch = raw.match(/preval[a-z]*[^.]{0,60}?(\d+\.?\d*)\s*%/i);
  if (prevMatch) { data.prevalence = `${prevMatch[1]}%`; hits++; }

  // Incidence: "incidence of 15 per 1,000", "6.2 cases per 100,000"
  const incMatch = raw.match(/inciden[a-z]*[^.]{0,60}?(\d+\.?\d*)\s*(?:per|\/)\s*([\d,]+)/i);
  if (incMatch) { data.incidence = `${incMatch[1]} per ${incMatch[2].replace(/,/g, "")}`; hits++; }

  // Mortality / Case-fatality
  const mortMatch = raw.match(/mortalit[a-z]*[^.]{0,60}?(\d+\.?\d*)\s*%/i);
  if (mortMatch) { data.mortality = `${mortMatch[1]}%`; hits++; }

  const cfrMatch = raw.match(/case[- ]fatality[^.]{0,40}?(\d+\.?\d*)\s*%/i);
  if (cfrMatch) { data.case_fatality_rate = `${cfrMatch[1]}%`; hits++; }

  // DALYs
  const dalysMatch = raw.match(/(\d[\d,.]*)\s*DALYs/i);
  if (dalysMatch) { data.dalys = dalysMatch[1]; hits++; }

  // Odds ratio
  const orMatch = raw.match(/odds ratio[^.]{0,40}?(\d+\.?\d+)/i);
  if (orMatch) { data.risk_factors = [`OR: ${orMatch[1]}`]; hits++; }

  // High-risk groups
  const highRiskPatterns = [
    /children[^,;.]{0,60}?at(?:\s+higher)?\s+risk/i,
    /pregnant women[^,;.]{0,40}/i,
    /hiv[^,;.]{0,40}?patients/i,
    /elderly[^,;.]{0,40}/i,
  ];
  const groups: string[] = [];
  for (const p of highRiskPatterns) {
    const m = raw.match(p);
    if (m) groups.push(m[0].trim().slice(0, 80));
  }
  if (groups.length) { data.high_risk_groups = groups; hits++; }

  // Ethiopian regional mentions
  const regionRegex = /(highlands?|lowlands?|rift valley|afar|somali|oromia|amhara|tigray|gambella|sidama|snnpr|addis ababa|hawassa|jimma|gondar|dire dawa)/gi;
  const regions = [...raw.matchAll(regionRegex)].map(m => m[0].toLowerCase());
  if (regions.length) { data.endemic_areas = [...new Set(regions)]; hits++; }

  // Nutrients mentioned
  const nutrientRegex = /(iron|zinc|calcium|vitamin [a-d]\d*|folate|folic acid|b12|cobalamin|iodine|selenium|magnesium|vitamin d)/gi;
  const nutrients = [...raw.matchAll(nutrientRegex)].map(m => m[0].toLowerCase());
  if (nutrients.length) { data.nutrients = [...new Set(nutrients)]; hits++; }

  // Seasonal patterns
  const seasonRegex = /(kiremt|bega|belg|rainy season|dry season|post-rain|harvest season|lean season)/gi;
  const seasons = [...raw.matchAll(seasonRegex)].map(m => m[0].toLowerCase());
  if (seasons.length) { data.seasonal_patterns = [...new Set(seasons)]; hits++; }

  // Treatment protocols
  const treatmentRegex = /(?:first.?line|treatment|regimen|protocol)[^.]{0,100}?(artemisinin|coartem|praziquantel|dots|art|amoxicillin|metformin|insulin|liposomal amphotericin|pentavalent antimonial)/gi;
  const treatments = [...raw.matchAll(treatmentRegex)].map(m => m[0].trim().slice(0, 120));
  if (treatments.length) { data.treatment_protocols = treatments; hits++; }

  // ─── Strand-specific extractions ───────────────────────────────────────────

  if (strand === "epidemiological") {
    // R0
    const r0Match = raw.match(/(?:basic reproduction number|R0|R_0)[^.]{0,30}?(\d+\.?\d*)/i);
    if (r0Match) { data.r0 = r0Match[1]; hits++; }

    // Seroprevalence
    const seroMatch = raw.match(/seropreval[a-z]*[^.]{0,60}?(\d+\.?\d*)\s*%/i);
    if (seroMatch) { data.seroprevalence = `${seroMatch[1]}%`; hits++; }

    // MMR
    const mmrMatch = raw.match(/maternal mortality ratio[^.]{0,40}?(\d+[\d,]*)\s*(?:per|\/)\s*100,?000/i);
    if (mmrMatch) { data.mmr = `${mmrMatch[1].replace(/,/g, "")} per 100,000`; hits++; }

    // IMR / NMR
    const imrMatch = raw.match(/infant mortality rate[^.]{0,40}?(\d+\.?\d*)\s*(?:per|\/)\s*1,?000/i);
    if (imrMatch) { data.imr = `${imrMatch[1]} per 1,000`; hits++; }

    const nmrMatch = raw.match(/neonatal mortality[^.]{0,40}?(\d+\.?\d*)\s*(?:per|\/)\s*1,?000/i);
    if (nmrMatch) { data.nmr = `${nmrMatch[1]} per 1,000`; hits++; }
  }

  if (strand === "ecological") {
    // EIR
    const eirMatch = raw.match(/(?:entomological inoculation rate|EIR)[^.]{0,40}?(\d+\.?\d*)/i);
    if (eirMatch) { data.entomological_inoculation_rate = eirMatch[1]; hits++; }

    // Sporozoite rate
    const spMatch = raw.match(/sporozoite rate[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (spMatch) { data.sporozoite_rate = `${spMatch[1]}%`; hits++; }

    // Fluoride concentration
    const fluorideMatch = raw.match(/fluoride[^.]{0,50}?(\d+\.?\d*)\s*mg\s*\/\s*[Ll]/i);
    if (fluorideMatch) { data.fluoride_concentration_ppm = `${fluorideMatch[1]} mg/L`; hits++; }

    // PM2.5
    const pm25Match = raw.match(/PM2\.5[^.]{0,40}?(\d+\.?\d*)\s*[μu]g\s*\/\s*m3/i);
    if (pm25Match) { data.indoor_air_pm25 = `${pm25Match[1]} μg/m³`; hits++; }

    // Altitude
    const altMatch = raw.match(/(\d{3,4})\s*m\s*(?:above sea level|a\.s\.l\.|altitude)/i);
    if (altMatch) { data.altitude_limits = `${altMatch[1]}m`; hits++; }
  }

  if (strand === "biochemical") {
    // IC50
    const ic50Match = raw.match(/IC[_\s]?50[^.]{0,40}?(\d+\.?\d*)\s*(?:μg|mg|μM|mM|nM)/i);
    if (ic50Match) { data.ic50 = ic50Match[0].trim().slice(0, 60); hits++; }

    // TPC
    const tpcMatch = raw.match(/total phenolic content[^.]{0,50}?(\d+\.?\d*)/i);
    if (tpcMatch) { data.tpc = tpcMatch[1]; hits++; }

    // Bioavailability
    const bioMatch = raw.match(/bioavailability[^.]{0,50}?(\d+\.?\d*)\s*%/i);
    if (bioMatch) { data.bioavailability = `${bioMatch[1]}%`; hits++; }

    // Ferritin
    const ferriMatch = raw.match(/(?:serum ferritin|ferritin level)[^.]{0,40}?(\d+\.?\d*)\s*(?:μg|ng)\/[Ll]/i);
    if (ferriMatch) { data.serum_ferritin = `${ferriMatch[1]} ng/L`; hits++; }

    // Vitamin D
    const vitDMatch = raw.match(/25[- ](?:OH|hydroxy)[D-]?[^.]{0,40}?(\d+\.?\d*)\s*nmol/i);
    if (vitDMatch) { data.vitamin_d_25oh = `${vitDMatch[1]} nmol/L`; hits++; }

    // CYP450
    if (/CYP[0-9][A-Z][0-9]/i.test(raw)) {
      data.cyp450_inhibition = "CYP isoform interaction documented";
      hits++;
    }

    // HbA1c
    const hba1cMatch = raw.match(/HbA1c[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (hba1cMatch) { data.hba1c = `${hba1cMatch[1]}%`; hits++; }
  }

  if (strand === "dietary") {
    // Glycemic index
    const giMatch = raw.match(/glycemic index[^.]{0,40}?(\d+\.?\d*)/i);
    if (giMatch) { data.glycemic_index = giMatch[1]; hits++; }

    // HAZ/WAZ/WHZ
    const hazMatch = raw.match(/HAZ[^.]{0,40}?(-?\d+\.?\d*)/i);
    if (hazMatch) { data.haz_score = hazMatch[1]; hits++; }

    const wazMatch = raw.match(/WAZ[^.]{0,40}?(-?\d+\.?\d*)/i);
    if (wazMatch) { data.waz_score = wazMatch[1]; hits++; }

    // MUAC
    const muacMatch = raw.match(/MUAC[^.]{0,40}?(\d+\.?\d*)\s*cm/i);
    if (muacMatch) { data.muac = `${muacMatch[1]} cm`; hits++; }

    // SAM
    const samMatch = raw.match(/severe acute malnutrition[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (samMatch) { data.sam_rate = `${samMatch[1]}%`; hits++; }

    // Mycotoxin/Aflatoxin
    const aflaMatch = raw.match(/aflatoxin[^.]{0,50}?(\d+\.?\d*)\s*(?:ppb|ng\/g|μg\/kg)/i);
    if (aflaMatch) { data.mycotoxin_level_ppb = aflaMatch[0].trim().slice(0, 60); hits++; }

    // Phytate reduction
    const phytateMatch = raw.match(/phytate[^.]{0,60}?(\d+\.?\d*)\s*%[^.]{0,20}?(?:reduc|decreas)/i);
    if (phytateMatch) { data.phytate_reduction = `${phytateMatch[1]}%`; hits++; }
  }

  if (strand === "medication") {
    // MIC
    const micMatch = raw.match(/MIC[^.]{0,40}?(\d+\.?\d*)\s*(?:μg|mg)\/mL/i);
    if (micMatch) { data.mic = micMatch[0].trim().slice(0, 60); hits++; }

    // AUC/Cmax/Tmax
    const aucMatch = raw.match(/AUC[^.]{0,40}?(\d+\.?\d*)/i);
    if (aucMatch) { data.auc = aucMatch[1]; hits++; }

    // Treatment failure
    const tfMatch = raw.match(/treatment failure[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (tfMatch) { data.treatment_failure_rate = `${tfMatch[1]}%`; hits++; }

    // Adherence
    const adhMatch = raw.match(/adheren[a-z]*[^.]{0,50}?(\d+\.?\d*)\s*%/i);
    if (adhMatch) { data.adherence_percentage = `${adhMatch[1]}%`; hits++; }

    // MDR
    const mdrMatch = raw.match(/(?:MDR|multidrug resistant)[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (mdrMatch) { data.mdr_rate = `${mdrMatch[1]}%`; hits++; }

    // PfHRP2 deletion
    if (/pfhrp[23]/i.test(raw)) {
      const hrpMatch = raw.match(/pfhrp[23][^.]{0,50}?(\d+\.?\d*)\s*%/i);
      if (hrpMatch) { data.pfhrp2_deletion = `${hrpMatch[1]}%`; hits++; }
    }

    // LTFU
    const ltfuMatch = raw.match(/loss to follow.?up[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (ltfuMatch) { data.loss_to_follow_up = `${ltfuMatch[1]}%`; hits++; }

    // QT prolongation
    const qtMatch = raw.match(/QT[c]? prolongation[^.]{0,50}?(\d+\.?\d*)/i);
    if (qtMatch) { data.qt_prolongation = qtMatch[0].trim().slice(0, 80); hits++; }
  }

  if (strand === "psychological") {
    // PHQ-9
    const phq9Match = raw.match(/PHQ-?9[^.]{0,40}?(\d+\.?\d*)/i);
    if (phq9Match) { data.phq9_score = phq9Match[1]; hits++; }

    // GAD-7
    const gad7Match = raw.match(/GAD-?7[^.]{0,40}?(\d+\.?\d*)/i);
    if (gad7Match) { data.gad7_score = gad7Match[1]; hits++; }

    // PCL-5
    const pclMatch = raw.match(/PCL-?5[^.]{0,40}?(\d+\.?\d*)/i);
    if (pclMatch) { data.pcl5_score = pclMatch[1]; hits++; }

    // EPDS
    const epdsMatch = raw.match(/EPDS[^.]{0,40}?(\d+\.?\d*)/i);
    if (epdsMatch) { data.epds_score = epdsMatch[1]; hits++; }

    // Treatment gap
    const tgMatch = raw.match(/treatment gap[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (tgMatch) { data.treatment_gap = `${tgMatch[1]}%`; hits++; }

    // Suicide rate
    const suicideMatch = raw.match(/suicide[^.]{0,50}?(\d+\.?\d*)\s*(?:per|\/)\s*([\d,]+)/i);
    if (suicideMatch) { data.suicide_rate = `${suicideMatch[1]} per ${suicideMatch[2]}`; hits++; }

    // IPV
    const ipvMatch = raw.match(/intimate partner violence[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (ipvMatch) { data.ipv_rate = `${ipvMatch[1]}%`; hits++; }
  }

  if (strand === "socioeconomic") {
    // OOP
    const oopMatch = raw.match(/out.of.pocket[^.]{0,50}?(\d+\.?\d*)\s*%/i);
    if (oopMatch) { data.oop_expenditure_pct = `${oopMatch[1]}%`; hits++; }

    // CHE
    const cheMatch = raw.match(/catastrophic wellbeing expenditure[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (cheMatch) { data.che_rate = `${cheMatch[1]}%`; hits++; }

    // ANC4
    const ancMatch = raw.match(/(?:ANC4|four antenatal)[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (ancMatch) { data.anc4_coverage = `${ancMatch[1]}%`; hits++; }

    // SBA
    const sbaMatch = raw.match(/skilled birth attendan[a-z]*[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (sbaMatch) { data.sba_rate = `${sbaMatch[1]}%`; hits++; }

    // WASH
    const washMatch = raw.match(/(?:safe water|improved water)[^.]{0,50}?(\d+\.?\d*)\s*%/i);
    if (washMatch) { data.wash_access = `${washMatch[1]}%`; hits++; }

    // CBHI
    const cbhiMatch = raw.match(/(?:CBHI|community.based wellbeing insurance)[^.]{0,50}?(\d+\.?\d*)\s*%/i);
    if (cbhiMatch) { data.cbhi_enrollment = `${cbhiMatch[1]}%`; hits++; }
  }

  if (strand === "addiction") {
    // AUDIT score
    const auditMatch = raw.match(/AUDIT[^.]{0,40}?(\d+\.?\d*)/i);
    if (auditMatch) { data.audit_score = auditMatch[1]; hits++; }

    // Khat consumption
    const khatQtyMatch = raw.match(/khat[^.]{0,60}?(\d+\.?\d*)\s*g(?:ram)?/i);
    if (khatQtyMatch) { data.daily_consumption_grams = `${khatQtyMatch[1]}g`; hits++; }

    // Age of onset
    const onsetMatch = raw.match(/(?:age of onset|initiation)[^.]{0,40}?(\d+\.?\d*)\s*years/i);
    if (onsetMatch) { data.age_of_onset = `${onsetMatch[1]} years`; hits++; }

    // Relapse
    const relapseMatch = raw.match(/relapse[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (relapseMatch) { data.relapse_rate = `${relapseMatch[1]}%`; hits++; }

    // Substance-induced psychosis
    const sipMatch = raw.match(/substance.induced psychosis[^.]{0,40}?(\d+\.?\d*)\s*%/i);
    if (sipMatch) { data.substance_induced_psychosis = `${sipMatch[1]}%`; hits++; }
  }

  if (strand === "biological") {
    // Allele frequencies
    const alleleMatch = raw.match(/(?:HbS|sickle cell|G6PD)[^.]{0,60}?(?:allele frequency|frequency)[^.]{0,30}?(\d+\.?\d*)\s*%/i);
    if (alleleMatch) { data.allele_frequency_hbs = `${alleleMatch[1]}%`; hits++; }

    // Microbiome diversity
    const diversityMatch = raw.match(/(?:alpha diversity|Shannon index|Simpson index)[^.]{0,40}?(\d+\.?\d*)/i);
    if (diversityMatch) { data.microbiome_diversity = diversityMatch[0].trim().slice(0, 80); hits++; }

    // Firmicutes/Bacteroidetes ratio
    const fbMatch = raw.match(/Firmicutes[^.]{0,60}?Bacteroidetes/i);
    if (fbMatch) { data.firmicutes_bacteroidetes = fbMatch[0].trim().slice(0, 80); hits++; }

    // CD4
    const cd4Match = raw.match(/CD4[^.]{0,40}?(\d+)\s*cells\/μL/i);
    if (cd4Match) { data.cd4_count = `${cd4Match[1]} cells/μL`; hits++; }
  }

  if (strand === "cultural") {
    // TM utilization
    const tmMatch = raw.match(/traditional medicine[^.]{0,60}?(\d+\.?\d*)\s*%/i);
    if (tmMatch) { data.traditional_medicine_utilization = `${tmMatch[1]}%`; hits++; }

    // Delay to care
    const delayMatch = raw.match(/delay[^.]{0,60}?(\d+\.?\d*)\s*days/i);
    if (delayMatch) { data.delay_to_care_days = `${delayMatch[1]} days`; hits++; }

    // FGM/C
    const fgmMatch = raw.match(/(?:FGM|female genital)[^.]{0,50}?(\d+\.?\d*)\s*%/i);
    if (fgmMatch) { data.fgmc_prevalence = `${fgmMatch[1]}%`; hits++; }

    // Holy water / Tsebel
    const tsMatch = raw.match(/(?:holy water|tsebel)[^.]{0,60}?(\d+\.?\d*)\s*%/i);
    if (tsMatch) { data.holy_water_art_substitution = `${tsMatch[1]}%`; hits++; }

    // Illness explanatory models
    const iemMatch = raw.match(/(buda|evil eye|zar|ye|setan|spirit|curse)[^.]{0,80}/gi);
    if (iemMatch) { data.illness_explanatory_models = iemMatch.map(m => m.trim().slice(0, 100)); hits++; }
  }

  if (strand === "astrological") {
    // Seasonal malaria odds ratio
    const kirMatch = raw.match(/(?:kiremt|rainy season)[^.]{0,80}?(?:OR|odds ratio)[^.]{0,30}?(\d+\.?\d+)/i);
    if (kirMatch) { data.kiremt_malaria_odds_ratio = `OR: ${kirMatch[1]}`; hits++; }

    // Fasting caloric deficit
    const fastMatch = raw.match(/fasting[^.]{0,60}?(\d+)\s*(?:kcal|Cal|calories)/i);
    if (fastMatch) { data.fasting_caloric_deficit = `${fastMatch[1]} kcal`; hits++; }

    // Seasonal incidence multiplier
    const seaIncMatch = raw.match(/(?:seasonal|wet season)[^.]{0,60}?(\d+\.?\d+)[x×]\s*(?:higher|increase)/i);
    if (seaIncMatch) { data.seasonal_patterns = [`${seaIncMatch[1]}× seasonal increase`]; hits++; }
  }

  // ─── Compute confidence score ──────────────────────────────────────────────
  const maxPossibleHits = 12;
  data.confidence = Math.min(hits / maxPossibleHits, 0.95);

  // ─── Ethiopian context summary (title + first sentence of abstract) ────────
  const firstSentence = raw.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 20) {
    data.ethiopian_context = firstSentence.slice(0, 200);
  }

  return data;
}
