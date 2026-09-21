import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "../mysqlSchema";
import { users } from "./users";

export const knowledgeStrands = pgTable("knowledge_strands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description").default("").notNull(),
  version: varchar("version", { length: 30 }).default("1.0.0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledgeCategories = pgTable("knowledge_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  strandId: uuid("strand_id").references(() => knowledgeStrands.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").default("").notNull(),
  schema: jsonb("schema").default({ fields: [] }).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledgeItems = pgTable("knowledge_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => knowledgeCategories.id, { onDelete: "cascade" }).notNull(),
  data: jsonb("data").default({}).notNull(),
  version: integer("version").default(1).notNull(),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledgeVersions = pgTable("knowledge_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").references(() => knowledgeItems.id, { onDelete: "cascade" }).notNull(),
  data: jsonb("data").notNull(),
  versionNumber: integer("version_number").notNull(),
  changeComment: text("change_comment").default("").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
