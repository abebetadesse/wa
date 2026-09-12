import { pgTable, uuid, varchar, text, boolean } from "drizzle-orm/pg-core";

export const herbs = pgTable("herbs", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameVernacular: varchar("name_vernacular", { length: 255 }).notNull(), // e.g. "Damakesse", "Tena Adam", "Kosso", "Gesho"
  nameScientific: varchar("name_scientific", { length: 255 }).notNull(), // e.g. "Ocimum lamiifolium", "Ruta chalepensis", "Hagenia abyssinica"
  nameAmharic: varchar("name_amharic", { length: 255 }), // "ዳማከሴ", "ጤና አዳም", "ኮሶ", "ጌሾ"
  traditionalUses: text("traditional_uses").notNull(),
  primaryPartsUsed: varchar("primary_parts_used", { length: 150 }), // "Leaves", "Seeds", "Flowers", "Roots", "Bark"
  contraindicationsGeneral: text("contraindications_general"), // General clinical contraindications (pregnancy, renal failure)
  sourceRef: varchar("source_ref", { length: 100 }).notNull(), // e.g. "ETM-DB-2025-081"
});

export const compounds = pgTable("compounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  herbId: uuid("herb_id")
    .references(() => herbs.id, { onDelete: "cascade" })
    .notNull(),
  compoundName: varchar("compound_name", { length: 255 }).notNull(), // e.g. "Rutin", "Kosotoxin", "Rosmarinic acid", "Coumarins"
  chemicalClass: varchar("chemical_class", { length: 100 }), // "Flavonoid", "Alkaloid", "Phloroglucinol derivative"
  mechanismOfAction: text("mechanism_of_action"), // CYP450 inhibition, platelet aggregation inhibition, etc.
});

export const herbDrugInteractions = pgTable("herb_drug_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  herbId: uuid("herb_id")
    .references(() => herbs.id, { onDelete: "cascade" })
    .notNull(),
  drugClass: varchar("drug_class", { length: 150 }).notNull(), // "Anticoagulants / Antiplatelets", "ACE Inhibitors", "Hypoglycemics", "Sedatives / CNS Depressants"
  drugNameExample: varchar("drug_name_example", { length: 255 }), // "Warfarin, Aspirin, Clopidogrel"
  interactionSeverity: varchar("interaction_severity", { length: 20 }).notNull(), // "high" | "moderate" | "caution"
  mechanism: text("mechanism").notNull(), // "Additive hypoprothrombinemic effect / enhanced bleeding risk"
  clinicalEffect: text("clinical_effect").notNull(), // "Severe hemorrhage, excessive bleeding"
  contraindicated: boolean("contraindicated").default(true).notNull(), // strict contraindication flag
  evidenceLevel: varchar("evidence_level", { length: 50 }).notNull(), // "Clinical Study", "In Vivo", "In Vitro Pharmacological", "Documented Case Report"
  sourceRef: varchar("source_ref", { length: 100 }).notNull(), // e.g. "ETM-SAFETY-WAR-01"
});
