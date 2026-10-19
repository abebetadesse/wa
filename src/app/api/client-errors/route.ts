import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { log } from "@/lib/log";

/**
 * Crashes caught by the browser's error boundary (src/app/error.tsx), written to the server log so
 * they are visible without access to the visitor's device. Only the error text and the page path
 * are accepted; query strings are dropped.
 */
export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 20, windowMs: 10 * 60 * 1000 },
  body: z.object({
    message: z.string().trim().min(1).max(500),
    digest: z.string().max(100).optional(),
    path: z.string().max(300).optional(),
    stack: z.string().max(2000).optional(),
  }),
  status: 202,
  handler: ({ body, user }) => {
    log.error("browser error", {
      source: "browser",
      browserMessage: body.message,
      digest: body.digest,
      path: body.path?.split("?")[0],
      browserStack: body.stack?.split("\n").slice(0, 6).join("\n"),
      signedIn: Boolean(user),
    });
    return { received: true };
  },
});
