import { stage1Normalize } from "./stage1Normalize";
import { stage2ComputeTargets, NutrientReference } from "./stage2Baseline";
import { stage3DetectGaps } from "./stage3DetectGaps";
import { stage4CausalAttribution } from "./stage4CausalAttribution";
import { stage5GenerateSolutions } from "./stage5SolutionGeneration";
import { stage6GenerateNarrative } from "./stage6NarrativeLayer";
import { FoodEntry, FoodNutrientRow, EvaluationReportResult, computeStatisticalSummary } from "./types";
import { db } from "../db";
import {
  intakeSubmissions,
  wellbeingGapReports,
  identifiedGaps,
  gapCauses,
  gapSolutions,
  auditLog,
  nutrients as nutrientsTable,
  foodNutrients as foodNutrientsTable,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { insertReturning } from "@/lib/db/write";

export const ENGINE_MODEL_VERSION = "eval-v3.0.0-deterministic+rules-2025";

type EvaluationReferences = {
  nutrientRefs: NutrientReference[];
  foodNutrientsLookup: Map<string, FoodNutrientRow[]>;
};

let evaluationReferencesPromise: Promise<EvaluationReferences> | undefined;

function loadEvaluationReferences(): Promise<EvaluationReferences> {
  if (!evaluationReferencesPromise) {
    evaluationReferencesPromise = Promise.all([
      db.select().from(nutrientsTable),
      db.select().from(foodNutrientsTable),
    ])
      .then(([dbNutrients, dbFoodNutrients]) => {
        const nutrientRefs: NutrientReference[] = dbNutrients.map((n) => ({
          id: n.id,
          name: n.name,
          symbol: n.symbol ?? undefined,
          unit: n.unit,
          category: n.category,
          baseRda: Number(n.rdaBase),
          tolerableUpperLimit: n.tolerableUpperLimit ? Number(n.tolerableUpperLimit) : null,
        }));

        const foodNutrientsLookup = new Map<string, FoodNutrientRow[]>();
        for (const fn of dbFoodNutrients) {
          const foodNutrients = foodNutrientsLookup.get(fn.foodId) || [];
          foodNutrients.push({
            foodId: fn.foodId,
            nutrientId: fn.nutrientId,
            amountPer100g: Number(fn.amountPer100g),
            bioavailabilityFactor: Number(fn.bioavailabilityFactor ?? 1.0),
            fermentationImpactNote: fn.fermentationImpactNote ?? undefined,
          });
          foodNutrientsLookup.set(fn.foodId, foodNutrients);
        }

        return { nutrientRefs, foodNutrientsLookup };
      })
      .catch((error) => {
        evaluationReferencesPromise = undefined;
        throw error;
      });
  }

  return evaluationReferencesPromise;
}

/**
 * Pure evaluation function — independently testable in memory without database dependencies.
 */
export function evaluateProfileInMemory(
  rawInput: any,
  dietLog: FoodEntry[],
  nutrientReferences: NutrientReference[],
  foodNutrientsLookup: Map<string, FoodNutrientRow[]>
): EvaluationReportResult {
  // Stage 1: Normalize
  const profile = stage1Normalize(rawInput);

  // Stage 2: Personalized Targets (including Ethiopian altitude adjustments)
  const targets = stage2ComputeTargets(profile, nutrientReferences);

  // Stage 3: Deterministic Gap Detection (bioavailability & fermentation uplifts)
  const { gaps } = stage3DetectGaps(dietLog, foodNutrientsLookup, targets);

  // Stage 4: Deterministic Causal Attribution
  const causes = stage4CausalAttribution(gaps, profile, dietLog);

  // Stage 5: Solution Generation with MANDATORY Safety Gate
  const { solutions, culledUnsafeRemedies } = stage5GenerateSolutions(gaps, profile);

  // Stage 6: Safe Narrative Explainer with Post-Generation Guardrail Validation
  const summaryNarrative = stage6GenerateNarrative(profile, gaps, causes, solutions, culledUnsafeRemedies);
  const statistics = computeStatisticalSummary(profile, gaps, causes, solutions);

  return {
    profile,
    targets,
    gaps,
    causes,
    solutions,
    culledUnsafeRemedies,
    summaryNarrative,
    statistics,
    safetyGateVerified: true,
    generatedAt: new Date().toISOString(),
    modelVersion: ENGINE_MODEL_VERSION,
  };
}

/**
 * Executes full pipeline from database and persists results + audit log
 */
export async function runEvaluationAndPersist(submissionId: string, userId: string): Promise<string> {
  // 1. Fetch submission
  const subRows = await db
    .select()
    .from(intakeSubmissions)
    .where(eq(intakeSubmissions.id, submissionId))
    .limit(1);

  if (subRows.length === 0) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  const submission = subRows[0];
  const payload = submission.payload as any;

  // Mark processing
  await db
    .update(intakeSubmissions)
    .set({ status: "processing" })
    .where(eq(intakeSubmissions.id, submissionId));

  try {
    // 2. Load static reference data once per server process.
    const { nutrientRefs, foodNutrientsLookup } = await loadEvaluationReferences();

    const dietLog: FoodEntry[] = Array.isArray(payload.dietLog) ? payload.dietLog : [];

    // 4. Run pure evaluation pipeline
    const reportResult = evaluateProfileInMemory(payload, dietLog, nutrientRefs, foodNutrientsLookup);

    // 5. Persist report
    const [reportRow] = await insertReturning(db, wellbeingGapReports, {
        submissionId,
        userId,
        modelVersion: ENGINE_MODEL_VERSION,
        summaryNarrative: reportResult.summaryNarrative,
        safetyGateVerified: true,
      }, { fields: { id: wellbeingGapReports.id } });

    const reportId = reportRow.id;

    // 6. Persist identified gaps and build map
    for (const gap of reportResult.gaps) {
      const [gapRow] = await insertReturning(db, identifiedGaps, {
          reportId,
          nutrientId: gap.nutrientId,
          gapType: gap.gapType,
          severity: gap.severity,
          estimatedIntakePct: gap.estimatedIntakePct.toString(),
          targetRda: gap.targetRda.toString(),
          calculatedDailyIntake: gap.calculatedDailyIntake.toString(),
          sourceRef: gap.sourceRef,
        }, { fields: { id: identifiedGaps.id } });

      const gapId = gapRow.id;

      // Persist related causes
      const relatedCauses = reportResult.causes.filter((c) => c.gapNutrientId === gap.nutrientId);
      for (const cause of relatedCauses) {
        await db.insert(gapCauses).values({
          gapId,
          causeType: cause.causeType,
          title: cause.title,
          description: cause.description,
          evidenceStrength: cause.evidenceStrength,
          sourceRef: cause.sourceRef,
        });
      }

      // Persist related solutions
      const relatedSolutions = reportResult.solutions.filter((s) => s.gapNutrientId === gap.nutrientId);
      for (const sol of relatedSolutions) {
        await db.insert(gapSolutions).values({
          gapId,
          solutionType: sol.solutionType,
          title: sol.title,
          description: sol.description,
          interactionChecked: sol.interactionChecked,
          rankScore: sol.rankScore.toString(),
          sourceRef: sol.sourceRef,
        });
      }
    }

    // 7. Write Immutable Audit Log entry
    await db.insert(auditLog).values({
      userId,
      eventType: "gap_report_generated",
      payload: {
        reportId,
        submissionId,
        gapsFound: reportResult.gaps.length,
        culledUnsafeRemediesCount: reportResult.culledUnsafeRemedies.length,
        culledRemedies: reportResult.culledUnsafeRemedies,
        modelVersion: ENGINE_MODEL_VERSION,
      },
    });

    // 8. Mark submission complete
    await db
      .update(intakeSubmissions)
      .set({ status: "complete" })
      .where(eq(intakeSubmissions.id, submissionId));

    return reportId;
  } catch (err: any) {
    await db
      .update(intakeSubmissions)
      .set({ status: "failed", errorMessage: err?.message || String(err) })
      .where(eq(intakeSubmissions.id, submissionId));
    throw err;
  }
}
