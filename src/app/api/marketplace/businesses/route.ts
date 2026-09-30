import { defineRoute } from "@/lib/api/route";
import { directoryQuery, searchDirectory } from "@/server/marketplace/businesses";

export const GET = defineRoute({ access: "public", query: directoryQuery, handler: ({ query, user }) => searchDirectory(query, user) });
