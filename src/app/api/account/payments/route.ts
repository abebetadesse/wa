import { defineRoute } from "@/lib/api/route";
import { myPlatformPayments } from "@/server/payments";

export const GET = defineRoute({ access: "user", handler: ({ user }) => myPlatformPayments(user.id) });
