/**
 * The Spiritual Guidance reference tables: reading them for the engines, editing them from
 * /admin/guidance, and CSV import and export. Each table is described once in TABLES (its columns,
 * how a row is validated and which columns identify it); the admin API and page are generic over it.
 *
 * Default rows (src/lib/spiritual-guidance/defaults.ts) are inserted only where a row is missing, so
 * an administrator's edits are never overwritten.
 */
import { and, asc, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  guidanceCalendarDays,
  guidanceEntries,
  guidanceHijriMonthStarts,
  guidanceLetterValues,
  guidanceNames,
  guidanceServices,
} from "@/lib/db/schema";
import { keepExisting } from "@/lib/db/write";
import { parseCsvRecords, toCsv } from "@/lib/csv";
import {
  CALENDAR_DAY_DEFAULTS,
  ENTRY_DEFAULTS,
  ENTRY_KINDS,
  LETTER_SYSTEMS,
  LETTER_VALUE_DEFAULTS,
  METHODS,
  SERVICE_DEFAULTS,
  weightProblem,
} from "@/lib/spiritual-guidance/defaults";
import { DAY_ANCHORS, DAY_KINDS, TRADITIONS, type CalendarDayRule } from "@/lib/spiritual-guidance/observances";
import type { HijriMonthStart } from "@/lib/spiritual-guidance/calendar";

const CACHE_MS = 10_000;
const LANGUAGES = ["am", "om", "ti", "en", "ar"] as const;
const RELIGIONS = ["orthodox", "muslim", "protestant", "catholic", "neutral"] as const;

const localized = z.object({ en: z.string().trim().min(1, "Give the English text.").max(500), am: z.string().trim().max(500).optional(), om: z.string().trim().max(500).optional() });
const optionalLocalized = z.object({ en: z.string().trim().max(1000).default(""), am: z.string().trim().max(1000).optional(), om: z.string().trim().max(1000).optional() });
const notes = z.string().trim().max(500).default("");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

// ── Row schemas (what an administrator may enter) ───────────────────────────

const letterRow = z.object({
  system: z.enum(LETTER_SYSTEMS),
  letter: z.string().trim().min(1).max(8),
  value: z.coerce.number().int().min(0).max(100_000),
  validated: z.coerce.boolean().default(false),
  notes,
});

const entryRow = z.object({
  kind: z.enum(ENTRY_KINDS),
  entryKey: z.string().trim().min(1).max(120).regex(/^[a-z0-9_.-]+$/, "Use lowercase letters, digits, dots, dashes and underscores."),
  language: z.enum(["", "am", "om", "en"]).default(""),
  data: z.record(z.unknown()),
  validated: z.coerce.boolean().default(false),
  notes,
});

const serviceRow = z
  .object({
    slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9_]+$/, "Use lowercase letters, digits and underscores."),
    names: localized,
    descriptions: optionalLocalized.default({ en: "" }),
    mode: z.enum(["date", "naming", "profile"]),
    weights: z.record(z.enum(METHODS), z.coerce.number()),
    options: z.record(z.unknown()).default({}),
    active: z.coerce.boolean().default(true),
    displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  })
  .superRefine((row, ctx) => {
    const problem = weightProblem(row.mode, row.weights);
    if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["weights"], message: problem });
  });

const effects = z.object({
  score: z.coerce.number().min(-100).max(100).optional(),
  avoidFor: z.array(z.string()).optional(),
  favourFor: z.array(z.string()).optional(),
  officesClosed: z.boolean().optional(),
  note: optionalLocalized.optional(),
  exceptKeys: z.array(z.string()).optional(),
  exceptEasterRange: z.object({ anchor: z.enum(["orthodox_easter", "western_easter"]), from: z.number().int(), to: z.number().int() }).optional(),
});

const nullableInt = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v === undefined ? null : v), z.coerce.number().int().min(min).max(max).nullable());

const calendarRow = z
  .object({
    tradition: z.enum(TRADITIONS),
    entryKey: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "Use lowercase letters, digits and dashes."),
    kind: z.enum(DAY_KINDS),
    anchor: z.enum(DAY_ANCHORS),
    calendar: z.enum(["ethiopian", "gregorian", "hijri"]).default("ethiopian"),
    month: nullableInt(1, 13),
    day: nullableInt(0, 30),
    offsetDays: z.coerce.number().int().min(-200).max(200).default(0),
    lengthDays: z.coerce.number().int().min(1).max(366).default(1),
    untilMonth: nullableInt(1, 13),
    untilDay: nullableInt(1, 30),
    names: localized,
    effects: effects.default({}),
    active: z.coerce.boolean().default(true),
    validated: z.coerce.boolean().default(false),
    notes,
  })
  .superRefine((row, ctx) => {
    const need = (ok: boolean, path: string, message: string) => ok || ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    if (row.anchor === "weekly") need(row.day !== null && row.day <= 6, "day", "A weekly day needs a weekday from 0 (Sunday) to 6 (Saturday).");
    if (row.anchor === "monthly") need(row.day !== null && row.day >= 1, "day", "A monthly day needs a day of the month.");
    if (row.anchor === "fixed") need(row.month !== null, "month", "A fixed date needs a month.");
    need((row.untilMonth === null) === (row.untilDay === null), "untilDay", "Give both the month and the day the period runs until, or neither.");
  });

const hijriRow = z.object({
  year: z.coerce.number().int().min(1400).max(1600),
  month: z.coerce.number().int().min(1).max(12),
  startDate: isoDate,
  note: z.string().trim().max(300).default(""),
});

const nameRow = z
  .object({
    nameGeez: z.string().trim().max(80).default(""),
    nameLatin: z.string().trim().max(80).default(""),
    gender: z.enum(["male", "female", "unisex"]),
    languages: z.array(z.enum(LANGUAGES)).min(1, "Give at least one language."),
    religions: z.array(z.enum(RELIGIONS)).min(1, "Give at least one religion, or neutral."),
    origin: z.string().trim().max(80).default(""),
    meanings: optionalLocalized.default({ en: "" }),
    feastDays: z.array(z.object({ calendar: z.enum(["ethiopian", "gregorian", "hijri"]), month: z.number().int().min(1).max(13), day: z.number().int().min(1).max(30) })).default([]),
    tags: z.array(z.string().trim().max(40)).default([]),
    source: z.string().trim().max(200).default(""),
    active: z.coerce.boolean().default(true),
  })
  .refine((row) => row.nameGeez || row.nameLatin, { message: "Give the name in Ge'ez script, Latin script or both.", path: ["nameGeez"] });

// ── Table registry ──────────────────────────────────────────────────────────

interface TableDefinition {
  label: string;
  description: string;
  table: any;
  schema: z.ZodType<Record<string, unknown>, z.ZodTypeDef, unknown>;
  /** Columns that identify a row (a primary or unique key). */
  key: string[];
  /** Columns in CSV and on the admin page, in order. */
  columns: string[];
  /** Columns holding JSON. */
  json: string[];
  order: any[];
}

export const TABLES = {
  letters: {
    label: "Letter values",
    description: "The number each letter counts for in Awde Negest and in numerology.",
    table: guidanceLetterValues,
    schema: letterRow,
    key: ["system", "letter"],
    columns: ["system", "letter", "value", "validated", "notes"],
    json: [],
    order: [asc(guidanceLetterValues.system), asc(guidanceLetterValues.value), asc(guidanceLetterValues.letter)],
  },
  entries: {
    label: "Stars, rules and texts",
    description: "Awde Negest stars and counting rules, hexagram meanings and pairs, explanation templates and settings.",
    table: guidanceEntries,
    schema: entryRow,
    key: ["kind", "entryKey", "language"],
    columns: ["kind", "entryKey", "language", "data", "validated", "notes"],
    json: ["data"],
    order: [asc(guidanceEntries.kind), asc(guidanceEntries.entryKey), asc(guidanceEntries.language)],
  },
  services: {
    label: "Services and weights",
    description: "Each service card and how much every method counts towards its score.",
    table: guidanceServices,
    schema: serviceRow,
    key: ["slug"],
    columns: ["slug", "names", "descriptions", "mode", "weights", "options", "active", "displayOrder"],
    json: ["names", "descriptions", "weights", "options"],
    order: [asc(guidanceServices.displayOrder), asc(guidanceServices.slug)],
  },
  calendar: {
    label: "Feasts, fasts and holidays",
    description: "Religious and public days by tradition, and what each means for an event.",
    table: guidanceCalendarDays,
    schema: calendarRow,
    key: ["tradition", "entryKey"],
    columns: ["tradition", "entryKey", "kind", "anchor", "calendar", "month", "day", "offsetDays", "lengthDays", "untilMonth", "untilDay", "names", "effects", "active", "validated", "notes"],
    json: ["names", "effects"],
    order: [asc(guidanceCalendarDays.tradition), asc(guidanceCalendarDays.kind), asc(guidanceCalendarDays.entryKey)],
  },
  hijri: {
    label: "Announced Hijri months",
    description: "The announced first day of a Hijri month when the moon sighting differs from the calculation.",
    table: guidanceHijriMonthStarts,
    schema: hijriRow,
    key: ["year", "month"],
    columns: ["year", "month", "startDate", "note"],
    json: [],
    order: [asc(guidanceHijriMonthStarts.year), asc(guidanceHijriMonthStarts.month)],
  },
  names: {
    label: "Name database",
    description: "Names offered by the naming service, with meaning, language, religion and feast days.",
    table: guidanceNames,
    schema: nameRow,
    key: ["nameGeez", "nameLatin"],
    columns: ["nameGeez", "nameLatin", "gender", "languages", "religions", "origin", "meanings", "feastDays", "tags", "source", "active"],
    json: ["languages", "religions", "meanings", "feastDays", "tags"],
    order: [asc(guidanceNames.nameLatin), asc(guidanceNames.nameGeez)],
  },
} satisfies Record<string, TableDefinition>;

export type GuidanceTable = keyof typeof TABLES;
export const GUIDANCE_TABLES = Object.keys(TABLES) as GuidanceTable[];

export class GuidanceRowError extends Error {
  constructor(message: string, readonly issues: { path: string; message: string }[]) {
    super(message);
    this.name = "GuidanceRowError";
  }
}

export function validateRow(name: GuidanceTable, input: unknown): Record<string, unknown> {
  const parsed = TABLES[name].schema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
    throw new GuidanceRowError(issues.map((i) => (i.path ? `${i.path}: ${i.message}` : i.message)).join("; "), issues);
  }
  return parsed.data;
}

function keyWhere(name: GuidanceTable, key: Record<string, unknown>): SQL {
  const { table } = TABLES[name] as TableDefinition;
  const conditions = TABLES[name].key.map((column) => {
    if (key[column] === undefined) throw new GuidanceRowError(`Missing ${column}.`, [{ path: column, message: "Required." }]);
    return eq(table[column], key[column]);
  });
  return and(...conditions)!;
}

// ── Reading and editing ─────────────────────────────────────────────────────

export async function listRows(name: GuidanceTable): Promise<Record<string, unknown>[]> {
  const def = TABLES[name] as TableDefinition;
  return db.select().from(def.table).orderBy(...def.order);
}

/** Insert a row, or update the row with the same key. */
export async function saveRow(name: GuidanceTable, input: unknown, userId: string | null): Promise<Record<string, unknown>> {
  const def = TABLES[name] as TableDefinition;
  const row = validateRow(name, input);
  const values = { ...row, updatedBy: userId, updatedAt: new Date() };
  const set = Object.fromEntries(Object.entries(values).filter(([column]) => !def.key.includes(column)));
  await db.insert(def.table).values(values).onDuplicateKeyUpdate({ set });
  invalidate();
  const [saved] = await db.select().from(def.table).where(keyWhere(name, row)).limit(1);
  return saved;
}

export async function deleteRow(name: GuidanceTable, key: Record<string, unknown>): Promise<boolean> {
  const def = TABLES[name] as TableDefinition;
  const [existing] = await db.select().from(def.table).where(keyWhere(name, key)).limit(1);
  if (!existing) return false;
  await db.delete(def.table).where(keyWhere(name, key));
  invalidate();
  return true;
}

export async function exportCsv(name: GuidanceTable): Promise<string> {
  const def = TABLES[name] as TableDefinition;
  const rows = await listRows(name);
  return toCsv(def.columns, rows.map((row) => def.columns.map((column) => row[column])));
}

export interface ImportResult {
  saved: number;
  errors: { line: number; message: string }[];
}

/**
 * Import CSV rows (as written by exportCsv; Excel can save a sheet as "CSV UTF-8"). Valid rows are
 * saved and invalid ones reported by line; nothing is deleted. With `dryRun` nothing is saved.
 */
export async function importCsv(name: GuidanceTable, csv: string, userId: string | null, dryRun = false): Promise<ImportResult> {
  const records = parseCsvRecords(csv);
  const errors: ImportResult["errors"] = [];
  const valid: Record<string, unknown>[] = [];
  records.forEach((record, index) => {
    // A spreadsheet leaves empty cells for missing values; let the schema apply its defaults.
    const cleaned = Object.fromEntries(Object.entries(record).filter(([, value]) => value !== ""));
    try {
      valid.push(validateRow(name, cleaned));
    } catch (error) {
      errors.push({ line: index + 2, message: error instanceof Error ? error.message : String(error) });
    }
  });
  if (!dryRun) for (const row of valid) await saveRow(name, row, userId);
  return { saved: dryRun ? 0 : valid.length, errors };
}

/** Insert every default row that is missing; existing rows are left exactly as they are. */
export async function ensureGuidanceDefaults(): Promise<void> {
  const batches: [any, Record<string, unknown>[]][] = [
    [guidanceLetterValues, LETTER_VALUE_DEFAULTS.map((row) => ({ ...row }))],
    [guidanceEntries, ENTRY_DEFAULTS.map((row) => ({ ...row }))],
    [guidanceServices, SERVICE_DEFAULTS.map((row) => ({ ...row, active: true }))],
    [guidanceCalendarDays, CALENDAR_DAY_DEFAULTS.map((row) => ({ ...row, notes: "" }))],
  ];
  for (const [table, rows] of batches) {
    for (let i = 0; i < rows.length; i += 200) {
      await db.insert(table).values(rows.slice(i, i + 200)).onDuplicateKeyUpdate({ set: keepExisting(table) });
    }
  }
  invalidate();
}

// ── Data for the engines ────────────────────────────────────────────────────

export interface GuidanceData {
  letters: Record<string, Record<string, { value: number; validated: boolean }>>;
  entries: { kind: string; entryKey: string; language: string; data: Record<string, unknown>; validated: boolean }[];
  services: (typeof guidanceServices.$inferSelect)[];
  calendarRules: CalendarDayRule[];
  hijriOverrides: HijriMonthStart[];
}

let cached: { at: number; value: Promise<GuidanceData> } | null = null;

function invalidate() {
  cached = null;
}

async function loadGuidanceData(): Promise<GuidanceData> {
  await ensureGuidanceDefaults();
  const [letters, entries, services, calendar, hijri] = await Promise.all([
    db.select().from(guidanceLetterValues),
    db.select().from(guidanceEntries),
    db.select().from(guidanceServices).where(eq(guidanceServices.active, true)).orderBy(asc(guidanceServices.displayOrder)),
    db.select().from(guidanceCalendarDays).where(eq(guidanceCalendarDays.active, true)),
    db.select().from(guidanceHijriMonthStarts),
  ]);
  const bySystem: GuidanceData["letters"] = {};
  for (const row of letters) (bySystem[row.system] ??= {})[row.letter] = { value: row.value, validated: row.validated };
  return {
    letters: bySystem,
    entries: entries.map(({ kind, entryKey, language, data, validated }) => ({ kind, entryKey, language, data: data as Record<string, unknown>, validated })),
    services,
    calendarRules: calendar.map((row) => ({ ...row, notes: undefined }) as unknown as CalendarDayRule),
    hijriOverrides: hijri.map((row) => ({ year: row.year, month: row.month, start: row.startDate })),
  };
}

/** The reference tables as the engines use them, cached briefly per process. */
export function guidanceData(): Promise<GuidanceData> {
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    const value = loadGuidanceData();
    cached = { at: Date.now(), value };
    value.catch(() => invalidate());
  }
  return cached.value;
}
