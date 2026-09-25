import crypto from "crypto";

export interface JobProgress {
  jobId: string;
  submissionId: string;
  status: "pending" | "processing" | "complete" | "failed";
  progressPct: number;
  currentStage: string;
  reportId?: string;
  error?: string;
  updatedAt: string;
}

export interface JobAccess {
  pollingToken: string;
  expiresAt: string;
}

type StoredJob = JobProgress & {
  pollingTokenHash: string;
  pollingTokenExpiresAt: number;
};

// In-memory job state store (can be backed by Redis in clustered deployments)
const jobStore = new Map<string, StoredJob>();

export function createJob(jobId: string, submissionId: string): JobAccess {
  const pollingToken = crypto.randomBytes(32).toString("base64url");
  const pollingTokenExpiresAt = Date.now() + 15 * 60 * 1000;
  const initial: JobProgress = {
    jobId,
    submissionId,
    status: "pending",
    progressPct: 5,
    currentStage: "Job enqueued in background evaluation queue...",
    updatedAt: new Date().toISOString(),
  };
  jobStore.set(jobId, {
    ...initial,
    pollingTokenHash: hashToken(pollingToken),
    pollingTokenExpiresAt,
  });
  return {
    pollingToken,
    expiresAt: new Date(pollingTokenExpiresAt).toISOString(),
  };
}

export function updateJobProgress(
  jobId: string,
  progressPct: number,
  currentStage: string,
  extra: Partial<JobProgress> = {}
): JobProgress | undefined {
  const existing = jobStore.get(jobId);
  if (!existing) return undefined;

  const updated: StoredJob = {
    ...existing,
    progressPct,
    currentStage,
    ...extra,
    updatedAt: new Date().toISOString(),
  };
  jobStore.set(jobId, updated);
  return updated;
}

export function getJob(jobId: string): JobProgress | undefined {
  const job = jobStore.get(jobId);
  if (!job) return undefined;
  const { pollingTokenHash: _hash, pollingTokenExpiresAt: _expiresAt, ...publicJob } = job;
  return publicJob;
}

export function getJobForPolling(jobId: string, pollingToken: string | null): JobProgress | undefined {
  const job = jobStore.get(jobId);
  if (!job || !pollingToken || Date.now() > job.pollingTokenExpiresAt) return undefined;
  const actual = Buffer.from(hashToken(pollingToken));
  const expected = Buffer.from(job.pollingTokenHash);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return undefined;
  const { pollingTokenHash: _hash, pollingTokenExpiresAt: _expiresAt, ...publicJob } = job;
  return publicJob;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
