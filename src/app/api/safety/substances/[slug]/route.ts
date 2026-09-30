import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { substanceDetail } from "@/server/safety";

export const GET = defineRoute({ access: "public", params: z.object({ slug: z.string().min(1).max(100) }), handler: ({ params }) => substanceDetail(params.slug) });
