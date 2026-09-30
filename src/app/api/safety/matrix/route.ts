import { defineRoute } from "@/lib/api/route";
import { computeMatrix, matrixInput } from "@/server/safety";

/** Pair-by-pair matrix for a list of medicines and remedies (slugs or typed names), with profile alerts. */
export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 240, windowMs: 15 * 60_000 },
  body: matrixInput,
  handler: ({ body }) => computeMatrix(body),
});
