import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CASE_SAMPLES,
  DEFAULT_CASE_SEARCH_SETTINGS,
  searchCaseSamples,
} from "../lib/discovery/caseSearch.ts";

test("case library contains 200 illustrative samples and matches each search dimension", () => {
  assert.equal(CASE_SAMPLES.length, 200);
  const searches = [
    { query: "sleep" },
    { query: "Moringa" },
    { herb: "Ginger (food ingredient)" },
    { diet: "Teff injera with lentils" },
    { location: "Gondar" },
    { element: "Water" },
    { caseType: "Sleep & rest" },
  ];
  for (const search of searches) {
    const result = searchCaseSamples(search);
    assert.ok(result.results.length > 0, `expected results for ${JSON.stringify(search)}`);
    assert.equal(result.isFallback, false, `expected a match for ${JSON.stringify(search)}`);
  }
});

test("unmatched searches return clearly labeled starter examples rather than an empty result", () => {
  const result = searchCaseSamples({ query: "no-such-topic-xyz" });
  assert.ok(result.results.length > 0);
  assert.equal(result.isFallback, true);
  assert.match(result.message, /popular starter examples/i);
});

test("disabled filters are omitted from options and text matching", () => {
  const settings = { ...DEFAULT_CASE_SEARCH_SETTINGS, herb: false };
  const result = searchCaseSamples({ query: "ginger" }, settings);
  assert.ok(result.results.length > 0);
  assert.equal(result.settings.herb, false);
  assert.deepEqual(result.options.herb, []);
});

test("when text misses, selected filters still produce related cases", () => {
  const result = searchCaseSamples({ query: "no-such-topic-xyz", location: "Gondar" });
  assert.ok(result.results.length > 0);
  assert.equal(result.isFallback, true);
  assert.ok(result.results.every((sample) => sample.location === "Gondar"));
  assert.match(result.message, /match your selected filters/i);
});
