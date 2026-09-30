import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { uploadAttachment } from "@/server/intake/attachments";

/** A client attaches a photo, voice note or video before requesting a booking. */
export const POST = defineRoute({
  access: "user",
  status: 201,
  rateLimit: { limit: 40, windowMs: 15 * 60_000 },
  body: z.object({
    serviceId: z.string().uuid(),
    kind: z.enum(["image", "audio", "video"]),
    file: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Choose a file to upload."),
  }),
  handler: ({ user, body }) => uploadAttachment(user, body),
});
