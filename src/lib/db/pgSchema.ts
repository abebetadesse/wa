/**
 * pgSchema.ts — Pillar 1, Point 4
 *
 * Canonical PostgreSQL schema helpers. Kept as a thin re-export of the legacy
 * `mysqlSchema.ts` shim so that both import paths resolve correctly while we
 * migrate schema files one by one.
 *
 * New schema files should import from here:
 *   import { pgTable, uuid, ... } from "@/lib/db/pgSchema";
 *
 * Old files importing from "../mysqlSchema" continue to work unchanged.
 */
export * from "./mysqlSchema";
