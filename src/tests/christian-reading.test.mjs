import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { matchReligion } from "../lib/christian/religionMatch.ts";
import { readingsByCategory, wordProjectChapterUrl } from "../lib/christian/readingLibrary.ts";
import { getLiturgicalContext } from "../lib/christian/liturgicalCalendar.ts";
import { CHRISTIAN_NAME_CATALOG } from "../lib/christian/christianNameCatalog.ts";
import { suggestAlternativeNames } from "../lib/profiling/naming/nameSuggester.ts";

describe("Christian reading path", () => {
  test("matches Ethiopian Christian traditions without Jewish false positives", () => {
    assert.deepEqual(matchReligion("Ethiopian Orthodox Tewahedo").tradition, "orthodox");
    assert.equal(matchReligion("ይሁዳዊ").isChristian, false);
    assert.equal(matchReligion("non-Christian").isChristian, false);
  });

  test("provides categorized readings and safe external URLs", () => {
    assert.ok(readingsByCategory("ethiopian-canon").length >= 3);
    assert.equal(
      wordProjectChapterUrl("eth-enoch", "1"),
      "https://www.wordproject.org/bibles/am/index.htm",
    );
    assert.match(wordProjectChapterUrl("43", "1"), /\/43\/1\.htm$/);
  });

  test("identifies weekly fasting context deterministically", () => {
    const context = getLiturgicalContext(new Date(2026, 8, 25));
    assert.equal(context.weeklyFast, true);
    assert.match(context.summary, /Weekly fast/);
  });

  test("loads the supplied biblical catalog into name suggestions", () => {
    assert.ok(CHRISTIAN_NAME_CATALOG.length > 2500);
    assert.ok(CHRISTIAN_NAME_CATALOG.some((record) => record.name === "Abaddon"));
    const suggestions = suggestAlternativeNames({});
    assert.ok(suggestions.some((suggestion) => suggestion.suggestedName === "Abaddon"));
    assert.equal(
      suggestions.find((suggestion) => suggestion.suggestedName === "Abaddon")?.sourceTradition,
      "Biblical",
    );
  });
});
