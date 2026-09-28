import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listNotifications, markNotificationsRead } from "@/server/marketplace/notifications";

export const GET = defineRoute({ access: "user", handler: ({ user }) => listNotifications(user.id) });

export const POST = defineRoute({
  access: "user",
  body: z.object({ id: z.string().uuid().optional() }),
  handler: ({ user, body }) => markNotificationsRead(user.id, body.id),
});
