export type ObservationMethod = "survey" | "modelled" | "registry" | "lab" | "estimate";
export type DataStatus = "observed" | "modelled" | "estimated" | "placeholder" | "not_verified";
export type AgreementStatus = "primary" | "consistent" | "within_ci" | "conflicting" | "superseded";
export type ConfidenceLevel = "high" | "medium" | "low" | "very_low" | "unknown";
export type SensitivityClass = "public" | "internal" | "restricted" | "confidential";
export type PeriodType = "day" | "week" | "month" | "quarter" | "year" | "season" | "dekad" | "custom";
export type EntityClass = "endurant" | "perdurant" | "abstract";
export type ScaleType = "nominal" | "ordinal" | "interval" | "ratio" | "absolute" | "log_interval" | "cyclic" | "compositional";

export interface LocationObservation {
  observationUid: string;
  observationId: string;
  locationId: string;
  spatialId?: string;
  indicatorCode: string;
  value: number | null;
  valueLowerCi?: number | null;
  valueUpperCi?: number | null;
  valueDistribution?: "normal" | "lognormal" | "beta" | "gamma" | "empirical" | "binomial" | "poisson" | "multinomial" | "unknown";
  valueStandardDeviation?: number | null;
  valueCoefficientOfVariation?: number | null;
  valuePrecision?: number | null;
  eventsCount?: number | null;
  denominatorCount?: number | null;
  designEffect?: number | null;
  censored?: "none" | "left" | "right" | "interval";
  limitOfDetection?: number | null;
  limitOfQuantification?: number | null;
  unit: string;
  sampleSize?: number | null;
  standardError?: number | null;
  method: ObservationMethod;
  methodFamily?: "survey" | "registry" | "model" | "census" | "sentinel" | "administrative" | "remote_sensing" | "lab" | "estimate";
  methodDetail?: string;
  modelName?: string;
  modelVersion?: string;
  modelRunId?: string;
  adjustmentApplied?: string;
  disaggregation?: string;
  disaggregationAxes?: Record<string, string>;
  periodType?: PeriodType;
  periodValue?: string;
  periodStart?: string;
  periodEnd?: string;
  validFrom: string;
  validTo?: string | null;
  transactionFrom: string;
  transactionTo?: string | null;
  supersededBy?: string;
  revisionReason?: string;
  referenceYear: number;
  sourceId?: string;
  citationUid?: string;
  rightsCode?: string;
  sensitivityClass?: SensitivityClass;
  confidenceLevel?: ConfidenceLevel;
  confidenceBasis?: "sampling" | "model" | "expert" | "inferred" | "triangulated" | "unknown";
  confidenceRationale?: string;
  dataStatus: DataStatus;
  lastUpdated?: string;
  nextReviewDue?: string;
  note?: string;
}

export interface IndicatorDefinition {
  indicatorUid: string;
  code: string;
  name: string;
  labelAmharic?: string;
  labelLocal?: string;
  domain: "health" | "demography" | "ecology" | "agriculture" | "food" | "chemicals" | "urbanization";
  subdomain?: string;
  preferredUnit: string;
  valueType?: "count" | "ratio" | "mean" | "median" | "proportion" | "rate" | "index" | "concentration" | "ordinal";
  scaleType?: ScaleType;
  invarianceGroup?: string;
  legalOperations?: string[];
  ilrReference?: string;
  ontology?: string;
  direction?: "higher_is_worse" | "higher_is_better" | "descriptive";
  aggregationRule?: "sum" | "mean" | "median" | "max" | "min" | "last";
  recommendedAxes?: string[];
  preferredSource?: string;
  notes?: string;
}

export interface KnowledgeEntity {
  entityUid: string;
  entityType: "location" | "food" | "indicator" | "chemical" | "taxon" | "event" | "group";
  entityClass: EntityClass;
  label: string;
  validFrom?: string;
  validTo?: string;
  parentEntityUid?: string;
}

export interface EntityCrosswalk {
  entityUid: string;
  entityType: "location" | "food" | "indicator" | "chemical" | "taxon";
  authority: "geonames" | "gadm" | "wikidata" | "foodon" | "chebi" | "pubchem" | "ncbi_taxonomy" | "gbif" | "osm" | "other";
  externalId: string;
  externalUri?: string;
  matchConfidence: number;
  matchMethod: "exact" | "fuzzy" | "manual" | "inferred";
  assertedAt: string;
}

export interface ParthoodRelation {
  wholeUid: string;
  partUid: string;
  relationType: "administrative" | "hydrological" | "ecological" | "service" | "electoral" | "economic" | "informal";
  mereologySystem: string;
  validFrom: string;
  validTo?: string;
  sharePct?: number;
  sourceId?: string;
}

export interface BoundaryEvent {
  eventUid: string;
  eventType: "split" | "merge" | "transfer" | "rename" | "regrade" | "abolish" | "create";
  effectiveDate: string;
  affectedUids: string[];
  successorUids: string[];
  predecessorUids: string[];
  legalInstrument?: string;
  sourceId?: string;
}

export interface EntityAssertion {
  assertionUid: string;
  rawString: string;
  resolvedUid?: string;
  resolutionMethod: "exact" | "fuzzy" | "gazetteer" | "manual" | "llm";
  resolutionScore?: number;
  alternatives?: Array<{ uid: string; score: number; reason: string }>;
  resolvedAt?: string;
}

export interface SourceComparison {
  locationId: string;
  indicatorCode: string;
  sourceId: string;
  value: number;
  method: ObservationMethod;
  referenceYear: number;
  agreementWithPrimary: AgreementStatus;
  note?: string;
}

export interface ProvenanceRecord {
  tableName: string;
  rowKey: string;
  fieldName: string;
  sourceId: string;
  method: ObservationMethod;
  confidence: "high" | "medium" | "low" | "unknown";
  lastVerified: string;
}

export interface CitationRecord {
  citationUid: string;
  observationUid?: string;
  sourceId: string;
  pageNumber?: string;
  tableNumber?: string;
  figureNumber?: string;
  section?: string;
  lineOrRow?: string;
  verbatimQuote?: string;
  locatorUrl?: string;
  accessedAt?: string;
  extractionMethod: "manual" | "ocr" | "api" | "scrape";
}

export interface ProvActivity {
  activityUid: string;
  activityType: "survey" | "lab_analysis" | "ocr" | "compilation" | "model_run" | "field_measurement";
  label?: string;
  startedAt?: string;
  endedAt?: string;
  instrument?: string;
  protocolUid?: string;
  protocolVersion?: string;
  locationId?: string;
  environment?: Record<string, number | string>;
}

export interface ProvAgent {
  agentUid: string;
  agentType: "person_role" | "organisation" | "software";
  role?: "enumerator" | "analyst" | "reviewer" | "lab" | "api";
  organisationUid?: string;
  softwareName?: string;
  softwareVersion?: string;
  notes?: string;
}

export interface ProvDerivation {
  derivedUid: string;
  sourceUid: string;
  relationType: "wasDerivedFrom" | "wasRevisionOf" | "wasQuotedFrom" | "wasInvalidatedBy";
  transformation?: string;
  expression?: string;
  assertedAt: string;
}

export interface SpatialUnit {
  spatialId: string;
  locationId: string;
  parentId?: string;
  level: "region" | "zone" | "woreda" | "kebele" | "catchment" | "sampling_point";
  levelNumber?: number;
  name: string;
  nameAmharic?: string;
  nameLocal?: string;
  authority?: "gadm" | "osm" | "national" | "project";
  externalId?: string;
  areaKm2?: number;
  urbanRural?: "urban" | "peri_urban" | "rural";
  latitude?: number;
  longitude?: number;
  geometryWkt?: string;
  validFrom?: string;
  validTo?: string;
}

export interface PointFeature {
  featureUid: string;
  featureType: "water_sample" | "well" | "clinic" | "school" | "market" | "weather_station" | "beekeeper";
  locationId: string;
  spatialId?: string;
  name?: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  activeFrom?: string;
  activeTo?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface DataQualitySummary {
  locationId: string;
  completenessPct: number;
  confidence: "high" | "medium" | "low" | "unknown";
  fieldsReviewed: number;
  fieldsPopulated: number;
  consistencyPct?: number;
  accuracyPct?: number;
  medianAgeYears?: number;
  uniquenessPct?: number;
  validityPct?: number;
  compositeScore?: number;
  lastReviewed: string;
  nextReviewDue?: string;
  gaps: string[];
}

export interface DataGap {
  gapUid: string;
  locationId: string;
  tableName: string;
  fieldName?: string;
  indicatorCode?: string;
  gapType: "missing" | "stale" | "unverified" | "conflicting" | "method_mismatch" | "unit_ambiguous";
  severity: "blocking" | "high" | "medium" | "low";
  identifiedAt: string;
  remediationPlan?: string;
  targetDate?: string;
  closedAt?: string;
  missingnessMechanism?: "MCAR" | "MAR" | "MNAR" | "unknown";
  mechanismBasis?: string;
  imputationPolicy?: "none" | "MI" | "FCS" | "selection_model" | "bounds" | "pattern_mixture";
  imputed?: boolean;
  imputationSet?: number;
}

export interface ConflictRecord {
  conflictUid: string;
  indicatorCode: string;
  locationId: string;
  observationUidA: string;
  observationUidB: string;
  discrepancyPct?: number;
  discrepancyType?: "magnitude" | "direction" | "method" | "period";
  resolutionStatus: "open" | "resolved_by_preference" | "resolved_by_meta_analysis" | "accepted_ambiguity";
  preferredUid?: string;
  resolutionRationale?: string;
}

export interface RightsDefinition {
  code: string;
  label: string;
  url?: string;
  attributionRequired: boolean;
  redistribution: "open" | "conditional" | "internal" | "forbidden";
}

export interface CulturalReview {
  reviewUid: string;
  entityUid: string;
  custodianRole?: string;
  community?: string;
  reviewedAt?: string;
  outcome: "approved" | "approved_with_changes" | "rejected" | "pending";
  conditions?: string;
  reviewNote?: string;
}

export interface KnowledgeEdge {
  subjectUid: string;
  subjectType: string;
  predicate: "located_in" | "food_in_recipe" | "grown_in" | "depends_on" | "produced_by" | "consumed_by" | "affects" | "treats" | "prevents" | "causes" | "associated_with" | "modulated_by" | "upstream_of" | "downstream_of" | "overlaps" | "adjacent_to" | "derived_from" | "measured_at" | "sampled_at" | "observed_in" | "reported_by" | "regulated_by" | "registered_for" | "restricted_in";
  objectUid: string;
  objectType: string;
  weight?: number;
  confidence?: ConfidenceLevel;
  validFrom?: string;
  validTo?: string;
  sourceId?: string;
}

export interface DerivedIndicator {
  derivedUid: string;
  indicatorCode: string;
  locationId: string;
  spatialId?: string;
  periodStart?: string;
  periodEnd?: string;
  value: number | null;
  unit: string;
  expression: string;
  inputUids: string[];
  computedAt: string;
  engineVersion: string;
  stale: boolean;
}

export interface PartialIdentification {
  indicatorCode: string;
  locationId: string;
  periodStart: string;
  periodEnd: string;
  lowerBound: number;
  upperBound: number;
  monotonicity?: "none" | "increasing" | "decreasing" | "convex";
  assumptions: string[];
  sourceId?: string;
}

export interface CausalDag {
  dagUid: string;
  scope: string;
  nodes: string[];
  edges: Array<{ from: string; to: string; sign: "positive" | "negative" | "unknown"; assumptions: string[] }>;
  latentNodes?: string[];
  identification?: "back_door" | "front_door" | "iv" | "regression_discontinuity" | "difference_in_differences" | "none";
  identifyingSets?: string[][];
  estimand?: "ATE" | "ATT" | "CATE" | "LATE" | "MTE";
  assumptions: string[];
  version: string;
}

export interface CausalEstimate {
  estimateUid: string;
  dagUid: string;
  exposureUid: string;
  outcomeUid: string;
  estimator: "IPW" | "AIPW" | "TMLE" | "2SLS" | "DiD" | "RD" | "doubly_robust" | "g_computation";
  pointEstimate?: number;
  standardError?: number;
  ciLower?: number;
  ciUpper?: number;
  estimand?: string;
  assumptionsHeld: string[];
  assumptionsTested: string[];
  falsificationTests?: Record<string, number | boolean | string>;
  eValue?: number;
  sourceId?: string;
  engine?: string;
  engineVersion?: string;
}

export interface PrivacyBudget {
  locationId: string;
  spatialLevel: string;
  periodStart: string;
  periodEnd: string;
  epsilonAllocated: number;
  epsilonSpent: number;
  deltaAllocated?: number;
  deltaSpent: number;
  mechanism?: "laplace" | "gaussian" | "exponential" | "bounded_range";
}

export interface SuppressionRule {
  ruleUid: string;
  spatialLevel: string;
  indicatorType?: "count" | "rate" | "proportion";
  thresholdN?: number;
  secondarySuppression: boolean;
  complementSuppression: boolean;
  geographicPrecisionMax?: string;
  temporalPrecisionMax?: string;
}

export interface SimulationModel {
  simUid: string;
  name: string;
  scope: string;
  components: Record<string, unknown>;
  dynamics: Record<string, unknown>;
  stochastic: boolean;
  engine?: string;
  engineVersion?: string;
  calibratedAgainst?: string[];
}

export interface SimulationRun {
  runUid: string;
  simUid: string;
  intervention: Record<string, unknown>;
  seed: number;
  outputs?: Record<string, number>;
  uncertainty?: Record<string, unknown>;
  engineVersion?: string;
  executedAt: string;
}

export interface TemporalRelation {
  leftUid: string;
  rightUid: string;
  relation: "before" | "after" | "meets" | "met_by" | "overlaps" | "overlapped_by" | "during" | "contains" | "starts" | "started_by" | "finishes" | "finished_by" | "equals";
  sourceId?: string;
}

export interface SpatialRelation {
  leftUid: string;
  rightUid: string;
  relation: "disjoint" | "touches" | "overlaps" | "contains" | "inside" | "covers" | "covered_by" | "equal";
  distanceKm?: number;
  sourceId?: string;
}

export interface SchemaVersion {
  version: string;
  releasedAt: string;
  breakingChanges: string[];
  backwardsCompatibleWith: string[];
  deprecatedFields: string[];
}

export interface OntologyVersion {
  authority: string;
  version: string;
  releasedAt?: string;
  deprecatedCodes?: Record<string, string>;
}

export interface QualitySla {
  datasetUid: string;
  indicatorCode?: string;
  completenessMin?: number;
  timelinessMaxDays?: number;
  accuracyMin?: number;
  methodsRequired?: string[];
  sourceMinCount?: number;
  reviewRequired: boolean;
}

export interface InvariantCheck {
  invariantUid: string;
  scope: string;
  expression: string;
  severity: "error" | "warning" | "info";
  lastResult?: boolean;
  lastFailures?: string[];
}

export interface EpistemicSummary {
  locationId: string;
  domain: string;
  knownCount: number;
  modelledCount: number;
  assumedCount: number;
  unknownCount: number;
  meanConfidence: number;
  medianAgeYears: number;
}

export interface AuditChainEntry {
  sequence: number;
  entityUid: string;
  changeType: "created" | "edited" | "reviewed" | "approved" | "deprecated" | "exported";
  changePayload: Record<string, unknown>;
  previousHash: string;
  currentHash: string;
  changedAt: string;
}

export interface FoodConsumptionObservation extends LocationObservation {
  foodId: string;
  populationGroup: string;
  consumptionGramsPerDay?: number;
  energyKcalPerDay?: number;
  surveyName?: string;
}

export interface NutritionSurvey {
  surveyId: string;
  name: string;
  year: number;
  design?: string;
  sampleSize?: number;
  ageGroup?: string;
  locationId: string;
  indicatorCode: string;
  value: number;
  unit: string;
  valueLowerCi?: number;
  valueUpperCi?: number;
  sourceId: string;
}

export const LOCATION_INDICATORS: IndicatorDefinition[] = [
  { indicatorUid: "urn:ind:et:health:malaria-incidence", code: "health.malaria.incidence", name: "Malaria incidence", domain: "health", preferredUnit: "/[100000].a", valueType: "rate", scaleType: "ratio", legalOperations: ["rate", "trend"], ontology: "ICD11:1F40", direction: "higher_is_worse", recommendedAxes: ["age", "sex", "residence"] },
  { indicatorUid: "urn:ind:et:health:hypertension-prevalence", code: "health.hypertension.prevalence", name: "Hypertension prevalence", domain: "health", preferredUnit: "%", valueType: "proportion", scaleType: "absolute", legalOperations: ["difference", "ratio"], ontology: "ICD11:BA00", direction: "higher_is_worse", recommendedAxes: ["age", "sex"] },
  { indicatorUid: "urn:ind:et:demography:population-total", code: "demo.population.total", name: "Estimated population", domain: "demography", preferredUnit: "1", valueType: "count", scaleType: "absolute", legalOperations: ["sum", "difference"], direction: "descriptive" },
  { indicatorUid: "urn:ind:et:food:consumption", code: "food.consumption", name: "Food consumption", domain: "food", preferredUnit: "g/d", valueType: "mean", scaleType: "ratio", legalOperations: ["mean", "median"], ontology: "FAO/INFOODS", direction: "descriptive" },
  { indicatorUid: "urn:ind:et:food:protein", code: "food.composition.protein", name: "Crude protein", domain: "food", preferredUnit: "g/100g", valueType: "concentration", scaleType: "ratio", legalOperations: ["mean", "median"], ontology: "INFOODS:PROCNT", direction: "descriptive" },
  { indicatorUid: "urn:ind:et:ecology:precipitation", code: "ecology.precipitation", name: "Annual precipitation", domain: "ecology", preferredUnit: "mm", valueType: "mean", scaleType: "ratio", legalOperations: ["mean", "sum", "trend"], direction: "descriptive" },
  { indicatorUid: "urn:ind:et:ecology:soil-ph", code: "ecology.soil.ph", name: "Soil pH", domain: "ecology", preferredUnit: "[pH]", valueType: "mean", scaleType: "interval", legalOperations: ["mean", "difference"], ontology: "WRB", direction: "descriptive" },
  { indicatorUid: "urn:ind:et:agriculture:crop-yield", code: "agri.yield.crop", name: "Crop yield", domain: "agriculture", preferredUnit: "kg/ha", valueType: "mean", scaleType: "ratio", legalOperations: ["mean", "median", "trend"], ontology: "AGROVOC", direction: "descriptive" },
  { indicatorUid: "urn:ind:et:chemicals:residue", code: "chemicals.residue", name: "Chemical residue", domain: "chemicals", preferredUnit: "mg/kg", valueType: "concentration", scaleType: "ratio", legalOperations: ["mean", "max"], direction: "higher_is_worse" },
  { indicatorUid: "urn:ind:et:urbanization:built-up-area", code: "urbanization.built_up_area", name: "Built-up area", domain: "urbanization", preferredUnit: "%", valueType: "proportion", scaleType: "absolute", legalOperations: ["difference", "ratio"], direction: "descriptive" },
];

const REVIEW_DATE = "2026-09-18";

export function buildDenseLocationData(locationId: string): {
  entities: KnowledgeEntity[];
  observations: LocationObservation[];
  sourceComparisons: SourceComparison[];
  entityCrosswalks: EntityCrosswalk[];
  parthood: ParthoodRelation[];
  boundaryEvents: BoundaryEvent[];
  entityAssertions: EntityAssertion[];
  spatialUnits: SpatialUnit[];
  pointFeatures: PointFeature[];
  provenance: ProvenanceRecord[];
  citations: CitationRecord[];
  provActivities: ProvActivity[];
  provAgents: ProvAgent[];
  provDerivations: ProvDerivation[];
  dataQuality: DataQualitySummary;
  dataGaps: DataGap[];
  conflicts: ConflictRecord[];
  partialIdentifications: PartialIdentification[];
  causalDags: CausalDag[];
  causalEstimates: CausalEstimate[];
  privacyBudgets: PrivacyBudget[];
  suppressionRules: SuppressionRule[];
  simulationModels: SimulationModel[];
  simulationRuns: SimulationRun[];
  temporalRelations: TemporalRelation[];
  spatialRelations: SpatialRelation[];
  schemaVersions: SchemaVersion[];
  ontologyVersions: OntologyVersion[];
  qualitySlas: QualitySla[];
  invariants: InvariantCheck[];
  epistemicSummaries: EpistemicSummary[];
  auditChain: AuditChainEntry[];
  rights: RightsDefinition[];
  culturalReviews: CulturalReview[];
  graphEdges: KnowledgeEdge[];
  derivedIndicators: DerivedIndicator[];
  foodConsumption: FoodConsumptionObservation[];
  nutritionSurveys: NutritionSurvey[];
  ingredients: Ingredient[];
  ingredientNutrients: IngredientNutrient[];
  recipes: Recipe[];
  recipeIngredients: RecipeIngredient[];
  recipeEstimates: RecipeEstimate[];
  recipeReconstructions: RecipeReconstruction[];
} {
  const locationUid = `urn:loc:et:${locationId}`;
  return {
    entities: [{ entityUid: locationUid, entityType: "location", entityClass: "endurant", label: locationId, validFrom: "2020-01-01" }],
    observations: [],
    sourceComparisons: [],
    entityCrosswalks: [],
    parthood: [],
    boundaryEvents: [],
    entityAssertions: [],
    spatialUnits: [{ spatialId: locationUid, locationId, level: "region", levelNumber: 1, name: locationId, authority: "project", validFrom: "2020-01-01" }],
    pointFeatures: [],
    provenance: [],
    citations: [],
    provActivities: [],
    provAgents: [],
    provDerivations: [],
    dataQuality: {
      locationId,
      completenessPct: 0,
      confidence: "unknown",
      fieldsReviewed: 0,
      fieldsPopulated: 0,
      consistencyPct: 0,
      accuracyPct: 0,
      medianAgeYears: 0,
      uniquenessPct: 100,
      validityPct: 100,
      compositeScore: 0,
      lastReviewed: REVIEW_DATE,
      gaps: ["No linked observation series or field-level provenance has been verified yet."],
    },
    dataGaps: [{
      gapUid: `gap:${locationId}:dense-data`,
      locationId,
      tableName: "denseData",
      gapType: "unverified",
      severity: "high",
      identifiedAt: REVIEW_DATE,
      remediationPlan: "Import cited, reviewed observations and assign spatial and bitemporal metadata.",
    }],
    conflicts: [],
    partialIdentifications: [],
    causalDags: [],
    causalEstimates: [],
    privacyBudgets: [],
    suppressionRules: [{
      ruleUid: `suppression:${locationId}:small-count`,
      spatialLevel: "kebele",
      indicatorType: "count",
      thresholdN: 5,
      secondarySuppression: true,
      complementSuppression: true,
      geographicPrecisionMax: "woreda",
      temporalPrecisionMax: "year",
    }],
    simulationModels: [],
    simulationRuns: [],
    temporalRelations: [],
    spatialRelations: [],
    schemaVersions: [{ version: "1.1.0", releasedAt: REVIEW_DATE, breakingChanges: [], backwardsCompatibleWith: ["1.0.0"], deprecatedFields: [] }],
    ontologyVersions: [],
    qualitySlas: [],
    invariants: [
      { invariantUid: `invariant:${locationId}:citation`, scope: "observation", expression: "value != null implies citationUid != null or dataStatus is estimated/placeholder", severity: "warning" },
      { invariantUid: `invariant:${locationId}:non-negative`, scope: "count indicators", expression: "count values must be >= 0", severity: "error" },
    ],
    epistemicSummaries: [{ locationId, domain: "all", knownCount: 0, modelledCount: 0, assumedCount: 0, unknownCount: 1, meanConfidence: 0, medianAgeYears: 0 }],
    auditChain: [],
    rights: [{ code: "internal-reference", label: "Internal reference pending source review", attributionRequired: true, redistribution: "internal" }],
    culturalReviews: [],
    graphEdges: [],
    derivedIndicators: [],
    foodConsumption: [],
    nutritionSurveys: [],
    ingredients: [],
    ingredientNutrients: [],
    recipes: [],
    recipeIngredients: [],
    recipeEstimates: [],
    recipeReconstructions: [],
  };
}

export function validateDenseLocationData(data: { observations: LocationObservation[] }): string[] {
  const failures: string[] = [];
  for (const observation of data.observations) {
    if (observation.value !== null && observation.value < 0 && observation.indicatorCode.includes("count")) {
      failures.push(`${observation.observationUid}: count values cannot be negative`);
    }
    if (observation.value !== null && !observation.citationUid && !["estimated", "placeholder", "not_verified"].includes(observation.dataStatus)) {
      failures.push(`${observation.observationUid}: published numeric observations require a citation`);
    }
    if (new Date(observation.transactionFrom).getTime() < new Date(observation.validFrom).getTime() && observation.method === "survey") {
      failures.push(`${observation.observationUid}: transaction and valid timestamps require review`);
    }
  }
  return failures;
}
import type { Ingredient, IngredientNutrient, Recipe, RecipeEstimate, RecipeIngredient, RecipeReconstruction } from "@/lib/nutrition/ingredientComposition";
