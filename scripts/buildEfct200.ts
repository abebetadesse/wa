import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EFCT_MASTER_FOODS } from "../src/lib/nutrition/efctDatabase";
import { NEW_GRAINS } from "./data/grains";
import { NEW_LEGUMES } from "./data/legumes";
import { NEW_ROOTS } from "./data/roots";
import { NEW_VEGETABLES } from "./data/vegetables";
import { NEW_SEEDS } from "./data/seeds";
import { NEW_MEATS } from "./data/meats";
import { NEW_SPICES } from "./data/spices";
import { EFCTFoodItem, FoodCategory } from "../src/lib/nutrition/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Filter existing items by category
const existingGrains = EFCT_MASTER_FOODS.filter((f) => f.category === "Grains & Cereals");
const existingLegumes = EFCT_MASTER_FOODS.filter((f) => f.category === "Legumes & Pulses");
const existingRoots = EFCT_MASTER_FOODS.filter((f) => f.category === "Roots & Tubers");
const existingVegetables = EFCT_MASTER_FOODS.filter((f) => f.category === "Vegetables & Greens");
const existingSeeds = EFCT_MASTER_FOODS.filter((f) => f.category === "Seeds, Nuts & Oils");
const existingMeats = EFCT_MASTER_FOODS.filter((f) => f.category === "Meat, Poultry & Dairy");
const existingSpices = EFCT_MASTER_FOODS.filter((f) => f.category === "Spices & Nutrient Amplifiers");

const allGrains = [...existingGrains, ...NEW_GRAINS];
const allLegumes = [...existingLegumes, ...NEW_LEGUMES];
const allRoots = [...existingRoots, ...NEW_ROOTS];
const allVegetables = [...existingVegetables, ...NEW_VEGETABLES];
const allSeeds = [...existingSeeds, ...NEW_SEEDS];
const allMeats = [...existingMeats, ...NEW_MEATS];
const allSpices = [...existingSpices, ...NEW_SPICES];

const combined: EFCTFoodItem[] = [
  ...allGrains,
  ...allLegumes,
  ...allRoots,
  ...allVegetables,
  ...allSeeds,
  ...allMeats,
  ...allSpices,
];

console.log(`Grains: ${allGrains.length}`);
console.log(`Legumes: ${allLegumes.length}`);
console.log(`Roots: ${allRoots.length}`);
console.log(`Vegetables: ${allVegetables.length}`);
console.log(`Seeds: ${allSeeds.length}`);
console.log(`Meats: ${allMeats.length}`);
console.log(`Spices: ${allSpices.length}`);
console.log(`Total: ${combined.length}`);

if (combined.length !== 200) {
  throw new Error(`Expected exactly 200 items, got ${combined.length}`);
}

// Check uniqueness of IDs
const idSet = new Set<string>();
for (const item of combined) {
  if (idSet.has(item.id)) {
    throw new Error(`Duplicate ID found: ${item.id}`);
  }
  idSet.add(item.id);
}

// Check uniqueness of sourceRefs
const refSet = new Set<string>();
for (const item of combined) {
  if (refSet.has(item.sourceRef)) {
    throw new Error(`Duplicate sourceRef found: ${item.sourceRef}`);
  }
  refSet.add(item.sourceRef);
}

console.log("All 200 IDs and sourceRefs are verified unique!");

// Generate TypeScript code
function serializeFoodItem(f: EFCTFoodItem): string {
  return `  {
    id: ${JSON.stringify(f.id)},
    name: ${JSON.stringify(f.name)},
    nameAmharic: ${JSON.stringify(f.nameAmharic)},
    category: ${JSON.stringify(f.category)},
    sourceRef: ${JSON.stringify(f.sourceRef)},
    traditionalPreparation: ${JSON.stringify(f.traditionalPreparation)},
    fastingSuitability: ${JSON.stringify(f.fastingSuitability)},
    glycemicIndex: { value: ${f.glycemicIndex.value}, rating: ${JSON.stringify(f.glycemicIndex.rating)} },
    antinutrients: {
      phyticAcidMgPer100g: ${f.antinutrients.phyticAcidMgPer100g},
      tanninsMgPer100g: ${f.antinutrients.tanninsMgPer100g},
      oxalatesMgPer100g: ${f.antinutrients.oxalatesMgPer100g},
      trypsinInhibitorLevel: ${JSON.stringify(f.antinutrients.trypsinInhibitorLevel)},
      traditionalDegradationMethod: ${JSON.stringify(f.antinutrients.traditionalDegradationMethod)},
      fermentationReductionPct: ${f.antinutrients.fermentationReductionPct},
      bioavailabilityUpliftDescription: ${JSON.stringify(f.antinutrients.bioavailabilityUpliftDescription)},
    },
    macros: { caloriesKcal: ${f.macros.caloriesKcal}, proteinG: ${f.macros.proteinG}, carbohydratesG: ${f.macros.carbohydratesG}, fatsG: ${f.macros.fatsG}, dietaryFiberG: ${f.macros.dietaryFiberG} },
    nutrients: [
${f.nutrients
  .map(
    (n) =>
      `      { name: ${JSON.stringify(n.name)}, symbol: ${JSON.stringify(n.symbol ?? "")}, unit: ${JSON.stringify(n.unit)}, amountPer100g: ${n.amountPer100g}, bioavailabilityFactor: ${n.bioavailabilityFactor}, note: ${JSON.stringify(n.note ?? "")} },`
  )
  .join("\n")}
    ],
    physiologicalNotes: {
      primaryIndications: ${JSON.stringify(f.physiologicalNotes.primaryIndications)},
      bioactiveCompounds: ${JSON.stringify(f.physiologicalNotes.bioactiveCompounds)},
      digestiveTolerance: ${JSON.stringify(f.physiologicalNotes.digestiveTolerance)},
    },
  },`;
}

const fileContent = `import { EFCTFoodItem } from "./types";

export const EFCT_MASTER_FOODS: EFCTFoodItem[] = [
  // ==========================================
  // 1. GRAINS & CEREALS (${allGrains.length} items)
  // ==========================================
${allGrains.map(serializeFoodItem).join("\n")}

  // ==========================================
  // 2. LEGUMES & PULSES (${allLegumes.length} items)
  // ==========================================
${allLegumes.map(serializeFoodItem).join("\n")}

  // ==========================================
  // 3. ROOTS & TUBERS (${allRoots.length} items)
  // ==========================================
${allRoots.map(serializeFoodItem).join("\n")}

  // ==========================================
  // 4. VEGETABLES & GREENS (${allVegetables.length} items)
  // ==========================================
${allVegetables.map(serializeFoodItem).join("\n")}

  // ==========================================
  // 5. SEEDS, NUTS & OILS (${allSeeds.length} items)
  // ==========================================
${allSeeds.map(serializeFoodItem).join("\n")}

  // ==========================================
  // 6. MEAT, POULTRY & DAIRY (${allMeats.length} items)
  // ==========================================
${allMeats.map(serializeFoodItem).join("\n")}

  // ==========================================
  // 7. SPICES & NUTRIENT AMPLIFIERS (${allSpices.length} items)
  // ==========================================
${allSpices.map(serializeFoodItem).join("\n")}
];

export function findEFCTFoodById(id: string): EFCTFoodItem | undefined {
  return EFCT_MASTER_FOODS.find((f) => f.id === id);
}

export function searchEFCTFoods(query: string, category?: string, fastingOnly?: boolean): EFCTFoodItem[] {
  let list = [...EFCT_MASTER_FOODS];

  if (category && category !== "All") {
    list = list.filter((f) => f.category.toLowerCase() === category.toLowerCase());
  }

  if (fastingOnly) {
    list = list.filter((f) => f.fastingSuitability === "fasting_friendly");
  }

  if (query && query.trim().length > 0) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.nameAmharic.includes(query.trim()) ||
        f.category.toLowerCase().includes(q) ||
        f.traditionalPreparation.toLowerCase().includes(q) ||
        f.physiologicalNotes.primaryIndications.some((ind) => ind.toLowerCase().includes(q))
    );
  }

  return list;
}
`;

const targetFile = path.resolve(__dirname, "../src/lib/nutrition/efctDatabase.ts");
fs.writeFileSync(targetFile, fileContent, "utf-8");
console.log(`Successfully generated ${combined.length} items in ${targetFile}`);
