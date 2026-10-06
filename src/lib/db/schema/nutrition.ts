import { mysqlTable, uuid, varchar, numeric, text, integer, primaryKey } from "../mysqlSchema";

export const foods = mysqlTable("foods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(), // e.g. "Teff Injera (Fermented)", "Shiro Wot"
  nameAmharic: varchar("name_amharic", { length: 255 }), // e.g. "ጤፍ እንጀራ", "ሽሮ ወጥ"
  category: varchar("category", { length: 100 }).notNull(), // "Grains & Cereals", "Legumes & Pulses", "Roots & Tubers", "Vegetables", "Spices"
  traditionalPreparation: text("traditional_preparation"), // fermentation details, roasting, sun drying
  sourceRef: varchar("source_ref", { length: 100 }).notNull(), // e.g. "EFCT2025-0142" - lineage traceability
  fastingSuitability: varchar("fasting_suitability", { length: 50 }).default("dual"), // "fasting_friendly", "non_fasting", "dual"
  glycemicIndex: integer("glycemic_index"),
  phyticAcidMg: numeric("phytic_acid_mg", { precision: 8, scale: 2 }),
  tanninsMg: numeric("tannins_mg", { precision: 8, scale: 2 }),
  oxalatesMg: numeric("oxalates_mg", { precision: 8, scale: 2 }),
  fermentationReductionPct: integer("fermentation_reduction_pct"),
});

export const nutrients = mysqlTable("nutrients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(), // "Iron", "Calcium", "Zinc", "Vitamin B12", "Folate", "Vitamin D", "Magnesium"
  symbol: varchar("symbol", { length: 20 }), // "Fe", "Ca", "Zn", "B12", "B9", "VitD", "Mg"
  unit: varchar("unit", { length: 20 }).notNull(), // "mg", "mcg", "g", "IU"
  category: varchar("category", { length: 50 }).notNull(), // "mineral", "vitamin", "macronutrient"
  rdaBase: numeric("rda_base", { precision: 10, scale: 2 }).notNull(), // standard baseline RDA
  tolerableUpperLimit: numeric("tolerable_upper_limit", { precision: 10, scale: 2 }), // UL threshold
});

export const foodNutrients = mysqlTable(
  "food_nutrients",
  {
    foodId: uuid("food_id")
      .references(() => foods.id, { onDelete: "cascade" })
      .notNull(),
    nutrientId: uuid("nutrient_id")
      .references(() => nutrients.id, { onDelete: "cascade" })
      .notNull(),
    amountPer100g: numeric("amount_per_100g", { precision: 10, scale: 3 }).notNull(),
    bioavailabilityFactor: numeric("bioavailability_factor", { precision: 4, scale: 2 }).default("1.00"), // Fermentation uplift e.g. 1.45 for injera fermentation degradation of phytates
    fermentationImpactNote: varchar("fermentation_impact_note", { length: 255 }), // Traceable scientific annotation
  },
  (t) => ({
    pk: primaryKey({ columns: [t.foodId, t.nutrientId] }),
  })
);
