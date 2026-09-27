import { LocationContext } from "@/lib/location/types";
import { queryPillar, resolveCulturalPillarId, resolveSpiritualPillarId } from "@/lib/knowledge/pillars";
import { SourceRef } from "@/lib/knowledge/pillars/types";

export interface UserProfileData {
  id?: string;
  userId: string;
  ageBand: string;
  sex: string;
  pregnancyStatus?: string | null;
  chronicConditions?: string[];
  currentMeds?: Array<{ name: string; dose?: string; drugClass?: string }>;
  allergies?: string[];
  traditionalUse?: Array<{ name: string; frequency?: string }>;
  diet?: { pattern?: string; restrictions?: string[] };
  substanceUse?: { coffeeCupsDaily?: number; khat?: boolean; alcohol?: string };
  location: LocationContext;
  spiritualContext?: string | null;
  culturalContext?: string | null;
  consentSpiritual?: boolean;
}

export interface PreliminaryAnalysis {
  id: string;
  profileId: string;
  locationSummary: {
    region: string;
    agroEcological: string;
    ecosystem: string;
    narrative: string; // culturally phrased
  };
  cultural: {
    observedPatterns: string[];
    guidance: string[];
    provenance: SourceRef[];
  };
  spiritual?: {
    framing: string;
    guidance: string[];
    provenance: SourceRef[];
  };
  nutrition: {
    localStaples: string[];
    seasonalGaps: { month: string; gap: string }[];
    micronutrientRisks: string[];
    foodBasedRecommendations: string[];
  };
  ecological: {
    endemicExposures: string[];
    waterAndSanitation: string[];
    vectorRisks: string[];
  };
  bodyScience: {
    summary: string;
    relevantSystems: string[];
  };
  confidence: "low" | "moderate" | "high";
  disclaimers: string[];
  generatedAt: string;
}

/**
 * Stage A: Evaluates a user profile against location-grounded knowledge pillars (§7).
 */
export async function evaluateProfile(profile: UserProfileData): Promise<PreliminaryAnalysis> {
  const ctx = profile.location;
  if (!ctx || !ctx.admin || !ctx.admin.region) {
    throw new Error("LOCATION_REQUIRED: No analysis may be produced without a resolved location context.");
  }

  // 1. Cultural Pillar
  const culturalPillarId = resolveCulturalPillarId(ctx);
  const culturalResult = await queryPillar<unknown, any>(culturalPillarId, profile, ctx);

  // 2. Spiritual Pillar (Strictly Opt-in)
  let spiritualSection: PreliminaryAnalysis["spiritual"] | undefined = undefined;
  if (profile.consentSpiritual && profile.spiritualContext) {
    const spiritualPillarId = resolveSpiritualPillarId(profile.spiritualContext);
    const spiritualResult = await queryPillar<any, any>(
      spiritualPillarId,
      { consented: true, spiritualContext: profile.spiritualContext },
      ctx
    );
    if (spiritualResult.data?.framing) {
      spiritualSection = {
        framing: spiritualResult.data.framing,
        guidance: spiritualResult.data.guidance || [],
        provenance: spiritualResult.provenance,
      };
    }
  }

  // 3. Ecological Pillars
  const [ecoZoneResult, watershedResult] = await Promise.all([
    queryPillar<unknown, any>("ecological.agroEcologicalZones", null, ctx),
    queryPillar<unknown, any>("ecological.watersheds", null, ctx),
  ]);

  // 4. Nutritional Pillars
  const [foodResult, seasonResult, microResult] = await Promise.all([
    queryPillar<unknown, any>("nutritional.foodSystems", null, ctx),
    queryPillar<unknown, any>("nutritional.seasonalAvailability", null, ctx),
    queryPillar<unknown, any>("nutritional.micronutrientGaps", null, ctx),
  ]);

  // Determine overall confidence
  let confidence: "low" | "moderate" | "high" = "high";
  if (ctx.confidence === "reduced") {
    confidence = "moderate";
  }
  if (!profile.ageBand || !profile.sex) {
    confidence = "low";
  }

  const disclaimers = [
    "No rule matched ≠ safe. Absence of a known interaction rule in the database does not guarantee safety or absence of clinical risk.",
  ];

  if (confidence === "low") {
    disclaimers.unshift("This is a preliminary orientation, not a diagnosis.");
  }

  const analysis: PreliminaryAnalysis = {
    id: `prelim-${Date.now()}`,
    profileId: profile.id || `prof-${profile.userId}`,
    locationSummary: {
      region: ctx.admin.region,
      agroEcological: ctx.agroEcological,
      ecosystem: ctx.ecosystem,
      narrative: `Rooted in the ${ctx.admin.region} highlands and valleys, where bodily wellness harmonizes with seasonal rains, elevation, and communal food traditions.`,
    },
    cultural: {
      observedPatterns: culturalResult.data.observedPatterns || [],
      guidance: culturalResult.data.guidance || [],
      provenance: culturalResult.provenance,
    },
    spiritual: spiritualSection,
    nutrition: {
      localStaples: foodResult.data.staples || [],
      seasonalGaps: seasonResult.data.seasonalGaps || [],
      micronutrientRisks: microResult.data.vulnerableNutrients || [],
      foodBasedRecommendations: microResult.data.recommendations || [],
    },
    ecological: {
      endemicExposures: ctx.endemicDiseases || [],
      waterAndSanitation: watershedResult.data.waterQualityRisks || [],
      vectorRisks: watershedResult.data.sanitationVectorRisks || [],
    },
    bodyScience: {
      summary: `Your physiology operates in a ${ctx.agroEcological} altitude context (${ctx.altitudeBand}m). Atmospheric pressure and temperature require steady hydration and iron-rich nutrition for cellular oxygenation.`,
      relevantSystems: ["Cardiovascular Adaptation", "Gastrointestinal Microbiome", "Thermoregulation"],
    },
    confidence,
    disclaimers,
    generatedAt: new Date().toISOString(),
  };

  return analysis;
}
