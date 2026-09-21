# MySQL migration plan

The current production app remains on PostgreSQL while the rewrite is migrated deliberately. The application uses PostgreSQL-specific Drizzle schema types and write APIs, especially `returning()` and `onConflictDoUpdate()`, across authentication, intake, admin, case workflow, evaluation, and literature paths.

## Target stack

- MySQL 8.0+
- `mysql2` with `drizzle-orm/mysql2`
- `mysqlTable`, `varchar(36)` application UUIDs, `json`, `decimal`, and `timestamp`
- Explicit follow-up reads after inserts and updates where PostgreSQL `returning()` is currently used
- `onDuplicateKeyUpdate()` for MySQL upserts

## Cutover order

1. Convert schema modules and generate a fresh MySQL migration set.
2. Replace returning-based repositories with transaction-safe insert/update plus select helpers.
3. Replace PostgreSQL seed and maintenance scripts with MySQL clients.
4. Run auth, intake, case workflow, knowledge, literature, and evaluation tests against MySQL 8.
5. Export the production PostgreSQL data, transform UUID/JSON/date fields, import into a staging MySQL database, and verify row counts and audit history.

Do not point production at MySQL until the full workflow test suite passes against the target schema.

## Migration history

The checked-in `drizzle/` directory contains legacy PostgreSQL snapshots. The MySQL configuration now writes to `drizzle-mysql/`, keeping the old history untouched. Treat the first MySQL migration as a fresh baseline in that directory or a clean deployment database; do not apply the PostgreSQL SQL files to MySQL.

Before production cutover, generate the baseline with the installed Drizzle Kit version, review the SQL for MySQL 8 compatibility, and apply it to an empty staging database.

The active nutrition and auth seed paths use MySQL-native Drizzle transactions and explicit UUIDs. Knowledge CSV ingestion should continue through the existing knowledge import routes after the baseline migration is applied.