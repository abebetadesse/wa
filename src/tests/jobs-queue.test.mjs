import test from "node:test";
import assert from "node:assert/strict";
import { createJob, getJob, getJobForPolling, updateJobProgress } from "../lib/jobs/queue.ts";

test("job polling requires the short-lived job token", () => {
  const jobId = `job-${Date.now()}-${Math.random()}`;
  const access = createJob(jobId, "submission-1");

  assert.equal(getJobForPolling(jobId, null), undefined);
  assert.equal(getJobForPolling(jobId, "wrong-token"), undefined);
  assert.equal(getJob(jobId)?.jobId, jobId);

  const initial = getJobForPolling(jobId, access.pollingToken);
  assert.equal(initial?.submissionId, "submission-1");

  updateJobProgress(jobId, 100, "Complete", { status: "complete" });
  assert.equal(getJobForPolling(jobId, access.pollingToken)?.status, "complete");
});
