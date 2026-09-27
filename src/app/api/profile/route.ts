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

    return { data, fields, computed: { bmi } };
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

    const data = { ...(existing?.data || {}), ...incoming };

    for (const field of fields) {
      if (
        field.required &&
        isVisible(field, data) &&
        (data[field.id] === undefined || data[field.id] === "")
      ) {
        throw ApiError.badRequest(`${field.label} is required.`);
      }
    }

    await db
      .insert(userProfiles)
      .values({ userId: user.id, data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { data, updatedAt: new Date() },
      });

    return { data };
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
