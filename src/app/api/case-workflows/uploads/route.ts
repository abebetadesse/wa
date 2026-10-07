import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { uploadWorkflowMedia } from "@/server/cases/media";

export const POST = defineRoute({
  access: "user",
  status: 201,
  rateLimit: { limit: 5, windowMs: 60 * 60_000 },
  body: z.object({
    kind: z.enum(["audio", "video"]),
    file: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Choose an audio or video file."),
  }),
  handler: ({ user, body }) => uploadWorkflowMedia(user, body.kind, body.file),
});
