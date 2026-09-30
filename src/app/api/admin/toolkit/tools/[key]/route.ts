import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { resetOrDeleteTool, toolInput, updateTool } from "@/server/toolkit";

const admins = { roles: ["admin", "super_admin"] } as const;
const params = z.object({ key: z.string().min(1).max(80) });

export const PUT = defineRoute({
  access: admins,
  params,
  body: toolInput,
  handler: ({ params, body }) => updateTool(params.key, body),
  audit: { action: "toolkit_tool_updated", resourceType: "toolkit_tool", resourceId: ({ params }) => params.key },
});

/** Resets a built-in tool to the code's version, or deletes a custom tool. */
export const DELETE = defineRoute({
  access: admins,
  params,
  handler: ({ params }) => resetOrDeleteTool(params.key),
  audit: { action: (_ctx, result) => (result.deleted ? "toolkit_tool_deleted" : "toolkit_tool_reset"), resourceType: "toolkit_tool", resourceId: ({ params }) => params.key },
});
