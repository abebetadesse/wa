import type { KnowledgeStrandType } from "@/lib/knowledge/types";

// ─── Extracted Data from Abstracts ──────────────────────────────────────────

export interface ExtractedLiteratureData {
  // ── Epidemiological ──
  incidence?: string;
  prevalence?: string;
  case_fatality_rate?: string;
  r0?: string;
  dalys?: string;
  yll?: string;
  yld?: string;
  asir?: string;
  mmr?: string;
  imr?: string;
  nmr?: string;
  seroprevalence?: string;
  hospitalization_rate?: string;
  diagnostic_sensitivity?: string;
  diagnostic_specificity?: string;
  vaccination_coverage?: string;
  spatial_clustering?: string;
  mortality?: string;
  co_infection_rate?: string;

  // ── Ecological ──
  entomological_inoculation_rate?: string;
  sporozoite_rate?: string;
  biting_rate?: string;
  insecticide_resistance?: string;
  altitude_limits?: string;
  fluoride_concentration_ppm?: string;
  heavy_metals?: string;
  indoor_air_pm25?: string;
  zoonotic_spillover_rate?: string;
  ndvi_correlation?: string;
  water_ph?: string;

  // ── Biochemical ──
  ic50?: string;
  ec50?: string;
  mic?: string;
  tpc?: string;
  tfc?: string;
  antioxidant_dpph?: string;
  half_life?: string;
  cyp450_inhibition?: string;
  oxidative_stress_biomarkers?: string[];
  lipid_profile?: string;
  fasting_blood_glucose?: string;
  hba1c?: string;
  serum_ferritin?: string;
  serum_zinc?: string;
  vitamin_d_25oh?: string;
  urinary_iodine?: string;
  liver_enzymes?: string;
  molar_ratios?: string;
  bioavailability?: string;

  // ── Dietary ──
  glycemic_index?: string;
  glycemic_load?: string;
  haz_score?: string;
  waz_score?: string;
  whz_score?: string;
  baz_score?: string;
  muac?: string;
  sam_rate?: string;
  mam_rate?: string;
  mdd_w?: string;
  hdds?: string;
  exclusive_breastfeeding_rate?: string;
  mycotoxin_level_ppb?: string;
  fermentation_ph?: string;
  phytate_reduction?: string;
  caloric_deficit?: string;

  // ── Medication ──
  auc?: string;
  cmax?: string;
  tmax?: string;
  treatment_failure_rate?: string;
  adherence_percentage?: string;
  mmas_score?: string;
  mdr_rate?: string;
  qt_prolongation?: string;
  hepatotoxicity_incidence?: string;
  stockout_frequency?: string;
  loss_to_follow_up?: string;
  pfhrp2_deletion?: string;
  artemisinin_clearance?: string;

  // ── Psychological ──
  phq9_score?: string;
  gad7_score?: string;
  pcl5_score?: string;
  epds_score?: string;
  whoqol_score?: string;
  cd_risc_score?: string;
  suicide_rate?: string;
  stigma_scale?: string;
  treatment_gap?: string;
  relapse_rate?: string;
  epse_incidence?: string;
  ipv_rate?: string;

  // ── Socioeconomic ──
  oop_expenditure_pct?: string;
  che_rate?: string;
  cbhi_enrollment?: string;
  distance_to_facility?: string;
  mpi?: string;
  gini_coefficient?: string;
  anc4_coverage?: string;
  sba_rate?: string;
  wash_access?: string;
  hfias_score?: string;
  hew_ratio?: string;

  // ── Addiction ──
  age_of_onset?: string;
  daily_consumption_grams?: string;
  audit_score?: string;
  ftnd_score?: string;
  withdrawal_severity?: string;
  substance_induced_psychosis?: string;
  rehabilitation_success?: string;
  detoxification_completion?: string;

  // ── Biological ──
  allele_frequency_hbs?: string;
  allele_frequency_g6pd?: string;
  hla_frequencies?: string;
  epas1_variants?: string;
  microbiome_diversity?: string;
  firmicutes_bacteroidetes?: string;
  scfa_concentrations?: string;
  cd4_count?: string;
  cytokine_profile?: string;

  // ── Cultural ──
  traditional_medicine_utilization?: string;
  delay_to_care_days?: string;
  fgmc_prevalence?: string;
  holy_water_art_substitution?: string;
  tba_delivery_rate?: string;
  postpartum_confinement_days?: string;
  htp_prevalence?: string;
  illness_explanatory_models?: string[];

  // ── Astrological/Seasonal ──
  kiremt_malaria_odds_ratio?: string;
  bega_meningitis_incidence?: string;
  belg_cholera_spike?: string;
  lunar_cycle_correlation?: string;
  fasting_caloric_deficit?: string;
  harvest_bmi_recovery?: string;
  seasonal_sam_rates?: string;
  sad_prevalence?: string;

  // ── Generic (all strands) ──
  endemic_areas?: string[];
  risk_factors?: string[];
  treatment_protocols?: string[];
  drug_interactions?: string[];
  nutrients?: string[];
  seasonal_patterns?: string[];
  high_risk_groups?: string[];
  ethiopian_context?: string;
  key_finding_summary?: string;
  confidence?: number;
}

// ─── Raw article from source ─────────────────────────────────────────────────

export interface RawArticle {
  pmid?: string;
  doi?: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  source: LiteratureSourceName;
  meshTerms: string[];
  keywords: string[];
  citationCount?: number;
  fullTextUrl?: string;
}

export type LiteratureSourceName =
  | "pubmed"
  | "europepmc"
  | "who_gho"
  | "openalex"
  | "gbd_ihme"
  | "crossref";

// ─── Processed finding ready for DB ──────────────────────────────────────────

export interface ProcessedFinding {
  pmid?: string;
  doi?: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal: string;
  pubDate: string;
  source: LiteratureSourceName;
  strand: KnowledgeStrandType;
  strandTopicMatch?: string;
  relevanceScore: number;
  extractedData: ExtractedLiteratureData;
  meshTerms: string[];
  keywords: string[];
  citationCount?: number;
}

// ─── Fetch cycle summary ─────────────────────────────────────────────────────

export interface FetchCycleSummary {
  startedAt: string;
  completedAt: string;
  articlesFound: number;
  newArticles: number;
  updated: number;
  errors: string[];
  byStrand: Record<string, { found: number; new: number }>;
  bySource: Record<string, { found: number; errors: number }>;
}

// ─── Strand search config ─────────────────────────────────────────────────────

export interface StrandSearchConfig {
  topics?: string[];
  diseases?: string[];
  meshTerms: string[];
  dateRange: string;
  extractFields: string[];
}

// ─── Enrichment result for strand query() methods ────────────────────────────

export interface LiteratureEnrichment {
  pmid?: string;
  doi?: string;
  title: string;
  journal: string;
  pubDate: string;
  strand: KnowledgeStrandType;
  strandTopicMatch?: string;
  relevanceScore: number;
  extractedData: ExtractedLiteratureData;
  keywords: string[];
  citationCount?: number;
}
