import { Medication, SafetyCheckResult } from "./types";
import { checkHerbDrugSafety } from "./stage5SafetyGate";
import { db } from "@/lib/db";
import { compounds, herbDrugInteractions, herbs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function normalizeSafetyTerm(value: unknown): string {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function medicationTerms(medication: Medication | string): string[] {
  if (typeof medication === "string") return [medication];
  return [medication.name, medication.drugClass, (medication as Medication & { activeIngredient?: string }).activeIngredient || ""];
}

/**
 * Resolves the herb, its compounds, and interaction rules from the database.
 * The synchronous checker remains available for offline clients and tests.
 */
export async function checkHerbDrugSafetyFromDatabase(
  herbName: string,
  clientMedications: Array<Medication | string>,
): Promise<SafetyCheckResult> {
  try {
    const normalizedHerb = normalizeSafetyTerm(herbName);
    const herbRows = await db.select().from(herbs);
    const herb = herbRows.find((candidate) =>
      [candidate.nameVernacular, candidate.nameScientific, candidate.nameAmharic]
        .filter(Boolean)
        .some((name) => {
          const normalizedName = normalizeSafetyTerm(name);
          return normalizedHerb.includes(normalizedName) || normalizedName.includes(normalizedHerb);
        }),
    );

    if (!herb) return checkHerbDrugSafety(herbName, clientMedications as Medication[]);

    const [activeCompounds, interactionRows] = await Promise.all([
      db.select().from(compounds).where(eq(compounds.herbId, herb.id)),
      db.select().from(herbDrugInteractions).where(eq(herbDrugInteractions.herbId, herb.id)),
    ]);
    const activeIngredients = activeCompounds.map((compound) => normalizeSafetyTerm(compound.compoundName)).filter(Boolean);

    const matched = interactionRows
      .map((interaction) => {
        const examples = normalizeSafetyTerm(interaction.drugNameExample).split(" ").filter(Boolean);
        const ruleClass = normalizeSafetyTerm(interaction.drugClass);
        const matchingMedication = clientMedications.find((medication) => {
          const terms = medicationTerms(medication).map(normalizeSafetyTerm).filter(Boolean);
          return terms.some((term) =>
            examples.some((example) => term.includes(example) || example.includes(term)) ||
            term.includes(ruleClass) ||
            ruleClass.includes(term),
          );
        });
        return matchingMedication ? { interaction, matchingMedication } : null;
      })
      .filter((item): item is { interaction: typeof interactionRows[number]; matchingMedication: Medication | string } => Boolean(item))
      .sort((left, right) => {
        const rank = { high: 3, moderate: 2, caution: 1 };
        return (rank[right.interaction.interactionSeverity as keyof typeof rank] || 0) - (rank[left.interaction.interactionSeverity as keyof typeof rank] || 0);
      })[0];

    if (!matched) return { herbName: herb.nameVernacular, status: "pass", sourceRef: "ETM-DB-SAFETY-CLEAR" };

    const medicationName = typeof matched.matchingMedication === "string" ? matched.matchingMedication : matched.matchingMedication.name;
    return {
      herbName: herb.nameVernacular,
      status: "flagged",
      flaggedDrugClass: matched.interaction.drugClass,
      flaggedMedication: medicationName,
      severity: matched.interaction.interactionSeverity as "high" | "moderate" | "caution",
      mechanism: `${matched.interaction.mechanism} Active ingredients: ${activeIngredients.join(", ") || "not recorded"}.`,
      DebralEffect: matched.interaction.DebralEffect,
      contraindicated: matched.interaction.contraindicated,
      sourceRef: matched.interaction.sourceRef,
    };
  } catch (error) {
    console.warn("Database herb safety lookup failed; using offline safety rules.", error);
    return checkHerbDrugSafety(herbName, clientMedications as Medication[]);
  }
}
