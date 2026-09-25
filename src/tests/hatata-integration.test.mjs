import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  HATETA_MENAFSEST,
  AWDE_NEGEST_CHAPTERS,
  getAllSpiritCommentary,
  getSpiritById,
  getSpiritsByClass,
  getAwdeChapter,
  getAllAwdeChapters,
  searchSpiritCommentary,
} from "../lib/cultural/hatataMenafsest.ts";

import { getTelsemById } from "../lib/cultural/telsemData.ts";

describe("ሃተታ መናፍስት ወ አውደ ነገስት ከነትርጉሙ (Hatata Menafsest Integration Suite)", () => {
  test("loads all 9 authentic spirit commentary entries with full trilingual content", () => {
    const spirits = getAllSpiritCommentary();
    assert.equal(spirits.length, 9, "Should contain exactly 9 curated spirit entries");

    for (const s of spirits) {
      assert.ok(s.id, "Every spirit must have an ID");
      assert.ok(s.nameGe, `Spirit ${s.id} must have a Ge'ez name`);
      assert.ok(s.nameAm, `Spirit ${s.id} must have an Amharic name`);
      assert.ok(s.nameEn, `Spirit ${s.id} must have an English name`);
      assert.ok(s.spiritClass, `Spirit ${s.id} must have a spirit class`);
      assert.ok(s.hatatDefinitionGe, `Spirit ${s.id} must have Ge'ez definition`);
      assert.ok(s.hatatDefinitionAm, `Spirit ${s.id} must have Amharic definition`);
      assert.ok(s.hatatDefinitionEn, `Spirit ${s.id} must have English definition`);
      assert.ok(s.protectiveFormulaGe, `Spirit ${s.id} must have Ge'ez protective formula`);
      assert.ok(s.protectiveFormulaEn, `Spirit ${s.id} must have English protective formula`);
      assert.ok(Array.isArray(s.counterMeasures) && s.counterMeasures.length > 0, `Spirit ${s.id} must have countermeasures`);
      assert.ok(Array.isArray(s.signsOfManifestationAm) && s.signsOfManifestationAm.length > 0, `Spirit ${s.id} must have Amharic manifestation signs`);
    }
  });

  test("spirit commentary entries link to verified Telsem seals in repository", () => {
    const spirits = getAllSpiritCommentary();
    for (const s of spirits) {
      const seal = getTelsemById(s.associatedTelsemId);
      assert.ok(seal, `Spirit ${s.id} links to seal ${s.associatedTelsemId} which must exist in Telsem repository`);
    }
  });

  test("getSpiritById returns correct spirit entry", () => {
    const michael = getSpiritById("melaek-mikael");
    assert.ok(michael, "Saint Michael must be found by ID");
    assert.equal(michael.spiritClass, "melaek_tsadag");
    assert.ok(michael.nameGe.includes("ሚካኤል"));

    const buda = getSpiritById("ganen-buda");
    assert.ok(buda, "Buda must be found by ID");
    assert.equal(buda.spiritClass, "buda_ayne");
    assert.ok(buda.nameAm.includes("ቡዳ"));
  });

  test("getSpiritsByClass filters spirits by theological taxonomy", () => {
    const archangels = getSpiritsByClass("melaek_tsadag");
    assert.ok(archangels.length >= 3, "Must have at least 3 holy archangels (Michael, Gabriel, Raphael)");

    const adversaries = getSpiritsByClass("melaek_gana");
    assert.ok(adversaries.length >= 1, "Must have adversarial entities");
  });

  test("searchSpiritCommentary performs trilingual term matching", () => {
    const searchGe = searchSpiritCommentary("ሚካኤል");
    assert.ok(searchGe.length > 0, "Should match Ge'ez text search for Michael");

    const searchAm = searchSpiritCommentary("ፈዋሽ");
    assert.ok(searchAm.length > 0, "Should match Amharic keyword search");

    const searchEn = searchSpiritCommentary("Raphael");
    assert.ok(searchEn.length > 0, "Should match English keyword search");
  });

  test("loads all 6 Awde Negest circle chapters with trilingual translations", () => {
    const chapters = getAllAwdeChapters();
    assert.equal(chapters.length, 6, "Should contain 6 core circle chapters");

    for (const ch of chapters) {
      assert.ok(ch.circleNumber, "Chapter must have a circle number");
      assert.ok(ch.circleNameGe, `Circle ${ch.circleNumber} must have Ge'ez name`);
      assert.ok(ch.circleNameAm, `Circle ${ch.circleNumber} must have Amharic name`);
      assert.ok(ch.circleNameEn, `Circle ${ch.circleNumber} must have English name`);
      assert.ok(ch.guardianAngel, `Circle ${ch.circleNumber} must have guardian angel`);
      assert.ok(ch.chapterTextGe, `Circle ${ch.circleNumber} must have Ge'ez chapter text`);
      assert.ok(ch.chapterTextAm, `Circle ${ch.circleNumber} must have Amharic chapter text`);
      assert.ok(ch.chapterTextEn, `Circle ${ch.circleNumber} must have English chapter text`);
      assert.ok(Array.isArray(ch.prophesyForCategories) && ch.prophesyForCategories.length > 0, `Circle ${ch.circleNumber} must have prophecy outcomes`);
    }
  });

  test("getAwdeChapter finds chapter by circle number", () => {
    const ch1 = getAwdeChapter(1);
    assert.ok(ch1, "Chapter 1 must exist");
    assert.equal(ch1.circleNumber, 1);
    assert.ok(ch1.circleNameAm.includes("ሚካኤል"));

    const ch7 = getAwdeChapter(7);
    assert.ok(ch7, "Chapter 7 must exist");
    assert.equal(ch7.circleNumber, 7);
  });
});
