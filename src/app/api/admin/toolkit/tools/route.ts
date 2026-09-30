import { defineRoute } from "@/lib/api/route";
import { createTool, listAllTools, toolInput } from "@/server/toolkit";

const admins = { roles: ["admin", "super_admin"] } as const;

export const GET = defineRoute({ access: admins, handler: () => listAllTools() });

export const POST = defineRoute({
  access: admins,
  status: 201,
  body: toolInput,
  handler: ({ body }) => createTool(body),
  audit: { action: "toolkit_tool_created", resourceType: "toolkit_tool", resourceId: (_ctx, row) => row.key },
});
