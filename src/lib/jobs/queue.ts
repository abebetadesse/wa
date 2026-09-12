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

// In-memory job state store (can be backed by Redis in clustered deployments)
const jobStore = new Map<string, JobProgress>();

export function createJob(jobId: string, submissionId: string): JobProgress {
  const initial: JobProgress = {
    jobId,
    submissionId,
    status: "pending",
    progressPct: 5,
    currentStage: "Job enqueued in background evaluation queue...",
    updatedAt: new Date().toISOString(),
  };
  jobStore.set(jobId, initial);
  return initial;
}

export function updateJobProgress(
  jobId: string,
  progressPct: number,
  currentStage: string,
  extra: Partial<JobProgress> = {}
): JobProgress | undefined {
  const existing = jobStore.get(jobId);
  if (!existing) return undefined;

  const updated: JobProgress = {
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
  return jobStore.get(jobId);
}
