/**
 * /api/profile — Pillar 4, Point 15: Standardised on defineRoute
 *
 * Refactored from manual try/catch + manual NextResponse.json error
 * handling to the battle-tested defineRoute wrapper. This guarantees:
 *  - Universal rate-limiting (add rateLimit: {} as needed)
 *  - Consistent { success, data | error } envelope
 *  - Automatic audit logging via non-blocking queue (Pillar 1 P3)
 *  - Proper 401 vs 500 distinction handled by ApiError semantics
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { isVisible } from "@/lib/profileFields";
import { ensureProfileFieldCatalog } from "@/lib/profileFieldCatalog";
import { defineRoute, ApiError } from "@/lib/api/route";

// ─── GET /api/profile ─────────────────────────────────────────────────────────

export const GET = defineRoute({
  access: "user",
  handler: async ({ user }) => {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

    const fields = await ensureProfileFieldCatalog();
    const data = profile?.data || {};

    const height =
      typeof data.height === "number"
        ? data.height
        : Number(data["wellbeing.height"]);
    const weight =
      typeof data.weight === "number"
        ? data.weight
        : Number(data["wellbeing.weight"]);
    const bmi =
      height > 0 && weight > 0
        ? Number((weight / (height / 100) ** 2).toFixed(1))
        : null;

    return {
      data,
      fields,
      profile: {
        primaryName: profile?.primaryName || (data.primaryName as string) || (data.fullName as string) || "",
        birthDate: profile?.birthDate || (data.birthDate as string) || (data.dob as string) || "",
        birthTime: profile?.birthTime || (data.birthTime as string) || "",
        birthLocation: profile?.birthLocation || (data.birthLocation as string) || "",
        currentLocation: profile?.currentLocation || (data.currentLocation as string) || "",
        motherName: profile?.motherName || (data.motherName as string) || "",
        consentSpiritual: profile?.consentSpiritual ?? Boolean(data.consentSpiritual ?? false),
        consentLocation: profile?.consentLocation ?? Boolean(data.consentLocation ?? false),
        consent: profile?.consent ?? {
          location: profile?.consentLocation ?? false,
          spiritual: profile?.consentSpiritual ?? false,
          traditionalMedicine: false,
          bioNarrative: false,
          voiceIntake: false,
          manuscriptKnowledge: false,
        },
        onboardingCompleted: profile?.onboardingCompleted ?? Boolean(data.onboardingCompleted ?? data.onboardingComplete ?? false),
        locationContext: profile?.locationContext ?? data.locationContext ?? null,
        birthLocationContext: profile?.birthLocationContext ?? data.birthLocationContext ?? null,
      },
      computed: { bmi },
    };
  },
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────────

export const PUT = defineRoute({
  access: "user",
  body: z.record(z.unknown()),
  audit: {
    action: "profile_updated",
    resourceType: "user_profile",
    resourceId: (ctx) => ctx.user.id,
    details: (ctx) => ({ fieldIds: Object.keys(ctx.body as Record<string, unknown>) }),
  },
  handler: async ({ user, body }) => {
    const incoming = body as Record<string, unknown>;
    const fields = await ensureProfileFieldCatalog();

    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

    const existingData = (existing?.data || {}) as Record<string, unknown>;
    const data = { ...existingData, ...incoming };

    for (const field of fields) {
      if (
        field.required &&
        isVisible(field, data) &&
        (data[field.id] === undefined || data[field.id] === "")
      ) {
        throw ApiError.badRequest(`${field.label} is required.`);
      }
    }

    // Extract dedicated columns
    const primaryName = (incoming.primaryName || incoming.fullName || incoming.name || existing?.primaryName || null) as string | null;
    const birthDate = (incoming.birthDate || incoming.dob || existing?.birthDate || null) as string | null;
    const birthTime = (incoming.birthTime || existing?.birthTime || null) as string | null;
    const birthLocation = (incoming.birthLocation || existing?.birthLocation || null) as string | null;
    const currentLocation = (incoming.currentLocation || incoming.region || existing?.currentLocation || null) as string | null;
    const motherName = (incoming.motherName || existing?.motherName || null) as string | null;
    let consentSpiritual = incoming.consentSpiritual !== undefined
      ? Boolean(incoming.consentSpiritual)
      : (existing?.consentSpiritual ?? false);
    let consentLocation = incoming.consentLocation !== undefined
      ? Boolean(incoming.consentLocation)
      : (existing?.consentLocation ?? false);
    const consentKeys = ["location", "spiritual", "traditionalMedicine", "bioNarrative", "voiceIntake", "manuscriptKnowledge"] as const;
    const previousConsent = existing?.consent ?? {
      location: consentLocation,
      spiritual: consentSpiritual,
      traditionalMedicine: false,
      bioNarrative: false,
      voiceIntake: false,
      manuscriptKnowledge: false,
    };
    const suppliedConsent = incoming.consent;
    if (suppliedConsent !== undefined && (
      typeof suppliedConsent !== "object" || suppliedConsent === null || Array.isArray(suppliedConsent) ||
      consentKeys.some((key) => key in suppliedConsent && typeof (suppliedConsent as Record<string, unknown>)[key] !== "boolean") ||
      Object.keys(suppliedConsent as Record<string, unknown>).some((key) => !consentKeys.includes(key as typeof consentKeys[number]))
    )) {
      throw ApiError.badRequest("Consent must contain only supported consent flags with boolean values.");
    }
    const consent = {
      ...previousConsent,
      ...(suppliedConsent as Partial<typeof previousConsent> | undefined),
      ...(incoming.consentSpiritual !== undefined ? { spiritual: consentSpiritual } : {}),
      ...(incoming.consentLocation !== undefined ? { location: consentLocation } : {}),
    };
    consentSpiritual = consent.spiritual;
    consentLocation = consent.location;
    const consentChanges = Object.fromEntries(
      consentKeys.filter((key) => consent[key] !== previousConsent[key]).map((key) => [key, consent[key]])
    );
    const consentUpdatedAt = Object.keys(consentChanges).length > 0 ? new Date() : existing?.consentUpdatedAt ?? null;
    const consentHistory = Object.keys(consentChanges).length > 0
      ? [...(existing?.consentHistory ?? []), { at: consentUpdatedAt!.toISOString(), changes: consentChanges }]
      : existing?.consentHistory ?? [];
    const onboardingCompleted = (incoming.onboardingComplete !== undefined || incoming.onboardingCompleted !== undefined)
      ? Boolean(incoming.onboardingComplete || incoming.onboardingCompleted)
      : (existing?.onboardingCompleted ?? false);

    // Resolve birth location context if provided
    let birthLocationContext = existing?.birthLocationContext || null;
    let birthLocationContextSource = existing?.birthLocationContextSource || null;
    if (birthLocation && (!birthLocationContext || birthLocation !== existing?.birthLocation)) {
      try {
        const { resolveLocation } = await import("@/lib/location");
        birthLocationContext = await resolveLocation({ region: birthLocation, source: "manual" });
        birthLocationContextSource = "manual";
      } catch (err) {
        console.warn("[PUT /api/profile] Could not resolve birthLocationContext:", err);
      }
    }

    data.consentSpiritual = consentSpiritual;
    data.consentLocation = consentLocation;
    data.onboardingCompleted = onboardingCompleted;
    if (birthLocationContext) data.birthLocationContext = birthLocationContext;

    const row = {
      userId: user.id,
      primaryName,
      birthDate,
      birthTime,
      birthLocation,
      currentLocation,
      motherName,
      consentSpiritual,
      consentLocation,
      consent,
      consentUpdatedAt,
      consentHistory,
      onboardingCompleted,
      birthLocationContext,
      birthLocationContextSource,
      data,
      updatedAt: new Date(),
    };

    await db
      .insert(userProfiles)
      .values(row)
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: row,
      });

    return {
      data,
      profile: {
        primaryName,
        birthDate,
        birthTime,
        birthLocation,
        currentLocation,
        motherName,
        consentSpiritual,
        consentLocation,
        consent,
        consentUpdatedAt: consentUpdatedAt?.toISOString() ?? null,
        onboardingCompleted,
        birthLocationContext,
      },
    };
  },
});

// ─── POST /api/profile (Pipeline Clinical Profile Intake & Location Resolution) ──
export async function POST(req: Request) {
  try {
    const { getPipelineSession } = await import("@/lib/pipeline/auth");
    const { resolveLocation } = await import("@/lib/location");
    const { evaluateProfile } = await import("@/lib/evaluation/profileEvaluator");
    const { pipelineRepository } = await import("@/lib/pipeline/repository");
    const { z } = await import("zod");

    const session = await getPipelineSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please log in or provide session credentials." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const profileSchema = z.object({
      ageBand: z.string().min(1, "Age band is required"),
      sex: z.string().min(1, "Sex is required"),
      pregnancyStatus: z.string().optional(),
      chronicConditions: z.array(z.string()).default([]),
      currentMeds: z
        .array(
          z.object({
            name: z.string(),
            dosage: z.string().optional(),
            frequency: z.string().optional(),
          })
        )
        .default([]),
      allergies: z.array(z.string()).default([]),
      traditionalUse: z
        .array(
          z.object({
            name: z.string(),
            preparation: z.string().optional(),
            purpose: z.string().optional(),
          })
        )
        .default([]),
      diet: z
        .object({
          primaryStaple: z.string().optional(),
          fastingSchedule: z.string().optional(),
          meatDairyFrequency: z.string().optional(),
          notes: z.string().optional(),
        })
        .default({}),
      substanceUse: z
        .object({
          coffeeDailyCups: z.number().optional(),
          khatFrequency: z.string().optional(),
          alcoholFrequency: z.string().optional(),
          tobaccoUse: z.boolean().optional(),
        })
        .default({}),
      location: z.object({
        region: z.string().min(1, "Region is required"),
        zone: z.string().min(1, "Zone is required"),
        woreda: z.string().min(1, "Woreda is required"),
        kebele: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        source: z.enum(["gps", "manual", "admin"]).optional(),
      }),
      spiritualContext: z.string().optional(),
      culturalContext: z.string().optional(),
      consent: z.object({
        spiritualAnalysisOptIn: z.boolean().default(false),
        dataUseAcknowledged: z.boolean().default(true),
        requiresProfessionalApprovalAcknowledged: z.boolean().default(true),
      }),
    });

    const parsed = profileSchema.parse(body);

    // Section 1 Non-Negotiable: Location is a first-class input resolved before analysis
    const locationContext = await resolveLocation(parsed.location);

    const profileId = `prof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    const profileRecord = {
      id: profileId,
      userId: session.userId,
      ageBand: parsed.ageBand,
      sex: parsed.sex,
      pregnancyStatus: parsed.pregnancyStatus,
      chronicConditions: parsed.chronicConditions,
      currentMeds: parsed.currentMeds,
      allergies: parsed.allergies,
      traditionalUse: parsed.traditionalUse,
      diet: parsed.diet,
      substanceUse: parsed.substanceUse,
      location: locationContext,
      spiritualContext: parsed.spiritualContext,
      culturalContext: parsed.culturalContext,
      consent: parsed.consent,
      submittedAt: nowIso,
      updatedAt: nowIso,
    };

    // Save profile record
    await pipelineRepository.saveProfile(profileRecord);

    // Run Stage A evaluation: Profile -> Preliminary Analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preliminaryAnalysis = await evaluateProfile(profileRecord as any);
    await pipelineRepository.savePreliminaryAnalysis(profileId, preliminaryAnalysis);

    return NextResponse.json(
      {
        success: true,
        data: {
          profile: profileRecord,
          preliminaryAnalysis,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process profile submission" },
      { status: 500 }
    );
  }
}
