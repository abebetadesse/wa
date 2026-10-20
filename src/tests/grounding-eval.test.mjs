/**
 * Grounding and citation evaluation (fixtures/grounding-eval.json).
 *
 * groundFindings is scored for precision and recall against hand-labelled cases, and the model's
 * citations are checked to contain only the sources the platform grounded. The run fails when a
 * score drops below the baseline recorded in the fixture; raise the baseline when grounding improves.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { detectFactors, groundFindings, buildCaseAnalysis } from "../server/cases/analysis.ts";
import { checkModelCitations, citationFor, citationId, keepGroundedCitations } from "../server/cases/citations.ts";
import { EntityExtractor } from "../lib/knowledge/parsing/entityExtractor.ts";
import { createCase } from "../server/cases/machine.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";
import { aiSectionSources } from "../server/cases/domains/shared.ts";

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "fixtures/grounding-eval.json"), "utf8"));
const extractor = new EntityExtractor();
const NOW = new Date("2026-10-06T08:00:00Z");

const findingsOf = (entry) => entry.candidates.map((candidate) => ({ type: "condition", strand: entry.strand, relevanceScore: 0.98, ...candidate }));
const groundCase = (entry) =>
  groundFindings(entry.strand, findingsOf(entry), detectFactors([{ topic: "Story", text: entry.story, free: true }]), extractor.extract(entry.story), entry.profile ?? {});

/** Every candidate in the fixture as a citation, by id (the first case to offer an entry wins). */
const citationPool = new Map();
for (const entry of fixture.cases) {
  for (const finding of findingsOf(entry)) {
    const citation = citationFor(entry.strand, finding);
    if (!citationPool.has(citation.id)) citationPool.set(citation.id, citation);
  }
}

const ratio = (part, whole) => (whole === 0 ? 1 : part / whole);
const round = (value) => Math.round(value * 1000) / 1000;

test("grounding eval: the set is labelled and large enough to mean something", () => {
  assert.ok(fixture.cases.length >= 20);
  for (const entry of fixture.cases) {
    const names = entry.candidates.map((candidate) => candidate.name);
    for (const name of entry.grounded) assert.ok(names.includes(name), `${entry.id}: ${name} is a candidate`);
    assert.ok(names.length > entry.grounded.length || entry.grounded.length === 0, `${entry.id} has unsupported candidates`);
  }
});

test("grounding eval: precision and recall of groundFindings stay at or above the baseline", () => {
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  const misses = [];
  for (const entry of fixture.cases) {
    const kept = new Set(groundCase(entry).map((finding) => finding.name));
    const expected = new Set(entry.grounded);
    for (const name of kept) {
      if (expected.has(name)) truePositive++;
      else { falsePositive++; misses.push(`${entry.id}: kept unsupported ${name}`); }
    }
    for (const name of expected) {
      if (!kept.has(name)) { falseNegative++; misses.push(`${entry.id}: missed ${name}`); }
    }
  }
  const precision = round(ratio(truePositive, truePositive + falsePositive));
  const recall = round(ratio(truePositive, truePositive + falseNegative));
  console.log(`grounding eval: precision ${precision}, recall ${recall} (baseline ${fixture.baseline.precision} / ${fixture.baseline.recall})`);
  if (misses.length) console.log(`  ${misses.join("\n  ")}`);
  assert.ok(precision >= fixture.baseline.precision, `precision ${precision} fell below the baseline ${fixture.baseline.precision}`);
  assert.ok(recall >= fixture.baseline.recall, `recall ${recall} fell below the baseline ${fixture.baseline.recall}`);
});

test("grounding eval: every kept finding carries a structured citation", () => {
  const anxiety = groundCase(fixture.cases.find((entry) => entry.id === "anxiety-sleep"));
  const gad = anxiety.find((finding) => finding.name === "GENERALIZED ANXIETY DISORDER");
  assert.deepEqual(gad.citation, { id: "psychological:generalized-anxiety-disorder", title: "GENERALIZED ANXIETY DISORDER", source: "WHO mhGAP Intervention Guide 2.0" });

  const fever = groundCase(fixture.cases.find((entry) => entry.id === "fever-night-sweats"));
  const malaria = fever.find((finding) => finding.name === "MALARIA");
  assert.equal(malaria.citation.pmid, "31234567");
  assert.equal(malaria.citation.url, "https://pubmed.ncbi.nlm.nih.gov/31234567/");
  assert.match(malaria.citation.source, /Malaria in Ethiopian lowlands — Malar J — 2019/);

  for (const entry of fixture.cases) {
    for (const finding of groundCase(entry)) {
      assert.equal(finding.citation.id, citationId(entry.strand, finding.name));
      assert.ok(finding.citation.title && finding.citation.source, `${entry.id}: ${finding.name} has a title and source`);
    }
  }
  assert.equal(citationId("cultural", "ቡና"), "cultural:ቡና", "Ethiopic names keep their letters");
});

test("citation eval: a model keeps only grounded sources, and citing anything else discards its section", () => {
  let returned = 0;
  let allowedReturned = 0;
  let expectedKept = 0;
  let kept = 0;
  for (const entry of fixture.citationCases) {
    const allowed = entry.allowed.map((id) => {
      assert.ok(citationPool.has(id), `${entry.id}: ${id} is a fixture citation`);
      return citationPool.get(id);
    });
    const texts = [entry.reply.body, ...entry.reply.items];
    const check = checkModelCitations(texts, entry.reply.citations, allowed, "");
    assert.equal(check.unsupported.length > 0, entry.fallback, `${entry.id}: fallback ${entry.fallback}`);
    if (entry.fallback) continue;
    const ids = check.cited.map((citation) => citation.id);
    assert.deepEqual(ids, entry.cited, entry.id);
    returned += ids.length;
    allowedReturned += ids.filter((id) => entry.allowed.includes(id)).length;
    expectedKept += entry.cited.length;
    kept += ids.filter((id) => entry.cited.includes(id)).length;
    for (const id of check.dropped) assert.ok(!entry.allowed.includes(id), `${entry.id}: only unknown ids are dropped`);
    for (const text of texts) assert.doesNotMatch(check.renumber(text), /\[[a-z_]+:[^\]]+\]/, "markers become numbers");
  }
  const precision = round(ratio(allowedReturned, returned));
  const recall = round(ratio(kept, expectedKept));
  assert.ok(precision >= fixture.baseline.citationPrecision, `citation precision ${precision}`);
  assert.ok(recall >= fixture.baseline.citationRecall, `citation recall ${recall}`);
});

test("citation eval: enhanceReportSection gives the model the allowed ids and validates its reply", async () => {
  const { enhanceReportSection } = await import("../server/cases/sectionEnhancer.ts");
  const config = DOMAIN_CONFIGS.relationship;
  const freeText = config.questions({}).find((question) => !question.options?.length);
  const story = "I feel anxious all the time and I cannot sleep at night.";
  const safe = { feelsSafe: "yes", domesticViolence: "no", childSafety: "no_children", immediateRisk: "no" };
  const record = createCase({ id: "case-eval", userId: "user-1", config, safetyAnswers: safe, answers: { [freeText.id]: story } });
  const analysis = await buildCaseAnalysis(record, config, {}, { now: () => NOW });
  const findings = groundCase(fixture.cases.find((entry) => entry.id === "anxiety-sleep"));
  const withAnalysis = { ...record, analysis: { ...analysis, strands: [{ strand: "psychological", layer: "A", considered: 4, kept: findings.length, findings }] } };
  const section = { id: "reviewer-note-1", title: "About sleep", body: "A note from the reviewer.", locked: false };

  let seen;
  const model = async (request) => {
    seen = request;
    return {
      body: "Worry and sleep feed each other [psychological:generalized-anxiety-disorder].",
      items: ["Regular sleep times help [psychological:insomnia]."],
      citations: ["psychological:insomnia", "psychological:invented-trial"],
    };
  };
  const written = await enhanceReportSection(withAnalysis, { section }, { model, now: () => NOW });
  assert.deepEqual(seen.citations.map((citation) => citation.id), ["psychological:generalized-anxiety-disorder", "psychological:insomnia"]);
  assert.equal(written.source, "model");
  assert.deepEqual(written.section.evidence.citations.map((citation) => citation.id), ["psychological:generalized-anxiety-disorder", "psychological:insomnia"]);
  assert.equal(written.section.body, "Worry and sleep feed each other [1].");
  assert.ok(written.section.items.includes("Regular sleep times help [2]."));
  assert.ok(written.section.evidence.sources.includes("[1] GENERALIZED ANXIETY DISORDER — WHO mhGAP Intervention Guide 2.0"));
  assert.ok(!JSON.stringify(written.section).includes("invented-trial"), "an unknown id is dropped");

  // A section that cites a source it was not given falls back to the case data.
  const invented = await enhanceReportSection(withAnalysis, { section }, {
    model: async () => ({ body: "A 2021 trial showed this (PMID: 33445566).", items: [], citations: [] }),
    now: () => NOW,
  });
  assert.notEqual(invented.source, "model");
  assert.ok(!JSON.stringify(invented.section).includes("33445566"));

  // A cultural section may cite only reflections, and a reflection-only case no evidence at all.
  await enhanceReportSection({ ...withAnalysis, analysis: { ...withAnalysis.analysis, publishScope: "reflection_only" } }, { section }, { model, now: () => NOW });
  assert.deepEqual(seen.citations, []);
  await enhanceReportSection(withAnalysis, { section: { ...section, cultural: true } }, { model, now: () => NOW });
  assert.ok(seen.citations.every((citation) => !citation.id.startsWith("psychological:")));

  // A saved draft keeps only citations the analysis grounded, in the platform's own wording.
  const forged = { ...written.section, evidence: { ...written.section.evidence, citations: [...written.section.evidence.citations.map((citation) => ({ ...citation, title: "Edited" })), { id: "x:fake", title: "Fake", source: "Nowhere" }] } };
  const [saved] = keepGroundedCitations([forged], withAnalysis.analysis);
  assert.deepEqual(saved.evidence.citations, written.section.evidence.citations);
});

test("AI section sources name the inputs the model saw, never the model", () => {
  assert.deepEqual(aiSectionSources({ answers: { a: 1 } }), ["Your answers to the intake questions"]);
  assert.deepEqual(aiSectionSources({ caseNarrative: "story", answers: {} }), ["Your written account of the situation"]);
  assert.ok(!aiSectionSources({ answers: { a: 1 }, category: "family", gematria: { total: 1 } }).some((source) => /bionic|gpt|synthesis/i.test(source)));
});
