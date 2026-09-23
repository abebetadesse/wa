import { defineRoute } from "@/lib/api/route";
import { clearAuth } from "@/lib/auth";

export const POST = defineRoute({
  access: "public",
  handler: async () => {
    await clearAuth();
    return { signedOut: true };
  },
});
