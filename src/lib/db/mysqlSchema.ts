import { randomUUID } from "node:crypto";
import {
  boolean,
  date,
  decimal,
  float,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const pgTable = mysqlTable;
export const uuid = (name: string) => {
  const column = varchar(name, { length: 36 });
  return Object.assign(column, {
    defaultRandom: () => column.$defaultFn(() => randomUUID()),
  }) as any;
};
export const jsonb = json;
export const numeric = decimal;
export const integer = int;
export const real = float;
export { boolean, date, primaryKey, text, timestamp, varchar };