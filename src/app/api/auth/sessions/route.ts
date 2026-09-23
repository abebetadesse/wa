import { defineRoute } from "@/lib/api/route";
import { getUserSessions } from "@/lib/auth";

export const GET = defineRoute({
  access: "user",
  handler: ({ user }) => getUserSessions(user.id),
});
