/**
 * The professional-review pipeline's storage: the memory store the tests use, the MySQL store the
 * application uses (skipped when the database is unreachable), encryption of Restricted profile
 * fields, the insert-only event log, and the one-time import of the old .cases_cache files.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";

import { createPipelineRepository } from "../lib/pipeline/repository.ts";
import { createMemoryPipelineStore, dbPipelineStore, fromProfileRow, toProfileRow } from "../lib/pipeline/store.ts";
import { importPipelineCache } from "../lib/pipeline/importCache.ts";

const { db, dbClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}
const skip = () => !available && "database unavailable";

const run = crypto.randomBytes(3).toString("hex");
const at = (minutes) => new Date(Date.UTC(2026, 9, 1, 8, minutes)).toISOString();

const profile = (overrides = {}) => ({
  id: `prof_${run}_${crypto.randomBytes(3).toString("hex")}`,
  userId: `user_${run}`,
  ageBand: "25-40",
  sex: "Female",
  pregnancyStatus: "not_pregnant",
  chronicConditions: ["Type 2 diabetes"],
  currentMeds: [{ name: "Metformin", dosage: "500mg", frequency: "twice daily" }],
  allergies: ["Penicillin"],
  traditionalUse: [{ name: "Kosso", preparation: "infusion" }],
  diet: { primaryStaple: "Teff" },
  substanceUse: { coffeeDailyCups: 3 },
  location: { raw: { source: "manual" }, admin: { region: "Amhara", zone: "North Gondar", woreda: "Debark" }, agroEcological: "highland" },
  culturalContext: "Orthodox fasting",
  consent: { spiritualAnalysisOptIn: false, dataUseAcknowledged: true, requiresProfessionalApprovalAcknowledged: true },
  submittedAt: at(0),
  updatedAt: at(0),
  ...overrides,
});

const caseRecord = (overrides = {}) => ({
  id: `case_${run}_${crypto.randomBytes(3).toString("hex")}`,
  userId: `user_${run}`,
  profileId: "prof_x",
  narrative: "Stomach cramps after taking Kosso with Metformin.",
  symptoms: ["cramps"],
  duration: "3 days",
  selfTreatments: ["Kosso"],
  attachments: [],
  emergencyDetected: false,
  emergencySignals: [],
  status: "PENDING_PROFESSIONAL",
  submittedAt: at(0),
  updatedAt: at(0),
  ...overrides,
});

const report = (caseId, kind, version, overrides = {}) => ({
  id: `rep_${run}_${kind}_${version}_${crypto.randomBytes(2).toString("hex")}`,
  caseId,
  kind,
  version,
  payload: { summary: `${kind} v${version}` },
  confidence: "moderate",
  provenance: [{ source: "test" }],
  createdAt: at(version),
  ...overrides,
});

const analysis = (profileId) => ({
  id: `prelim-${run}`,
  profileId,
  locationSummary: { region: "Amhara", agroEcological: "highland", ecosystem: "Afromontane", narrative: "Highland" },
  cultural: { observedPatterns: ["fasting"], guidance: ["eat legumes"], provenance: [] },
  nutrition: { localStaples: ["Teff"], seasonalGaps: [{ month: "July", gap: "lean" }], micronutrientRisks: [], foodBasedRecommendations: [] },
  ecological: { endemicExposures: [], waterAndSanitation: [], vectorRisks: [] },
  bodyScience: { summary: "ok", relevantSystems: ["digestive"] },
  confidence: "moderate",
  disclaimers: ["Not a diagnosis"],
  generatedAt: at(5),
});

// ─── Memory store ─────────────────────────────────────────────────────────────

test("memory store: profiles, analyses, cases, reports and the safety-gate override", async () => {
  const repo = createPipelineRepository(createMemoryPipelineStore());

  const older = profile({ submittedAt: at(0), updatedAt: at(0) });
  const newer = profile({ submittedAt: at(10), updatedAt: at(10) });
  await repo.saveProfile(newer);
  await repo.saveProfile(older);
  assert.deepEqual(await repo.getProfileById(older.id), older);
  assert.equal((await repo.getProfileByUserId(older.userId)).id, newer.id, "the latest profile of a user wins");
  assert.equal(await repo.getProfileByUserId("nobody"), null);

  await repo.savePreliminaryAnalysis(newer.id, analysis(newer.id));
  assert.deepEqual(await repo.getPreliminaryAnalysisByProfileId(newer.id), analysis(newer.id));

  const mine = caseRecord({ submittedAt: at(1) });
  const assigned = caseRecord({ userId: "someone", assignedProfessionalId: "pro-1", submittedAt: at(2) });
  const otherPro = caseRecord({ userId: "someone", assignedProfessionalId: "pro-2", status: "APPROVED", submittedAt: at(3) });
  for (const record of [mine, assigned, otherPro]) await repo.saveCase(record);
  assert.deepEqual((await repo.listCases()).map((c) => c.id), [otherPro.id, assigned.id, mine.id], "newest submission first");
  assert.deepEqual((await repo.listCases({ userId: mine.userId })).map((c) => c.id), [mine.id]);
  assert.deepEqual((await repo.listCases({ status: "APPROVED" })).map((c) => c.id), [otherPro.id]);
  assert.deepEqual((await repo.listCases({ professionalId: "pro-1" })).map((c) => c.id), [assigned.id, mine.id], "own and unassigned cases");

  const user1 = report(mine.id, "USER", 1, { supersededBy: "next" });
  const user2 = report(mine.id, "USER", 2);
  const pro1 = report(mine.id, "PROFESSIONAL", 1);
  for (const r of [user1, user2, pro1]) await repo.saveReport(r);
  assert.equal((await repo.getLatestUserReport(mine.id)).id, user2.id);
  assert.equal((await repo.getLatestProfessionalReport(mine.id)).id, pro1.id);
  assert.deepEqual((await repo.getReportsByCaseId(mine.id)).map((r) => r.version), [2, 1, 1]);

  assert.equal(await repo.hasSafetyGateOverride(mine.id), false);
  await repo.overrideSafetyGate(mine.id, "admin-1", "Reviewed with the prescribing doctor.");
  assert.equal(await repo.hasSafetyGateOverride(mine.id), true);
  assert.equal((await repo.getCaseById(mine.id)).overrideActorId, "admin-1");
  await assert.rejects(repo.overrideSafetyGate("missing", "admin-1", "x"), /Case not found/);
});

test("memory store hands out copies, so callers cannot change stored records in place", async () => {
  const repo = createPipelineRepository(createMemoryPipelineStore());
  const record = caseRecord();
  await repo.saveCase(record);
  record.status = "PUBLISHED";
  const loaded = await repo.getCaseById(record.id);
  assert.equal(loaded.status, "PENDING_PROFESSIONAL");
  loaded.status = "PUBLISHED";
  assert.equal((await repo.getCaseById(record.id)).status, "PENDING_PROFESSIONAL");
});

// ─── Events ───────────────────────────────────────────────────────────────────

test("events are kept in write order with the user-visible snapshot", async () => {
  const repo = createPipelineRepository(createMemoryPipelineStore());
  const record = caseRecord({ emergencySignals: ["chest pain"], emergencyDetected: true });
  await repo.saveCase(record);
  await repo.saveReport(report(record.id, "USER", 1, { publishedAt: at(30) }));

  const first = await repo.appendEvent({ caseId: record.id, actorId: "u", actorRole: "USER", type: "submitted", after: { status: "SUBMITTED" } });
  await repo.appendEvent({ caseId: record.id, actorId: "p", actorRole: "PROFESSIONAL", type: "approved", note: "fine" });
  await repo.appendEvent({ caseId: "another-case", actorId: "p", actorRole: "PROFESSIONAL", type: "held" });

  const events = await repo.getEvents(record.id);
  assert.deepEqual(events.map((e) => e.type), ["submitted", "approved"]);
  assert.equal(events[0].id, first.id);
  assert.equal(events[0].after.status, "SUBMITTED");
  assert.deepEqual(events[0].after.userVisibleSnapshot, {
    caseStatus: "PENDING_PROFESSIONAL",
    emergencyDetected: true,
    emergencySignals: ["chest pain"],
    userReport: { summary: "USER v1" },
    userReportVersion: 1,
    userReportPublishedAt: at(30),
  });
  assert.equal(events[1].before, null);
  assert.equal(events[1].note, "fine");
});

test("the event log is insert-only and a failed write is an error", async () => {
  const store = createMemoryPipelineStore();
  assert.deepEqual(Object.keys(store).filter((name) => /event/i.test(name)).sort(), ["insertEvent", "listEvents"], "no way to change or delete an event");

  const repo = createPipelineRepository(store);
  const event = await repo.appendEvent({ caseId: "c1", actorId: "a", actorRole: "ADMIN", type: "held" });
  await assert.rejects(store.insertEvent(event), /already exists/);

  const [loaded] = await repo.getEvents("c1");
  loaded.type = "published";
  assert.equal((await repo.getEvents("c1"))[0].type, "held", "the stored event is unchanged");

  const failing = createPipelineRepository({ ...store, insertEvent: async () => { throw new Error("disk full"); } });
  await assert.rejects(failing.appendEvent({ caseId: "c1", actorId: "a", actorRole: "ADMIN", type: "held" }), /disk full/);
});

// ─── Encryption ───────────────────────────────────────────────────────────────

test("medications, allergies and conditions are encrypted in the stored row", () => {
  const record = profile();
  const row = toProfileRow(record, null);
  for (const field of ["currentMeds", "allergies", "chronicConditions"]) {
    assert.equal(row[field].classification, "Restricted");
    assert.ok(row[field].ciphertext && row[field].iv && row[field].tag, `${field} is encrypted`);
  }
  const stored = JSON.stringify(row);
  for (const secret of ["Metformin", "Penicillin", "Type 2 diabetes"]) assert.ok(!stored.includes(secret), `${secret} is not stored in plain text`);
  assert.deepEqual(row.traditionalUse, record.traditionalUse, "other fields are stored as they are");

  const back = fromProfileRow({ ...row, userIdString: row.userIdString });
  assert.deepEqual(back, record);
});

test("a profile whose restricted fields cannot be decrypted is refused rather than passed on", () => {
  const row = toProfileRow(profile(), null);
  const tampered = { ...row, currentMeds: { ...row.currentMeds, ciphertext: "00".repeat(row.currentMeds.ciphertext.length / 2) } };
  const quiet = console.error;
  console.error = () => {};
  try {
    assert.throws(() => fromProfileRow(tampered), /could not be decrypted/);
  } finally {
    console.error = quiet;
  }
});

// ─── Import of the old file storage ───────────────────────────────────────────

test("the .cases_cache import is complete and safe to repeat", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pipeline-cache-"));
  const write = (sub, name, value) => {
    fs.mkdirSync(path.join(dir, sub), { recursive: true });
    fs.writeFileSync(path.join(dir, sub, name), value);
  };
  try {
    const p = profile();
    const { chronicConditions: _dropped, ...oldProfile } = p;
    const c = caseRecord({ profileId: p.id });
    const r = report(c.id, "USER", 1);
    const events = [1, 2].map((n) => ({ id: `evt-${n}`, caseId: c.id, actorId: "a", actorRole: "USER", type: "submitted", at: at(n) }));
    write("pipeline/profiles", `${p.id}.json`, JSON.stringify(oldProfile));
    write("pipeline/analyses", `${p.id}.json`, JSON.stringify(analysis(p.id)));
    write("pipeline/cases", `${c.id}.json`, JSON.stringify(c));
    write("pipeline/cases", "broken.json", "{not json");
    write("pipeline/reports", `${r.id}.json`, JSON.stringify(r));
    write("events", `${c.id}.jsonl`, events.map((e) => JSON.stringify(e)).join("\n") + "\n");
    write("spiritual", "keep.json", "{}");

    const store = createMemoryPipelineStore();
    const lines = [];
    const first = await importPipelineCache({ cacheDir: dir, store, log: (line) => lines.push(line) });
    assert.deepEqual(first.profiles, { imported: 1, skipped: 0, failed: 0 });
    assert.deepEqual(first.analyses, { imported: 1, skipped: 0, failed: 0 });
    assert.deepEqual(first.cases, { imported: 1, skipped: 0, failed: 1 });
    assert.deepEqual(first.reports, { imported: 1, skipped: 0, failed: 0 });
    assert.deepEqual(first.events, { imported: 2, skipped: 0, failed: 0 });
    assert.ok(lines.some((line) => line.includes("broken.json")));

    const repo = createPipelineRepository(store);
    assert.deepEqual((await repo.getProfileById(p.id)).chronicConditions, [], "missing lists are filled in");
    assert.equal((await repo.getPreliminaryAnalysisByProfileId(p.id)).id, analysis(p.id).id);
    assert.deepEqual((await repo.getEvents(c.id)).map((e) => e.id), ["evt-1", "evt-2"]);

    // A record changed since the import is not overwritten by a second run.
    await repo.saveCase({ ...c, status: "APPROVED" });
    const second = await importPipelineCache({ cacheDir: dir, store, log: () => {} });
    for (const kind of ["profiles", "analyses", "reports"]) assert.deepEqual(second[kind], { imported: 0, skipped: 1, failed: 0 });
    assert.deepEqual(second.events, { imported: 0, skipped: 2, failed: 0 });
    assert.equal((await repo.getCaseById(c.id)).status, "APPROVED");
    assert.equal((await repo.getEvents(c.id)).length, 2);
    assert.ok(fs.existsSync(path.join(dir, "spiritual", "keep.json")), "other cache folders are left alone");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ─── MySQL ────────────────────────────────────────────────────────────────────

const created = { profiles: [], cases: [] };

after(async () => {
  if (available) {
    const caseIds = created.cases;
    if (created.profiles.length) {
      await db.delete(schema.pipelinePreliminaryAnalyses).where(inArray(schema.pipelinePreliminaryAnalyses.profileId, created.profiles));
      await db.delete(schema.pipelineProfiles).where(inArray(schema.pipelineProfiles.id, created.profiles));
    }
    if (caseIds.length) {
      // Test clean-up only: the application never deletes events.
      await db.delete(schema.pipelineCaseEvents).where(inArray(schema.pipelineCaseEvents.caseId, caseIds));
      await db.delete(schema.pipelineReports).where(inArray(schema.pipelineReports.caseId, caseIds));
      await db.delete(schema.pipelineCases).where(inArray(schema.pipelineCases.id, caseIds));
    }
  }
  await dbClient.end({ timeout: 2 });
});

test("MySQL store: records round-trip, survive a fresh repository, and stay encrypted at rest", { skip: skip() }, async () => {
  const repo = createPipelineRepository(dbPipelineStore);
  const p = profile();
  created.profiles.push(p.id);
  await repo.saveProfile(p);
  await repo.saveProfile({ ...p, sex: "Male", updatedAt: at(20) });
  assert.deepEqual(await repo.getProfileById(p.id), { ...p, sex: "Male", updatedAt: at(20) });
  assert.equal((await repo.getProfileByUserId(p.userId)).id, p.id);

  const [raw] = await db.select().from(schema.pipelineProfiles).where(eq(schema.pipelineProfiles.id, p.id));
  assert.equal(raw.userId, null, "not linked to an account that does not exist");
  for (const secret of ["Metformin", "Penicillin", "Type 2 diabetes"]) assert.ok(!JSON.stringify(raw).includes(secret), `${secret} is encrypted at rest`);

  await repo.savePreliminaryAnalysis(p.id, analysis(p.id));
  await repo.savePreliminaryAnalysis(p.id, { ...analysis(p.id), confidence: "high" });
  assert.deepEqual(await repo.getPreliminaryAnalysisByProfileId(p.id), { ...analysis(p.id), confidence: "high" });

  const c = caseRecord({ profileId: p.id, emergencyRoutedAt: at(4) });
  created.cases.push(c.id);
  await repo.saveCase(c);
  assert.deepEqual(await repo.getCaseById(c.id), c);
  await repo.overrideSafetyGate(c.id, "admin-1", "Reviewed with the prescribing doctor.");
  assert.equal(await repo.hasSafetyGateOverride(c.id), true);
  assert.ok((await repo.listCases({ userId: c.userId, status: c.status })).some((x) => x.id === c.id));
  assert.ok((await repo.listCases({ professionalId: "pro-anyone" })).some((x) => x.id === c.id), "unassigned cases are offered to professionals");

  const userReport = report(c.id, "USER", 1);
  await repo.saveReport(userReport);
  await repo.saveReport({ ...userReport, approvedBy: "admin-1", approvedAt: at(40) });
  assert.deepEqual(await repo.getLatestUserReport(c.id), { ...userReport, approvedBy: "admin-1", approvedAt: at(40) });

  // A second repository (another process) sees the same data.
  const other = createPipelineRepository(dbPipelineStore);
  const first = await repo.appendEvent({ caseId: c.id, actorId: "u", actorRole: "USER", type: "submitted" });
  await other.appendEvent({ caseId: c.id, actorId: "p", actorRole: "PROFESSIONAL", type: "approved" });
  await repo.appendEvent({ caseId: c.id, actorId: "a", actorRole: "ADMIN", type: "published" });
  const events = await other.getEvents(c.id);
  assert.deepEqual(events.map((e) => e.type), ["submitted", "approved", "published"]);
  assert.equal(events[0].after.userVisibleSnapshot.userReportVersion, 1);
  await assert.rejects(dbPipelineStore.insertEvent(first), "an event id cannot be written twice");
});
