import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { db } from "./index";
import { auditLog, foodNutrients, foods, nutrients } from "./schema";
import { EFCT_MASTER_FOODS } from "../nutrition/efctDatabase";

const nutrientsData = [
  ["Iron", "Fe", "mg", "mineral", "18.00", "45.00"],
  ["Calcium", "Ca", "mg", "mineral", "1000.00", "2500.00"],
  ["Zinc", "Zn", "mg", "mineral", "11.00", "40.00"],
  ["Vitamin B12", "B12", "mcg", "vitamin", "2.40", null],
  ["Folate", "B9", "mcg", "vitamin", "400.00", "1000.00"],
  ["Vitamin D", "VitD", "IU", "vitamin", "600.00", "4000.00"],
  ["Magnesium", "Mg", "mg", "mineral", "400.00", "350.00"],
  ["Vitamin C", "VitC", "mg", "vitamin", "90.00", "2000.00"],
  ["Vitamin A", "VitA", "mcg", "vitamin", "900.00", "3000.00"],
  ["Protein", "Pro", "g", "macronutrient", "56.00", null],
  ["Dietary Fiber", "Fib", "g", "macronutrient", "30.00", null],
  ["Potassium", "K", "mg", "mineral", "3400.00", null],
] as const;

export async function runSeed() {
  await db.transaction(async (tx) => {
    await tx.delete(auditLog);
    await tx.delete(foodNutrients);
    await tx.delete(foods);
    await tx.delete(nutrients);

    const nutrientIds = new Map<string, string>();
    for (const [name, symbol, unit, category, rdaBase, tolerableUpperLimit] of nutrientsData) {
      const id = randomUUID();
      nutrientIds.set(name, id);
      await tx.insert(nutrients).values({ id, name, symbol, unit, category, rdaBase, tolerableUpperLimit });
    }

    for (const food of EFCT_MASTER_FOODS) {
      const foodId = randomUUID();
      await tx.insert(foods).values({
        id: foodId,
        name: food.name,
        nameAmharic: food.nameAmharic,
        category: food.category,
        traditionalPreparation: food.traditionalPreparation,
        sourceRef: food.sourceRef,
        fastingSuitability: food.fastingSuitability,
        glycemicIndex: food.glycemicIndex.value,
        phyticAcidMg: String(food.antinutrients.phyticAcidMgPer100g),
        tanninsMg: String(food.antinutrients.tanninsMgPer100g),
        oxalatesMg: String(food.antinutrients.oxalatesMgPer100g),
        fermentationReductionPct: food.antinutrients.fermentationReductionPct,
      });

      for (const nutrient of food.nutrients) {
        const nutrientId = nutrientIds.get(nutrient.name);
        if (!nutrientId) continue;
        await tx.insert(foodNutrients).values({
          foodId,
          nutrientId,
          amountPer100g: String(nutrient.amountPer100g),
          bioavailabilityFactor: String(nutrient.bioavailabilityFactor),
          fermentationImpactNote: nutrient.note || food.antinutrients.bioavailabilityUpliftDescription,
        });
      }
    }

    await tx.insert(auditLog).values({
      id: randomUUID(),
      eventType: "system_initialized",
      action: "seed_complete",
      resourceType: "system",
      payload: { foods: EFCT_MASTER_FOODS.length, nutrients: nutrientsData.length },
    });
  });
  console.log(`Seeded ${EFCT_MASTER_FOODS.length} Ethiopian foods and ${nutrientsData.length} nutrients into MySQL.`);
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMainModule) runSeed().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
