/**
 * Compatibility entry point for the retired PostgreSQL-only enhancement migration.
 * Those tables and columns are part of the MySQL Drizzle baseline; use the ordered runner.
 */
await import("./migrate.mjs");
