import { defineRoute } from "@/lib/api/route";
import { changePassword } from "./accounts";
import { changePasswordBody, MINUTE } from "./schemas";

/** Shared by /api/auth/password/change (POST) and /api/auth/me/password (PUT). */
export const changePasswordHandler = defineRoute({
  access: "user",
  rateLimit: { limit: 10, windowMs: 15 * MINUTE },
  body: changePasswordBody,
  handler: ({ req, user, body }) => changePassword(user, body.currentPassword, body.newPassword, req),
  audit: { action: "password_changed", resourceType: "user", resourceId: ({ user }) => user.id },
});
