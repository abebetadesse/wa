import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { openConversation } from "@/server/marketplace/engagement";
import { resolvePublicBusinessId } from "@/server/marketplace/businesses";

export const POST = defineRoute({
  access: "user",
  params: z.object({ slug: z.string().min(1).max(120) }),
  handler: async ({ user, params }) => openConversation(user, await resolvePublicBusinessId(params.slug)),
});
