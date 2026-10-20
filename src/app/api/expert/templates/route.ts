import { ApiError, defineRoute } from "@/lib/api/route";
import { getSettings } from "@/server/settings";

const REVIEW_ROLES = new Set(["admin", "super_admin", "expert", "practitioner"]);

/** Reply templates reviewers can insert in a conversation (Admin → review desk settings). */
export const GET = defineRoute({
  access: "user",
  handler: async ({ user }) => {
    if (!REVIEW_ROLES.has(user.role) && !user.permissions.includes("cases:review")) throw ApiError.forbidden("Case review access is required.");
    return (await getSettings("reviewDesk")).templates;
  },
});
