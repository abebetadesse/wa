import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { biometricScans } from "@/lib/db/schema";
import { culturalTranslator } from "@/lib/dual-layer/CulturalTranslator";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api/response";
import { requireUser } from "@/lib/api/authGuard";
import { insertReturning } from "@/lib/db/write";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser();
  if (error || !user) return unauthorized();

  const body = await request.json().catch(() => null) as {
    scanType?: string;
    image?: string;
  } | null;
  if (!body) return badRequest("Invalid JSON body.");
  if (body.scanType !== "PALM" && body.scanType !== "TONGUE") {
    return badRequest("scanType must be PALM or TONGUE.", "scanType");
  }
  if (!body.image || typeof body.image !== "string") return badRequest("A base64 image is required.", "image");
  if (Buffer.byteLength(body.image, "utf8") > MAX_IMAGE_BYTES * 1.4) {
    return badRequest("Image exceeds the 5 MB limit.", "image");
  }

  try {
    // This placeholder records an internal observation envelope only. It does
    // not infer hydration, organ function, disease, or any diagnosis from an
    // image. A validated practitioner-reviewed model must replace this step.
    const hiddenObservation = {
      analysisMode: "placeholder_non_diagnostic",
      scanType: body.scanType.toLowerCase(),
      imageReceived: true,
      modelStatus: "not_configured",
    };
    const culturalReport = culturalTranslator.translate({
      scientificFindings: {},
      scanType: body.scanType === "PALM" ? "palm" : "tongue",
    });
    const imageHash = createHash("sha256").update(body.image).digest("hex");

    const [scan] = await insertReturning(db, biometricScans, {
      userId: user.id,
      imageUrl: `pending://biometric/${imageHash}`,
      scanType: body.scanType === "PALM" ? "palm" : "tongue",
      rawAiScientificFindings: hiddenObservation,
      translatedCulturalFindings: culturalReport,
      redFlags: [],
      imageHash,
      reviewStatus: "pending_expert_review",
    }, { fields: { id: biometricScans.id } });

    return ok({
      eventId: scan?.id,
      scanType: body.scanType,
      culturalReport,
      disclaimer: "This is a reflective cultural reading, not a medical diagnosis. Seek qualified care for persistent or urgent concerns.",
    });
  } catch (caught) {
    console.error("Biometric analysis failed:", caught);
    return serverError("The reflective scan could not be saved.");
  }
}
