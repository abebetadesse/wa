# MySQL database

The application database layer targets **MySQL 8.0+**. MariaDB and PostgreSQL are not supported
application databases. Use a dedicated, initially empty MySQL database for a new installation.

## Implementation

- Drizzle schema tables and column helpers are MySQL-native (`mysqlTable`, `mysql2`, JSON, UTC
  `DATETIME(3)`, application-generated UUIDs, and decimal strings).
- `src/lib/db/write.ts` provides insert/update/upsert/delete-and-read helpers because MySQL does not
  support PostgreSQL's `RETURNING`.
- Raw SQL uses MySQL syntax. Rate limits use atomic `ON DUPLICATE KEY UPDATE`; realtime delivery
  polls the event table because MySQL has no `LISTEN`/`NOTIFY`.
- The baseline and future MySQL migrations belong in `drizzle-mysql/`. The legacy `drizzle/`
  directory contains PostgreSQL migrations and must never be applied to MySQL.
- `npm run db:setup` runs the migration runner and the reference-data setup. `npm run db:status`
  lists applied and pending MySQL migrations.

## New database and migrations

1. Create an empty database and a user with schema-change privileges.
2. Set `DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE`. Percent-encode special characters
   in URL credentials.
3. Run `npm run db:setup`, then `npm test`.
4. Before a release, back up the database. Add future changes as new SQL migrations in
   `drizzle-mysql/` and update the Drizzle schema.

The initial generated migration is the complete schema baseline. The migration runner refuses to
apply it to a database that already contains tables but has no migration history. MySQL DDL
implicitly commits; if a migration fails partway, inspect and repair the partial change before
retrying. Do not modify a migration that has already been deployed.

## Existing PostgreSQL data

The MySQL baseline creates a new schema; it does not migrate PostgreSQL data. Any production
cutover requires a separate tested export/transform/import, row-count and relationship checks, and
an application-level staging verification. Keep the PostgreSQL backup unchanged until the MySQL
deployment is verified and explicitly approved.
