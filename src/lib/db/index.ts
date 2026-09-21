import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://root:root@localhost:3306/ethio_wellness";

// Global pool to prevent connection leaks during Next.js hot-reloads
const globalForDb = globalThis as unknown as {
  pool?: mysql.Pool;
};

export const pool =
  globalForDb.pool ??
  mysql.createPool(connectionString);

globalForDb.pool = pool;

const rawDb = drizzle({ client: pool, schema, mode: "default" });

function wrapWriteBuilder(builder: any, table: any, operation: "insert" | "update", whereClause?: unknown, values?: unknown): any {
  return new Proxy(builder, {
    get(target, property, receiver) {
      if (property === "returning") {
        return async (fields?: Record<string, unknown>) => {
          if (operation === "insert") {
            await target;
            const insertedValues = Array.isArray(values) ? values : values ? [values] : [];
            const ids = insertedValues.map((value) => value?.id).filter(Boolean);
            if (!ids.length || !table.id) return [];
            return fields
              ? rawDb.select(fields as any).from(table).where(inArray(table.id, ids))
              : rawDb.select().from(table).where(inArray(table.id, ids));
          }

          await target;
          if (!whereClause) return [];
          return fields
            ? rawDb.select(fields as any).from(table).where(whereClause as any)
            : rawDb.select().from(table).where(whereClause as any);
        };
      }

      if (property === "onConflictDoUpdate") {
        return (config: { set: Record<string, unknown> }) =>
          wrapWriteBuilder(target.onDuplicateKeyUpdate({ set: config.set }), table, operation, whereClause, values);
      }

      if (property === "onConflictDoNothing") {
        return () => wrapWriteBuilder(target.onDuplicateKeyUpdate({ set: {} }), table, operation, whereClause, values);
      }

      if (property === "values") {
        return (input: Record<string, unknown> | Record<string, unknown>[]) => {
          const list = Array.isArray(input) ? input : [input];
          const normalized = list.map((value) => ({
            ...value,
            ...(table.id && !value.id ? { id: randomUUID() } : {}),
          }));
          const nextValues = Array.isArray(input) ? normalized : normalized[0];
          return wrapWriteBuilder(target.values(nextValues), table, operation, whereClause, nextValues);
        };
      }

      if (property === "where") {
        return (condition: unknown) => wrapWriteBuilder(target.where(condition), table, operation, condition, values);
      }

      const value = Reflect.get(target, property, receiver);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => {
        const result = value.apply(target, args);
        return result && typeof result === "object" && typeof result.then !== "function"
          ? wrapWriteBuilder(result, table, operation, whereClause, values)
          : result;
      };
    },
  });
}

const compatDb = new Proxy(rawDb as any, {
  get(target, property, receiver) {
    if (property === "insert" || property === "update") {
      return (table: unknown) => wrapWriteBuilder(target[property](table), table, property === "insert" ? "insert" : "update");
    }
    return Reflect.get(target, property, receiver);
  },
});

export const db = compatDb as Omit<typeof rawDb, "insert" | "update"> & {
  insert: any;
  update: any;
};
