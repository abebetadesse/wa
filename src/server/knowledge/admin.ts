import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { knowledgeCategories, knowledgeItems, knowledgeStrands, knowledgeVersions } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import { parseCsvRecords, toCsv } from "@/lib/csv";
import type { AuthenticatedUser } from "@/lib/auth";
import { insertReturning } from "@/lib/db/write";

export const KNOWLEDGE_READERS = ["editor", "reviewer", "admin", "super_admin"] as const;
export const KNOWLEDGE_EDITORS = ["editor", "admin", "super_admin"] as const;
export const KNOWLEDGE_ADMINS = ["admin", "super_admin"] as const;

export const ITEM_STATUSES = ["draft", "review", "published", "archived"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

/** Who may move an item into each status. Publishing requires a reviewer or administrator. */
const TRANSITIONS: Record<ItemStatus, readonly string[]> = {
  draft: ["editor", "reviewer", "admin", "super_admin"],
  review: ["editor", "admin", "super_admin"],
  published: ["reviewer", "admin", "super_admin"],
  archived: ["admin", "super_admin"],
};

export function canTransition(role: string, status: ItemStatus) {
  return TRANSITIONS[status].includes(role);
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const jsonObject = z.record(z.unknown());

export const strandInput = z.object({
  name: z.string().trim().min(1, "Strand name is required."),
  description: z.string().default(""),
  version: z.string().trim().default("1.0.0"),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const categoryInput = z.object({
  name: z.string().trim().min(1, "Category name is required."),
  description: z.string().default(""),
  schema: jsonObject.default({ fields: [] }),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const itemInput = z.object({ data: jsonObject.default({}), changeComment: z.string().default("") });

export const importItems = z
  .union([z.array(z.unknown()), z.object({ items: z.array(z.unknown()) })])
  .transform((body) => (Array.isArray(body) ? body : body.items))
  .pipe(
    z
      .array(
        z.object({
          categoryId: z.coerce.string().min(1),
          data: jsonObject,
          status: z.enum(ITEM_STATUSES).catch("draft"),
        }),
        { message: "JSON must contain items with categoryId and data." },
      )
      .min(1, "JSON contains no items."),
  );

// ── Helpers ──────────────────────────────────────────────────────────────────

function found<T>(row: T | undefined, what: string): T {
  if (!row) throw ApiError.notFound(what);
  return row;
}

async function selectById<T extends typeof knowledgeStrands | typeof knowledgeCategories | typeof knowledgeItems>(table: T, id: string) {
  const [row] = await db.select().from(table as typeof knowledgeItems).where(eq((table as typeof knowledgeItems).id, id)).limit(1);
  return row;
}

// ── Strands ──────────────────────────────────────────────────────────────────

export function listStrands() {
  return db.select().from(knowledgeStrands).orderBy(asc(knowledgeStrands.displayOrder), asc(knowledgeStrands.name));
}

export async function createStrand(user: AuthenticatedUser, input: z.infer<typeof strandInput>) {
  const [row] = await insertReturning(db, knowledgeStrands, { ...input, createdBy: user.id, updatedBy: user.id });
  return row;
}

export async function updateStrand(user: AuthenticatedUser, id: string, input: z.infer<typeof strandInput>) {
  await db.update(knowledgeStrands).set({ ...input, updatedBy: user.id, updatedAt: new Date() }).where(eq(knowledgeStrands.id, id));
  return found(await selectById(knowledgeStrands, id), "Strand");
}

export async function archiveStrand(user: AuthenticatedUser, id: string) {
  found(await selectById(knowledgeStrands, id), "Strand");
  await db.update(knowledgeStrands).set({ isActive: false, updatedBy: user.id, updatedAt: new Date() }).where(eq(knowledgeStrands.id, id));
  return selectById(knowledgeStrands, id);
}

// ── Categories ───────────────────────────────────────────────────────────────

export function listCategories(strandId: string) {
  return db
    .select()
    .from(knowledgeCategories)
    .where(eq(knowledgeCategories.strandId, strandId))
    .orderBy(asc(knowledgeCategories.displayOrder), asc(knowledgeCategories.name));
}

export async function getCategory(id: string) {
  return found(await selectById(knowledgeCategories, id), "Category");
}

export async function createCategory(strandId: string, input: z.infer<typeof categoryInput>) {
  found(await selectById(knowledgeStrands, strandId), "Strand");
  const [row] = await insertReturning(db, knowledgeCategories, { ...input, strandId });
  return row;
}

export async function updateCategory(id: string, input: z.infer<typeof categoryInput>) {
  await getCategory(id);
  await db.update(knowledgeCategories).set({ ...input, updatedAt: new Date() }).where(eq(knowledgeCategories.id, id));
  return getCategory(id);
}

export async function archiveCategory(id: string) {
  await getCategory(id);
  await db.update(knowledgeCategories).set({ isActive: false, updatedAt: new Date() }).where(eq(knowledgeCategories.id, id));
  return getCategory(id);
}

// ── Items ────────────────────────────────────────────────────────────────────

export function listItems(categoryId: string) {
  return db.select().from(knowledgeItems).where(eq(knowledgeItems.categoryId, categoryId)).orderBy(desc(knowledgeItems.updatedAt));
}

export async function createItem(user: AuthenticatedUser, categoryId: string, data: Record<string, unknown>) {
  await getCategory(categoryId);
  const [row] = await insertReturning(db, knowledgeItems, { categoryId, data, status: "draft", createdBy: user.id, updatedBy: user.id });
  return row;
}

/** Edits snapshot the previous content into knowledge_versions and send the item back to draft. */
export async function updateItem(user: AuthenticatedUser, id: string, input: z.infer<typeof itemInput>) {
  const current = found(await selectById(knowledgeItems, id), "Item");
  await db.insert(knowledgeVersions).values({
    itemId: id,
    data: current.data,
    versionNumber: current.version,
    changeComment: input.changeComment,
    createdBy: user.id,
  });
  await db
    .update(knowledgeItems)
    .set({ data: input.data, version: current.version + 1, status: "draft", updatedBy: user.id, updatedAt: new Date() })
    .where(eq(knowledgeItems.id, id));
  return selectById(knowledgeItems, id);
}

export async function transitionItem(user: AuthenticatedUser, id: string, status: ItemStatus) {
  if (!canTransition(user.role, status)) throw ApiError.forbidden("Role cannot perform this transition.");
  found(await selectById(knowledgeItems, id), "Item");
  const publishing = status === "published";
  await db
    .update(knowledgeItems)
    .set({
      status,
      ...(publishing ? { reviewedBy: user.id, publishedAt: new Date() } : {}),
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .where(eq(knowledgeItems.id, id));
  return selectById(knowledgeItems, id);
}

// ── Import / export ──────────────────────────────────────────────────────────

export async function importItemRows(user: AuthenticatedUser, rows: { categoryId: string; data: Record<string, unknown>; status: ItemStatus }[]) {
  // Only roles that may publish can import already-published content.
  const values = rows.map((row) => ({
    categoryId: row.categoryId,
    data: row.data,
    status: canTransition(user.role, row.status) ? row.status : "draft",
    createdBy: user.id,
    updatedBy: user.id,
  }));
  const items = await insertReturning(db, knowledgeItems, values);
  return { imported: items.length, items };
}

export async function importCsv(user: AuthenticatedUser, categoryId: string, csv: string) {
  await getCategory(categoryId);
  const records = parseCsvRecords(csv);
  if (!records.length) throw ApiError.badRequest("CSV contains no data rows.");
  return importItemRows(user, records.map((data) => ({ categoryId, data, status: "draft" as const })));
}

export async function exportItemsCsv(categoryId?: string) {
  const items = categoryId ? await listItems(categoryId) : await db.select().from(knowledgeItems);
  const records = items.map((item) => (item.data || {}) as Record<string, unknown>);
  const fields = [...new Set(records.flatMap((record) => Object.keys(record)))];
  return toCsv(fields, records.map((record) => fields.map((field) => record[field])));
}

export async function exportAll() {
  const [strands, categories, items] = await Promise.all([
    db.select().from(knowledgeStrands),
    db.select().from(knowledgeCategories),
    db.select().from(knowledgeItems),
  ]);
  return { exportedAt: new Date().toISOString(), strands, categories, items };
}
