/**
 * One-time move of the pipeline's old file storage (.cases_cache/pipeline and .cases_cache/events)
 * into a PipelineStore. Records already in the store are left as they are, so running it again
 * adds only what is still missing. The files are never changed or removed.
 */
import fs from "node:fs";
import path from "node:path";
import type { PreliminaryAnalysis } from "../evaluation/profileEvaluator";
import type { PipelineCaseRecord, PipelineProfileRecord, PipelineReportRecord } from "./repository";
import type { PipelineStore } from "./store";
import type { CaseEvent } from "./types";

export interface ImportCounts {
  imported: number;
  skipped: number;
  failed: number;
}

export type ImportSummary = Record<"profiles" | "analyses" | "cases" | "reports" | "events", ImportCounts>;

const list = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

/** Older files may lack the lists added later; the store expects every list to be present. */
function normaliseProfile(record: PipelineProfileRecord): PipelineProfileRecord {
  const now = new Date().toISOString();
  return {
    ...record,
    chronicConditions: list(record.chronicConditions),
    currentMeds: list(record.currentMeds),
    allergies: list(record.allergies),
    traditionalUse: list(record.traditionalUse),
    diet: record.diet ?? {},
    substanceUse: record.substanceUse ?? {},
    consent: record.consent ?? { spiritualAnalysisOptIn: false, dataUseAcknowledged: false, requiresProfessionalApprovalAcknowledged: false },
    submittedAt: record.submittedAt ?? record.updatedAt ?? now,
    updatedAt: record.updatedAt ?? record.submittedAt ?? now,
  };
}

function normaliseCase(record: PipelineCaseRecord): PipelineCaseRecord {
  const now = new Date().toISOString();
  return {
    ...record,
    symptoms: list(record.symptoms),
    selfTreatments: list(record.selfTreatments),
    attachments: list(record.attachments),
    submittedAt: record.submittedAt ?? record.updatedAt ?? now,
    updatedAt: record.updatedAt ?? record.submittedAt ?? now,
  };
}

function jsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => path.join(dir, name));
}

export async function importPipelineCache(options: {
  /** The folder holding pipeline/ and events/, normally <app>/.cases_cache. */
  cacheDir: string;
  store: PipelineStore;
  dryRun?: boolean;
  log?: (line: string) => void;
}): Promise<ImportSummary> {
  const { cacheDir, store, dryRun = false, log = console.log } = options;
  const counts = (): ImportCounts => ({ imported: 0, skipped: 0, failed: 0 });
  const summary: ImportSummary = { profiles: counts(), analyses: counts(), cases: counts(), reports: counts(), events: counts() };

  async function each<T>(kind: keyof ImportSummary, files: string[], exists: (record: T, file: string) => Promise<boolean>, save: (record: T, file: string) => Promise<void>) {
    for (const file of files) {
      try {
        const record = JSON.parse(fs.readFileSync(file, "utf8")) as T;
        if (await exists(record, file)) {
          summary[kind].skipped++;
          continue;
        }
        if (!dryRun) await save(record, file);
        summary[kind].imported++;
      } catch (error) {
        summary[kind].failed++;
        log(`could not import ${path.relative(cacheDir, file)}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  const pipelineDir = path.join(cacheDir, "pipeline");
  await each<PipelineProfileRecord>(
    "profiles",
    jsonFiles(path.join(pipelineDir, "profiles")),
    async (record) => Boolean(await store.getProfile(record.id)),
    (record) => store.saveProfile(normaliseProfile(record)),
  );
  // Analyses are stored under the id of the profile they belong to (the file name).
  const profileIdOf = (file: string) => path.basename(file, ".json");
  await each<PreliminaryAnalysis>(
    "analyses",
    jsonFiles(path.join(pipelineDir, "analyses")),
    async (_record, file) => Boolean(await store.getAnalysis(profileIdOf(file))),
    (record, file) => store.saveAnalysis(profileIdOf(file), record),
  );
  await each<PipelineCaseRecord>(
    "cases",
    jsonFiles(path.join(pipelineDir, "cases")),
    async (record) => Boolean(await store.getCase(record.id)),
    (record) => store.saveCase(normaliseCase(record)),
  );
  await each<PipelineReportRecord>(
    "reports",
    jsonFiles(path.join(pipelineDir, "reports")),
    async (record) => (await store.listReports(record.caseId)).some((report) => report.id === record.id),
    (record) => store.saveReport({ ...record, provenance: list(record.provenance) }),
  );

  // Events: one JSON line per event, in the order they were written.
  const eventsDir = path.join(cacheDir, "events");
  const eventFiles = fs.existsSync(eventsDir) ? fs.readdirSync(eventsDir).filter((name) => name.endsWith(".jsonl")).sort() : [];
  for (const name of eventFiles) {
    const lines = fs.readFileSync(path.join(eventsDir, name), "utf8").split(/\r?\n/).filter((line) => line.trim());
    const known = new Set<string>();
    let loaded = false;
    for (const [index, line] of lines.entries()) {
      try {
        const event = JSON.parse(line) as CaseEvent;
        if (!loaded) {
          for (const existing of await store.listEvents(event.caseId)) known.add(existing.id);
          loaded = true;
        }
        if (known.has(event.id)) {
          summary.events.skipped++;
          continue;
        }
        if (!dryRun) await store.insertEvent({ ...event, before: event.before ?? null, after: event.after ?? null, note: event.note ?? null });
        known.add(event.id);
        summary.events.imported++;
      } catch (error) {
        summary.events.failed++;
        log(`could not import events/${name} line ${index + 1}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  return summary;
}
