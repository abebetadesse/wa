/**
 * Writes that hand back the rows they touched.
 *
 * MySQL has no `INSERT/UPDATE/DELETE … RETURNING`, so these helpers do the equivalent in two
 * steps and keep the two steps consistent:
 *
 *   insertReturning   ids are created by the application before the insert, then the rows are read back
 *   upsertReturning   INSERT … ON DUPLICATE KEY UPDATE, read back by the unique columns that identify the row
 *   updateReturning   the matching rows are locked (SELECT … FOR UPDATE), updated by primary key, read back
 *   deleteReturning   the matching rows are locked and read, then deleted by primary key
 *
 * Update and delete run in a transaction (a savepoint when one is already open), so a row that a
 * concurrent request has just changed is re-checked against the condition before it is touched:
 * `updateReturning(…, eq(status, "draft"))` still means "only if it is a draft right now".
 */
import { and, eq, getTableColumns, getTableName, inArray, or, sql, type InferInsertModel, type InferSelectModel, type SQL } from "drizzle-orm";
import { getTableConfig, type MySqlColumn, type MySqlTable, type MySqlUpdateSetSource } from "drizzle-orm/mysql-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import { isDuplicateKey } from "./errors";
import type { db } from "./index";

/** The database or an open transaction. */
type ReadExecutor = Pick<typeof db, "select">;
type InsertExecutor = ReadExecutor & Pick<typeof db, "insert">;
type WriteExecutor = InsertExecutor & Pick<typeof db, "update" | "delete"> & Partial<Pick<typeof db, "transaction">>;
export type Executor = InsertExecutor;

type Fields = Record<string, MySqlColumn | SQL | SQL.Aliased>;
type KeyColumn = { key: string; column: MySqlColumn };
type AnyRow = Record<string, unknown>;

const keyCache = new WeakMap<MySqlTable, KeyColumn[]>();

function primaryKey(table: MySqlTable): KeyColumn[] {
  let keys = keyCache.get(table);
  if (!keys) {
    const columns = Object.entries(getTableColumns(table) as Record<string, MySqlColumn>);
    const composite = getTableConfig(table).primaryKeys[0]?.columns.map((column) => column.name);
    const names = new Set(composite?.length ? composite : columns.filter(([, column]) => column.primary).map(([, column]) => column.name));
    keys = columns.filter(([, column]) => names.has(column.name)).map(([key, column]) => ({ key, column }));
    if (!keys.length) throw new Error(`${getTableName(table)} has no primary key; write helpers need one.`);
    keyCache.set(table, keys);
  }
  return keys;
}

/** A condition matching exactly the given rows, by the listed columns. */
function matching(keys: KeyColumn[], rows: AnyRow[]): SQL {
  if (keys.length === 1) return inArray(keys[0].column, rows.map((row) => row[keys[0].key]));
  return or(...rows.map((row) => and(...keys.map(({ key, column }) => eq(column, row[key])))))!;
}

function fieldKey(table: MySqlTable, column: MySqlColumn): string {
  const found = Object.entries(getTableColumns(table) as Record<string, MySqlColumn>).find(([, candidate]) => candidate.name === column.name);
  if (!found) throw new Error(`${column.name} is not a column of ${getTableName(table)}.`);
  return found[0];
}

function read(executor: ReadExecutor, table: MySqlTable, where: SQL, fields?: Fields): Promise<AnyRow[]> {
  const query = fields ? (executor as any).select(fields) : (executor as any).select();
  return query.from(table).where(where);
}

/**
 * `ON DUPLICATE KEY UPDATE` that changes nothing: the existing row wins and no error is raised.
 * Use as `.onDuplicateKeyUpdate({ set: keepExisting(table) })` for insert-if-absent behavior.
 */
export function keepExisting<T extends MySqlTable>(table: T): MySqlUpdateSetSource<T> {
  const { key, column } = primaryKey(table)[0];
  return { [key]: sql`${column}` } as MySqlUpdateSetSource<T>;
}

export interface InsertOptions<F extends Fields | undefined = undefined> {
  /** Columns to hand back; the whole row when omitted. */
  fields?: F;
  /** A row that collides with an existing unique value is skipped (and not returned) instead of raising. */
  ifAbsent?: boolean;
}

type Returned<T extends MySqlTable, F extends Fields | undefined> = F extends Fields ? SelectResultFields<F> : InferSelectModel<T>;

/** Inserts one row or several and returns what was stored, in the order given. */
export async function insertReturning<T extends MySqlTable, F extends Fields | undefined = undefined>(
  executor: InsertExecutor,
  table: T,
  values: InferInsertModel<T> | InferInsertModel<T>[],
  options: InsertOptions<F> = {},
): Promise<Returned<T, F>[]> {
  const rows = (Array.isArray(values) ? values : [values]).map((value) => ({ ...(value as AnyRow) }));
  if (!rows.length) return [];
  const keys = primaryKey(table);
  const generated = keys.length === 1 && (keys[0].column as MySqlColumn & { autoIncrement?: boolean }).autoIncrement === true;
  if (!generated) {
    for (const row of rows) {
      for (const { key, column } of keys) {
        if (row[key] !== undefined) continue;
        if (!column.defaultFn) throw new Error(`${getTableName(table)}.${column.name} must be supplied to insert a row.`);
        row[key] = column.defaultFn();
      }
    }
  }

  let stored: AnyRow[];
  if (options.ifAbsent) {
    // One at a time, so a duplicate skips only its own row.
    stored = [];
    for (const row of rows) {
      try {
        const [result] = (await (executor as any).insert(table).values(row)) as [{ insertId: number }];
        stored.push(generated ? { ...row, [keys[0].key]: result.insertId } : row);
      } catch (error) {
        if (!isDuplicateKey(error)) throw error;
      }
    }
    if (!stored.length) return [];
  } else {
    const [result] = (await (executor as any).insert(table).values(rows)) as [{ insertId: number }];
    // A multi-row insert receives consecutive ids starting at insertId.
    stored = generated ? rows.map((row, index) => ({ ...row, [keys[0].key]: result.insertId + index })) : rows;
  }

  const found = await read(executor, table, matching(keys, stored), options.fields);
  if (options.fields || found.length < 2) return found as Returned<T, F>[];
  const identity = (row: AnyRow) => keys.map(({ key }) => String(row[key])).join("\u0000");
  const byKey = new Map(found.map((row) => [identity(row), row]));
  return stored.map((row) => byKey.get(identity(row))).filter(Boolean) as Returned<T, F>[];
}

export interface UpsertOptions<T extends MySqlTable, F extends Fields | undefined = undefined> {
  /** The unique column(s) that identify the row. */
  target: MySqlColumn | MySqlColumn[];
  /** What to change when the row already exists. */
  set: MySqlUpdateSetSource<T>;
  fields?: F;
}

/** Inserts the row, or updates the existing one with the same `target` values; returns the stored row. */
export async function upsertReturning<T extends MySqlTable, F extends Fields | undefined = undefined>(
  executor: InsertExecutor,
  table: T,
  values: InferInsertModel<T>,
  options: UpsertOptions<T, F>,
): Promise<Returned<T, F>[]> {
  const row = { ...(values as AnyRow) };
  const targets = (Array.isArray(options.target) ? options.target : [options.target]).map((column) => ({ key: fieldKey(table, column), column }));
  for (const { key, column } of targets) {
    if (row[key] === undefined) throw new Error(`${getTableName(table)}.${column.name} identifies the row and must be supplied.`);
  }
  const set = Object.keys(options.set as AnyRow).length ? options.set : keepExisting(table);
  await (executor as any).insert(table).values(row).onDuplicateKeyUpdate({ set });
  return (await read(executor, table, matching(targets, [row]), options.fields)) as Returned<T, F>[];
}

/** Updates the rows matching `where` and returns them as they are afterwards. */
export async function updateReturning<T extends MySqlTable, F extends Fields | undefined = undefined>(
  executor: WriteExecutor,
  table: T,
  set: MySqlUpdateSetSource<T>,
  where: SQL | undefined,
  fields?: F,
): Promise<Returned<T, F>[]> {
  const keys = primaryKey(table);
  const update = async (tx: Pick<typeof db, "select" | "update">) => {
    const locked = (await (tx as any).select(Object.fromEntries(keys.map(({ key, column }) => [key, column]))).from(table).where(where).for("update")) as AnyRow[];
    if (!locked.length) return [];
    const these = matching(keys, locked);
    await (tx as any).update(table).set(set).where(these);
    return (await read(tx, table, these, fields)) as Returned<T, F>[];
  };
  return executor.transaction ? executor.transaction(update) : update(executor);
}

/** Deletes the rows matching `where` and returns them as they were. */
export async function deleteReturning<T extends MySqlTable, F extends Fields | undefined = undefined>(
  executor: WriteExecutor,
  table: T,
  where: SQL | undefined,
  fields?: F,
): Promise<Returned<T, F>[]> {
  const keys = primaryKey(table);
  const remove = async (tx: Pick<typeof db, "select" | "delete">) => {
    const locked = (await (tx as any).select().from(table).where(where).for("update")) as AnyRow[];
    if (!locked.length) return [];
    const these = matching(keys, locked);
    const result = fields ? await read(tx, table, these, fields) : locked;
    await (tx as any).delete(table).where(these);
    return result as Returned<T, F>[];
  };
  return executor.transaction ? executor.transaction(remove) : remove(executor);
}
