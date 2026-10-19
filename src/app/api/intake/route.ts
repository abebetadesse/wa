import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { intakeSubmissions, wellbeingProfiles, culturalProfiles } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { runEvaluationAndPersist } from "@/lib/evaluation/pipelineRunner";
import { stage1Normalize } from "@/lib/evaluation/stage1Normalize";
import { encryptRestrictedField } from "@/lib/security/encryption";
import { createJob, updateJobProgress } from "@/lib/jobs/queue";
import crypto from "crypto";
import { z } from "zod";
import { clientIp } from "@/lib/api/rateLimit";
import { consumeSharedRateLimit } from "@/lib/api/sharedRateLimit";
import { insertReturning } from "@/lib/db/write";

const intakeRequestSchema = z.object({
  email: z.string().email().max(255).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  age: z.coerce.number().int().min(0).max(130).optional(),
  gender: z.enum(["male", "female"]).optional(),
  city: z.string().trim().max(160).optional(),
  region: z.string().trim().max(160).optional(),
  altitudeMeters: z.coerce.number().finite().min(0).max(10_000).optional(),
  activityLevel: z.enum(["sedentary", "moderate", "active", "very_active"]).optional(),
  pregnancyOrLactation: z.enum(["none", "pregnant_t1", "pregnant_t2", "pregnant_t3", "lactating"]).optional(),
  medications: z.array(z.union([
    z.string().trim().max(200),
    z.object({
      name: z.string().trim().min(1).max(200),
      dose: z.string().max(100).optional(),
      drugClass: z.string().max(120).optional(),
    }).passthrough(),
  ])).max(100).optional(),
  medicalHistory: z.array(z.string().max(500)).max(100).optional(),
  allergies: z.array(z.string().max(200)).max(100).optional(),
  lifestyleHabits: z.record(z.string(), z.unknown()).optional(),
  includeCultural: z.boolean().optional(),
  cultural: z.object({
    fullName: z.string().trim().max(160).optional(),
    birthDate: z.string().max(40).optional(),
    birthTime: z.string().max(40).optional(),
    birthLocation: z.string().trim().max(160).optional(),
    geezZodiacSign: z.string().max(80).optional(),
    traditionalNameMeaning: z.string().max(500).optional(),
    culturalCalendarPreference: z.string().max(40).optional(),
  }).passthrough().optional(),
}).passthrough();

export async function POST(req: NextRequest) {
  try {
    // The intake is always stored against the signed-in account. It used to accept any email and
    // attach the medical profile to whichever account had it, which let anyone write to another
    // person's record.
    const user = await getAuthenticatedUser({ refreshAccessCookie: true });
    if (!user) {
      return NextResponse.json({ success: false, error: "Please sign in to save an intake assessment." }, { status: 401 });
    }

    const rateLimit = await consumeSharedRateLimit(`intake:${clientIp(req.headers)}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many intake submissions. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const rawBody: unknown = await req.json();
    const parsedBody = intakeRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: "Invalid intake data.", fields: parsedBody.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })) },
        { status: 400 },
      );
    }
    const body = parsedBody.data;
    const name = user.name || body.name || "Client User";
    const userId = user.id;

    const jobId = crypto.randomUUID();

    // 1. Encrypt Restricted Data Class fields (Section 7, 8.2 compliance)
    const normalized = stage1Normalize(body);
    const encryptedMedicalHistory = encryptRestrictedField(normalized.medicalHistory);
    const encryptedMedications = encryptRestrictedField(normalized.medications);

    // Save Wellbeing Profile (Domain A)
    await db.insert(wellbeingProfiles).values({
      userId,
      age: normalized.age,
      gender: normalized.gender,
      region: normalized.region,
      altitudeMeters: normalized.altitudeMeters,
      activityLevel: normalized.activityLevel,
      pregnancyOrLactation: normalized.pregnancyOrLactation,
      medicalHistory: encryptedMedicalHistory,
      medications: encryptedMedications,
      allergies: normalized.allergies,
      lifestyleHabits: normalized.lifestyleHabits,
    });

    // 2. Save Cultural Profile if opted in (Domain B - Firewalled)
    if (body.includeCultural && body.cultural) {
      await db.insert(culturalProfiles).values({
        userId,
        fullName: body.cultural.fullName || name,
        birthDate: body.cultural.birthDate || null,
        birthTime: body.cultural.birthTime || null,
        birthLocation: body.cultural.birthLocation || normalized.region,
        geezZodiacSign: body.cultural.geezZodiacSign || null,
        traditionalNameMeaning: body.cultural.traditionalNameMeaning || null,
        culturalCalendarPreference: body.cultural.culturalCalendarPreference || "geez",
      });
    }

    // 3. Create intake submission
    const [submission] = await insertReturning(db, intakeSubmissions, {
        userId,
        payload: { ...body, normalized },
        status: "pending",
      }, { fields: { id: intakeSubmissions.id } });

    const submissionId = submission.id;
    const jobAccess = createJob(jobId, submissionId);

    // 4. Update progress stages
    updateJobProgress(jobId, 25, "Normalized client profile and resolved Ethiopian regional elevation...");
    updateJobProgress(jobId, 50, "Calibrating WHO altitude physiological targets (+15-25% Iron)...");
    updateJobProgress(jobId, 70, "Computing EFCT 2025 intake factoring fermentation bioavailability...");
    updateJobProgress(jobId, 85, "Executing Mandatory Herb-Drug Safety Gate against active pharmaceuticals...");

    // Run Evaluation Pipeline
    const reportId = await runEvaluationAndPersist(submissionId, userId);

    updateJobProgress(jobId, 100, "Report generated, verified, and audit-logged.", {
      status: "complete",
      reportId,
    });

    return NextResponse.json({
      success: true,
      jobId,
      pollingToken: jobAccess.pollingToken,
      pollingTokenExpiresAt: jobAccess.expiresAt,
      submissionId,
      reportId,
      message: "Intake evaluated and wellbeing gap report generated successfully.",
    });
  } catch (error) {
    console.error("API Intake error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process intake submission.",
      },
      { status: 500 }
    );
  }
}
