import { defineRoute } from "@/lib/api/route";
import { exploreFor } from "@/server/toolkit";

/** Tools the viewer may open, grouped for the Explore menu and footer. */
export const GET = defineRoute({ access: "public", handler: ({ user }) => exploreFor(user) });
