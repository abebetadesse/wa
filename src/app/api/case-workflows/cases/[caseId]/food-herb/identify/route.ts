import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { caseService } from "@/server/cases/service";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/server/cases/photoRecognition";

/**
 * Candidate foods or plants for a photo or for typed names. The photo is read in memory for this
 * request only and is never stored or logged; nothing about the case changes here.
 */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 20, windowMs: 10 * MINUTE },
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({
    kind: z.enum(["meal", "herb"]),
    names: z.string().trim().max(400).optional(),
    consent: z.enum(["yes"]).optional(),
    photo: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Choose a photo.").optional(),
  }),
  handler: ({ user, params, body }) => {
    if (body.photo) {
      if (body.consent !== "yes") throw ApiError.badRequest("Agree to the photo terms before sending a photo.");
      if (!PHOTO_TYPES.has(body.photo.type)) throw ApiError.badRequest("Use a JPEG, PNG or WebP photo.");
      if (body.photo.size > MAX_PHOTO_BYTES) throw ApiError.badRequest("The photo is too large (4 MB at most).");
    }
    return caseService.identifyFoodHerb(user, params.caseId, { kind: body.kind, photo: body.photo, names: body.names });
  },
});
