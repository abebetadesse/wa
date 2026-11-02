import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { fileResponse } from "@/lib/api/upload";
import { GUIDANCE_TABLES, ensureGuidanceDefaults, exportCsv, importCsv, type GuidanceTable } from "@/server/guidance/tables";

const admins = { roles: ["admin", "super_admin"] } as const;
const params = z.object({ table: z.enum(GUIDANCE_TABLES as [GuidanceTable, ...GuidanceTable[]]) });

export const GET = defineRoute({
  access: admins,
  params,
  handler: async ({ params }) => {
    await ensureGuidanceDefaults();
    // A byte-order mark so Excel opens the Ge'ez text as UTF-8.
    return fileResponse(`﻿${await exportCsv(params.table)}`, { type: "text/csv; charset=utf-8", filename: `guidance-${params.table}.csv` });
  },
  audit: { action: ({ params }) => `guidance_${params.table}_exported`, resourceType: "guidance_table", resourceId: ({ params }) => params.table },
});

export const POST = defineRoute({
  access: admins,
  params,
  body: z.object({
    file: z
      .instanceof(File, { message: "Choose a CSV file." })
      .refine((file) => file.name.toLowerCase().endsWith(".csv") || !file.type || file.type === "text/csv", "Only CSV files are accepted; in Excel use Save As › CSV UTF-8.")
      .refine((file) => file.size <= 5_000_000, "The file is larger than 5 MB."),
    dryRun: z.enum(["true", "false"]).default("false"),
  }),
  handler: async ({ params, body, user }) => importCsv(params.table, await body.file.text(), user.id, body.dryRun === "true"),
  audit: {
    action: ({ params }) => `guidance_${params.table}_imported`,
    resourceType: "guidance_table",
    resourceId: ({ params }) => params.table,
    details: ({ body }, result) => ({ dryRun: body.dryRun === "true", saved: result.saved, errors: result.errors.length }),
  },
});
