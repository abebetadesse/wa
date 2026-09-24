/**
 * PostgreSQL schema helpers — re-exported under legacy "pg-style" names
 * so every schema file continues to compile unchanged.
 */
import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Legacy aliases kept for backwards-compat with schema files
export {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
};

// MySQL-compat aliases
export { jsonb as json };
export { doublePrecision as float };
export { integer as int };
export { numeric as decimal };