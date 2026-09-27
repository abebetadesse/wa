import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult } from "./types";

import { culturalHighlandsPillar } from "./cultural/ethiopia.highlands.v1";
import { culturalRiftValleyPillar } from "./cultural/ethiopia.riftvalley.v1";
import { culturalLowlandsPillar } from "./cultural/ethiopia.lowlands.v1";

import { spiritualOrthodoxPillar } from "./spiritual/orthodox.tewahedo.v1";
import { spiritualIslamicPillar } from "./spiritual/islamic.harari.v1";
import { spiritualTraditionalPillar } from "./spiritual/traditional.belief.v1";

import { ecologicalZonesPillar } from "./ecological/agroEcologicalZones.v1";
import { watershedsPillar } from "./ecological/watersheds.v1";
import { endemicFloraPillar } from "./ecological/endemicFlora.v1";

import { foodSystemsPillar } from "./nutritional/foodSystems.v1";
import { seasonalAvailabilityPillar } from "./nutritional/seasonalAvailability.v1";
import { micronutrientGapsPillar } from "./nutritional/micronutrientGaps.v1";

import { nutritionBiochemistryPillar } from "./biomedical/nutritionBiochemistry.v1";
import { endemicDiseasePillar } from "./biomedical/endDisease.v1";

import { presentationPatternsPillar } from "./clinical/presentationPatterns.v1";
import { redFlagsPillar } from "./clinical/redFlags.v1";

export const PILLAR_REGISTRY: Record<string, Pillar<any, any>> = {
  [culturalHighlandsPillar.id]: culturalHighlandsPillar,
  [culturalRiftValleyPillar.id]: culturalRiftValleyPillar,
  [culturalLowlandsPillar.id]: culturalLowlandsPillar,

  [spiritualOrthodoxPillar.id]: spiritualOrthodoxPillar,
  [spiritualIslamicPillar.id]: spiritualIslamicPillar,
  [spiritualTraditionalPillar.id]: spiritualTraditionalPillar,

  [ecologicalZonesPillar.id]: ecologicalZonesPillar,
  [watershedsPillar.id]: watershedsPillar,
  [endemicFloraPillar.id]: endemicFloraPillar,

  [foodSystemsPillar.id]: foodSystemsPillar,
  [seasonalAvailabilityPillar.id]: seasonalAvailabilityPillar,
  [micronutrientGapsPillar.id]: micronutrientGapsPillar,

  [nutritionBiochemistryPillar.id]: nutritionBiochemistryPillar,
  [endemicDiseasePillar.id]: endemicDiseasePillar,

  [presentationPatternsPillar.id]: presentationPatternsPillar,
  [redFlagsPillar.id]: redFlagsPillar,
};

/**
 * Validates that all required location context keys are present and non-empty.
 * Fails loudly as specified in Section 3.
 */
export function validatePillarRequirements(pillar: Pillar, ctx: LocationContext): void {
  for (const requirement of pillar.requires) {
    const parts = requirement.split(".");
    let current: any = ctx;
    let missing = false;

    if (parts[0] === "location") {
      parts.shift();
    }

    for (const part of parts) {
      if (current === undefined || current === null || current[part] === undefined) {
        missing = true;
        break;
      }
      current = current[part];
    }

    if (missing) {
      throw new Error(
        `PILLAR_RESOLVER_ERROR: Pillar '${pillar.id}' (v${pillar.version}) requires '${requirement}', but LocationContext could not satisfy it.`
      );
    }
  }
}

/**
 * Executes a pillar query with full requirement enforcement and provenance tracking.
 */
export async function queryPillar<TInput, TOutput>(
  pillarId: string,
  input: TInput,
  ctx: LocationContext
): Promise<PillarResult<TOutput>> {
  const pillar = PILLAR_REGISTRY[pillarId];
  if (!pillar) {
    throw new Error(`PILLAR_NOT_FOUND: Knowledge pillar '${pillarId}' is not registered.`);
  }

  validatePillarRequirements(pillar, ctx);
  return (await pillar.query(input, ctx)) as PillarResult<TOutput>;
}

/**
 * Selects appropriate regional cultural pillar based on agro-ecological zone
 */
export function resolveCulturalPillarId(ctx: LocationContext): string {
  if (ctx.agroEcological === "desert" || ctx.agroEcological === "lowland") {
    return culturalLowlandsPillar.id;
  }
  if (ctx.agroEcological === "rift-valley") {
    return culturalRiftValleyPillar.id;
  }
  return culturalHighlandsPillar.id;
}

/**
 * Selects appropriate spiritual pillar based on user's spiritualContext, if consented
 */
export function resolveSpiritualPillarId(spiritualContext?: string): string {
  const norm = (spiritualContext || "").toLowerCase();
  if (norm.includes("islam") || norm.includes("muslim") || norm.includes("harar") || norm.includes("quran")) {
    return spiritualIslamicPillar.id;
  }
  if (norm.includes("traditional") || norm.includes("waaq") || norm.includes("oromo") || norm.includes("ayyaana")) {
    return spiritualTraditionalPillar.id;
  }
  return spiritualOrthodoxPillar.id;
}

export * from "./types";
