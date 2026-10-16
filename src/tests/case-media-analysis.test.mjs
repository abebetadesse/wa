import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { analyzeCaseMedia, normalizeCaseMediaAssessment } from "../server/cases/mediaAnalysis.ts";

test("health image analysis sends image content only after vision is configured and requires a professional review", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "case-media-test-"));
  const filePath = path.join(directory, "evidence.jpg");
  await fs.writeFile(filePath, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  let request;
  try {
    const result = await analyzeCaseMedia(
      { filePath, kind: "image", mimeType: "image/jpeg" },
      { domain: "biological", providerRequirements: ["Human review required"], caseNarrative: "A visible skin concern." },
      {
        visionModel: () => "vision-test",
        chat: async (options) => {
          request = options;
          return { parsedJson: { observations: ["A small red area is visible."], limitations: ["Image detail is limited."] } };
        },
      },
    );

    assert.deepEqual(result, {
      observations: ["A small red area is visible."],
      limitations: ["Image detail is limited."],
      needsProfessionalReview: true,
    });
    assert.equal(request.modelOverride, "vision-test");
    assert.equal(request.messages[0].role, "system");
    assert.match(request.messages[0].content, /Do not diagnose/);
    const userContent = request.messages[1].content;
    assert.ok(userContent.some((part) => part.type === "image_url" && part.image_url.url.startsWith("data:image/jpeg;base64,")));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("health media analysis is unavailable unless the provider configured a vision model", async () => {
  await assert.rejects(
    analyzeCaseMedia(
      { filePath: "unused.jpg", kind: "image", mimeType: "image/jpeg" },
      { domain: "biological", providerRequirements: [], caseNarrative: "" },
      { visionModel: () => null },
    ),
    (error) => error.status === 503 && /not enabled by the provider/.test(error.message),
  );
});

test("video analysis uses sampled image frames and removes the temporary frame files", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "case-video-test-"));
  const firstFrame = path.join(directory, "frame-01.jpg");
  const secondFrame = path.join(directory, "frame-02.jpg");
  await Promise.all([
    fs.writeFile(firstFrame, Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
    fs.writeFile(secondFrame, Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
  ]);
  let request;
  const result = await analyzeCaseMedia(
    { filePath: "unused.mp4", kind: "video", mimeType: "video/mp4" },
    { domain: "biological", providerRequirements: [], caseNarrative: "" },
    {
      visionModel: () => "vision-test",
      extractVideoFrames: async () => ({ directory, frames: [firstFrame, secondFrame] }),
      chat: async (options) => {
        request = options;
        return { parsedJson: { observations: ["The visible area changes between sampled frames."], limitations: [] } };
      },
    },
  );

  assert.equal(result.needsProfessionalReview, true);
  assert.equal(request.messages[1].content.filter((part) => part.type === "image_url").length, 2);
  assert.ok(request.messages[1].content.some((part) => part.text?.includes("5 seconds")));
  await assert.rejects(fs.access(directory));
});

test("health media analysis rejects malformed model output rather than returning an empty success", async () => {
  assert.throws(
    () => normalizeCaseMediaAssessment({ observations: [], limitations: [] }),
    (error) => error.status === 502 && /did not return usable observations/.test(error.message),
  );
});
