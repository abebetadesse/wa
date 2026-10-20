import { defineRoute } from "@/lib/api/route";
import { buildTimeline } from "@/server/timeline";

/** The signed-in person's own history and a summary they can print for a clinician. */
export const GET = defineRoute({
  access: "user",
  handler: ({ user }) => buildTimeline(user.id),
});
