import { NextRequest, NextResponse } from "next/server";
import { IntentClassifier } from "@/lib/knowledge/parsing/intentClassifier";
import { EntityExtractor } from "@/lib/knowledge/parsing/entityExtractor";
import { UrgencyDetector } from "@/lib/knowledge/parsing/urgencyDetector";
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import { UserProfile } from "@/lib/knowledge/types";
import { db } from "@/lib/db";
import { diagnosticSessions, wellbeingProfiles } from "@/lib/db/schema";
import { decryptRestrictedField } from "@/lib/security/encryption";
import { desc, eq } from "drizzle-orm";

const intentClassifier = new IntentClassifier();
const entityExtractor = new EntityExtractor();
const urgencyDetector = new UrgencyDetector();

async function loadPersistedProfile(userId?: string): Promise<UserProfile> {
  if (!userId) return {};

  const [stored] = await db
    .select()
    .from(wellbeingProfiles)
    .where(eq(wellbeingProfiles.userId, userId))
    .orderBy(desc(wellbeingProfiles.updatedAt))
    .limit(1);

  if (!stored) return {};

  return {
    userId,
    age: stored.age ?? undefined,
    demographics: {
      age: stored.age ?? undefined,
      gender: stored.gender ?? undefined,
      region: stored.region ?? undefined,
    },
    medications: decryptRestrictedField<any[]>(stored.medications) ?? [],
    wellbeing: {
      medications: decryptRestrictedField<any[]>(stored.medications) ?? [],
      conditions: decryptRestrictedField<string[]>(stored.medicalHistory) ?? [],
      allergies: Array.isArray(stored.allergies) ? stored.allergies.map(String) : [],
      pregnant: stored.pregnancyOrLactation !== "none",
    },
    conditions: decryptRestrictedField<string[]>(stored.medicalHistory) ?? [],
    location: {
      region: stored.region || "Addis Ababa",
      altitude: stored.altitudeMeters ?? undefined,
      type: "urban",
    },
    lifestyle: {
      diet: JSON.stringify(stored.lifestyleHabits ?? {}),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const originalQuery = typeof body.query === "string" ? body.query.trim() : "";
    let query = originalQuery;
    const mode = body.mode || "text";
    const allowedDomains = new Set(["wellbeing", "peace", "power", "money", "career", "relationships", "spiritual", "legal", "social"]);
    const requestedDomain = typeof body.domain === "string" ? body.domain.toLowerCase() : "wellbeing";
    const domain = allowedDomains.has(requestedDomain) ? requestedDomain : "wellbeing";
    const domainLabel = typeof body.domainLabel === "string" && body.domainLabel.trim() ? body.domainLabel.trim() : "wellbeing";
    const requestedLanguage = body.language || "en";
    const selectedSymptoms = Array.isArray(body.symptoms) ? body.symptoms : [];
    const requestProfile: UserProfile = body.userProfile || {};

    if (domain && domain !== "wellbeing") {
      query = `Case domain focus: ${domainLabel}. ${query}`.trim();
    }

    if (mode === "symptom" && selectedSymptoms.length > 0) {
      query = `Client reported experiencing: ${selectedSymptoms.join(", ")}. ${query}`.trim();
    }

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please describe your wellbeing concern or select symptoms." },
        { status: 400 }
      );
    }

    if (query.length > 3000) {
      return NextResponse.json(
        { success: false, error: "Please keep your description under 3,000 characters." },
        { status: 400 }
      );
    }

    // 1. Parsing Engine
    const intentResult = intentClassifier.classify(query);
    const entities = entityExtractor.extract(query);
    const urgency = urgencyDetector.detect(query, entities);

    // Merge entities into userProfile if relevant
    const extractedMeds = entities.filter((e) => e.category === "medication").map((e) => e.value);
    const extractedSubs = entities.filter((e) => e.category === "substance").map((e) => e.value);

    let persistedProfile: UserProfile = {};
    try {
      persistedProfile = await loadPersistedProfile(requestProfile.userId);
    } catch (profileError) {
      console.warn("Could not load persisted wellbeing profile for diagnostic:", profileError);
    }
    const userProfile: UserProfile = {
      ...persistedProfile,
      ...requestProfile,
      demographics: { ...persistedProfile.demographics, ...requestProfile.demographics },
      wellbeing: { ...persistedProfile.wellbeing, ...requestProfile.wellbeing },
      lifestyle: { ...persistedProfile.lifestyle, ...requestProfile.lifestyle },
      location: {
        region: requestProfile.location?.region || persistedProfile.location?.region || "Addis Ababa",
        ...persistedProfile.location,
        ...requestProfile.location,
      },
    };
    const mergedProfile: UserProfile = {
      ...userProfile,
      medications: Array.from(new Set([...(userProfile.medications || []), ...extractedMeds])),
      substanceUse: Array.from(new Set([...(userProfile.substanceUse || []), ...extractedSubs])),
      location: userProfile.location || {
        region: "Addis Ababa",
        altitude: 2400,
        type: "urban",
      },
    };

    // 2. Orchestration: parallel retrieval across 11 strands + cross-strand integration + AI COT reasoning
    const { strandResults, intersections, solution, fromCache } = await globalOrchestrator.retrieveAll(
      query,
      mode,
      requestedLanguage || intentResult.detectedLanguage,
      mergedProfile,
      intentResult.intent,
      urgency
    );

    // Keep internal routing context out of the user-facing problem statement.
    solution.query = originalQuery;
    solution.summary.problem = originalQuery.length > 90 ? `${originalQuery.slice(0, 87)}...` : originalQuery;

    // 3. Persist session to database if connected
    try {
      if (db) {
        const [saved] = await db.insert(diagnosticSessions).values({
          userId: userProfile.userId || null,
          query,
          mode,
          language: solution.language,
          urgencyLevel: solution.summary.urgency,
          urgencyScore: solution.summary.urgencyScore,
          intent: solution.summary.intent,
          summary: solution.summary,
          causes: solution.causes,
          solutions: solution.solutions,
          actionPlan: solution.action_plan,
          safetyWarnings: solution.safety.warnings,
          culturalContext: solution.cultural_context,
          astrologicalContext: solution.astrological_context,
          rawPayload: {
            domain,
            intersectionsCount: intersections.length,
            causalPathwaysCount: solution.causalPathways.length,
          },
        }).returning({ id: diagnosticSessions.id });

        if (saved?.id) {
          solution.id = saved.id;
        }
      }
    } catch (dbErr) {
      console.warn("Could not persist diagnostic session to DB:", dbErr);
    }

    return NextResponse.json({
      success: true,
      data: solution,
      fromCache,
      meta: {
        intent: intentResult.intent,
        entitiesCount: entities.length,
        intersectionsCount: intersections.length,
        strandsQueried: Object.keys(strandResults),
      },
    });
  } catch (error) {
    console.error("Diagnostic analyze error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while analyzing this wellbeing query." },
      { status: 500 }
    );
  }
}
