import { test } from "node:test";
import assert from "node:assert/strict";
import { HEXACORE_ACTIVITY_GUIDES, hexacoreActivityForService } from "../lib/cultural/hexacoreActivities.ts";

test("Hexacore services resolve to the right activity guide", () => {
  assert.equal(hexacoreActivityForService("tongue-reading")?.title, "Tongue-sign traditions");
  assert.equal(hexacoreActivityForService("palm-reading")?.title, "Palm and hand-line traditions");
  assert.equal(hexacoreActivityForService("hexacore-reading")?.title, "Six-core reflection");
  assert.equal(hexacoreActivityForService("unknown-service"), null);
});

test("photo guidance excludes face uploads and face-based assessment", () => {
  assert.match(hexacoreActivityForService("body-sign-reading").imageGuidance, /Do not upload face photos/);
  assert.match(hexacoreActivityForService("face-reading").imageGuidance, /No face images are accepted/);
  assert.match(hexacoreActivityForService("face-reading").boundaries, /must not be used to infer/);
});

test("every activity guide states its boundaries", () => {
  for (const guide of HEXACORE_ACTIVITY_GUIDES) {
    assert.ok(guide.boundaries.length > 20, `${guide.kind} has user-facing boundaries`);
  }
  assert.match(hexacoreActivityForService("tongue-reading").boundaries, /cannot identify a disease/);
  assert.match(hexacoreActivityForService("palm-reading").boundaries, /do not predict lifespan/);
  assert.match(hexacoreActivityForService("hexacore-reading").boundaries, /symbolic cultural frameworks/);
});
