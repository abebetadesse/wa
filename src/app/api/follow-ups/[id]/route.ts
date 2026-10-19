import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api/route";
import { followUpService, HELPED } from "@/server/followUps";

/** Answers one of the signed-in person's own check-ins (an answer can be corrected later). */
export const POST = defineRoute({
  access: "user",
  params: z.object({ id: z.string().min(1).max(36) }),
  body: z.object({
    helped: z.enum(HELPED),
    sideEffects: z.string().trim().max(1000).optional(),
    comment: z.string().trim().max(1000).optional(),
  }),
  handler: async ({ user, params, body }) => {
    const saved = await followUpService.answer(user.id, params.id, body);
    if (!saved) throw ApiError.notFound("Check-in");
    return { id: saved.id, helped: saved.helped, needsAttention: saved.needsAttention };
  },
  audit: { action: "follow_up_answered", resourceType: "follow_up", resourceId: (_ctx, result) => result.id },
});
