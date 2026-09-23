import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_DEPTH_STATE,
  breadcrumbs,
  descend,
  ascend,
  jumpTo,
} from "../lib/hexacore/depthNavigation.ts";

test("Hexacore depth navigation descends and ascends safely", () => {
  const core = descend(INITIAL_DEPTH_STATE, "P");
  const aspect = descend(core, "P1");
  const frequency = descend(aspect, "4");
  const correspondence = descend(frequency, "herb");

  assert.equal(correspondence.depth, 4);
  assert.deepEqual(breadcrumbs(correspondence).map((item) => item.label), ["Orrery", "P", "P1", "Level 4", "herb"]);
  assert.equal(ascend(correspondence).depth, 3);
  assert.equal(jumpTo(correspondence, 1).depth, 1);
  assert.deepEqual(jumpTo(correspondence, 1).path, { core: "P" });
});
