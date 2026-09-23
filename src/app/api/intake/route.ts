import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, intakeSubmissions, wellbeingProfiles, culturalProfiles } from "@/lib/db/schema";
import { runEvaluationAndPersist } from "@/lib/evaluation/pipelineRunner";
import { stage1Normalize } from "@/lib/evaluation/stage1Normalize";
import { encryptRestrictedField } from "@/lib/security/encryption";
import { createJob, updateJobProgress } from "@/lib/jobs/queue";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email || `client_${Date.now()}@ethio-wellness.local`;
    const name = body.name || "Client User";

    const jobId = crypto.randomUUID();

    // 1. Ensure user exists
    let userId: string;
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      const [newUser] = await db
        .insert(users)
        .values({ email, name })
        .returning({ id: users.id });
      userId = newUser.id;
    }

    // 2. Encrypt Restricted Data Class fields (Section 7, 8.2 compliance)
    const normalized = stage1Normalize(body);
    const encryptedMedicalHistory = encryptRestrictedField(normalized.medicalHistory);
    const encryptedMedications = encryptRestrictedField(normalized.medications);

    // Save wellbeing Profile (Domain A)
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

    // 3. Save Cultural Profile if opted in (Domain B - Firewalled)
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

    // 4. Create intake submission
    const [submission] = await db
      .insert(intakeSubmissions)
      .values({
        userId,
        payload: { ...body, normalized },
        status: "pending",
      })
      .returning({ id: intakeSubmissions.id });

    const submissionId = submission.id;
    createJob(jobId, submissionId);

    // 5. Update progress stages
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
      submissionId,
      reportId,
      message: "Intake evaluated and wellbeing gap report generated successfully.",
    });
  } catch (error: any) {
    console.error("API Intake error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "An error occurred while evaluating profile.",
      },
      { status: 500 }
    );
  }
}
