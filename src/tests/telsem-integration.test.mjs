import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  getAllTelsem,
  getTelsemById,
  getTelsemByCategory,
  getTelsemForArchetype,
  getTelsemForAwdeCircle,
  searchTelsem,
} from "../lib/cultural/telsemData.ts";

import { calculateFullDivination } from "../lib/cultural/spiritualDivinationEngine.ts";

describe("Ethiopian Telsem (ጠልሰም) Sacred Repository", () => {
  test("loads all 22 authentic Telsem seals", () => {
    const all = getAllTelsem();
    assert.equal(all.length, 22);

    for (const seal of all) {
      assert.ok(seal.id, "seal must have an id");
      assert.ok(seal.nameGe, "seal must have Ge'ez name");
      assert.ok(seal.nameAm, "seal must have Amharic name");
      assert.ok(seal.nameEn, "seal must have English name");
      assert.ok(seal.category, "seal must have category");
      assert.ok(seal.spiritualMeaning, "seal must have spiritual meaning");
      assert.ok(seal.sacredGeometryDescription, "seal must describe sacred geometry");
      assert.ok(seal.traditionalFormulaGe, "seal must have Ge'ez formula");
      assert.ok(seal.ritualMaterials.length > 0, "seal must list traditional materials");
      assert.ok(seal.associatedArchetypeNumber >= 1 && seal.associatedArchetypeNumber <= 12);
    }
  });

  test("verifies extracted manuscript plate images exist on disk", () => {
    const primarySeals = [
      "telsem-medfe-memelesha",
      "telsem-maesere-aganint-1",
      "telsem-mesteme-aganint-master",
      "telsem-aganint-mawereja",
      "telsem-buda-ayne-tila",
      "telsem-aqabe-rees",
    ];

    for (const id of primarySeals) {
      const seal = getTelsemById(id);
      assert.ok(seal, `Seal ${id} must exist in collection`);
      assert.ok(seal.sourceImage, `Seal ${id} must have sourceImage`);

      const diskPath = path.join(process.cwd(), "public", seal.sourceImage.replace(/^\//, ""));
      assert.ok(fs.existsSync(diskPath), `File ${diskPath} must exist on disk`);
    }
  });

  test("search functionality finds seals by Amharic, Ge'ez, and English terms", () => {
    const medfe = searchTelsem("መድፌ");
    assert.ok(medfe.length >= 1);
    assert.equal(medfe[0].id, "telsem-medfe-memelesha");

    const mikael = searchTelsem("ሚካኤል");
    assert.ok(mikael.length >= 1);
    assert.equal(mikael[0].id, "telsem-dirsan-mikael");

    const solomon = searchTelsem("Solomon");
    assert.ok(solomon.length >= 2); // Star and Net of Solomon

    const protection = searchTelsem("protection");
    assert.ok(protection.length >= 4);
  });

  test("category filtering functions properly", () => {
    const archangels = getTelsemByCategory("archangels");
    assert.ok(archangels.length >= 6); // Michael, Gabriel, Raphael, Raguel, Uriel, Saqwael/Phanuel, Cherub

    const healing = getTelsemByCategory("healing");
    assert.ok(healing.length >= 3);

    const protection = getTelsemByCategory("protection");
    assert.ok(protection.length >= 5);
  });

  test("calculateFullDivination enriches result with matching Telsem", () => {
    const result = calculateFullDivination("ሰላማዊት", "ፀሐይ");
    assert.ok(result.isValid);
    assert.equal(result.finalNumber, 10);
    assert.ok(result.telsem);
    assert.equal(result.telsem.associatedArchetypeNumber, 10);
    assert.equal(result.telsem.nameAm, "የአቃቤ ርዕስ ጠልሰም");
    assert.ok(result.telsem.traditionalFormulaGe.includes("አቃቤ ርዕስ"));
    assert.ok(result.guardianTelsem);
  });

  test("verifies all 22 seals have valid and distinct vector geometry types", () => {
    const all = getAllTelsem();
    const geometryTypes = new Set(all.map((s) => s.vectorGeometryType));
    assert.equal(geometryTypes.size, 22, "Every one of the 22 seals must have a distinct vector geometry type");

    for (const seal of all) {
      assert.ok(seal.vectorGeometryType, `Seal ${seal.id} must have vectorGeometryType`);
      assert.notEqual(seal.vectorGeometryType, "", "Geometry type cannot be empty");
    }
  });
});
