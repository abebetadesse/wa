import { test } from "node:test";
import assert from "node:assert/strict";
import { assertSafetyChangeAllowed, systemAction } from "../server/admin/system.ts";
import { newRole, permissionList } from "../server/admin/roles.ts";

const flags = { domainBEnforced: true, safetyGateStrictness: "elevated" };

test("only super admins may relax safety controls", () => {
  const admin = { role: "admin" };
  assert.throws(() => assertSafetyChangeAllowed(admin, flags, { ...flags, domainBEnforced: false }), (e) => e.status === 403);
  assert.throws(() => assertSafetyChangeAllowed(admin, flags, { ...flags, safetyGateStrictness: "standard" }), (e) => e.status === 403);
  assert.doesNotThrow(() => assertSafetyChangeAllowed(admin, flags, { ...flags, safetyGateStrictness: "strict_lock" }));
  assert.doesNotThrow(() => assertSafetyChangeAllowed({ role: "super_admin" }, flags, { ...flags, domainBEnforced: false }));
});

test("system actions are validated per action", () => {
  assert.equal(systemAction.safeParse({ action: "delete_everything" }).success, false);
  assert.equal(systemAction.safeParse({ action: "update_flags", payload: { flags: { sessionTimeoutHours: -1 } } }).success, false);
  const platform = systemAction.parse({ action: "update_platform", payload: { platform: { name: "X", environment: "prod" } } });
  assert.deepEqual(platform.payload.platform, { name: "X" }, "read-only keys are stripped");
  assert.equal(systemAction.safeParse({ action: "trigger_sync", payload: { strands: ["not_a_strand"] } }).success, false);
});

test("role permissions must come from the RBAC catalogue", () => {
  assert.deepEqual(permissionList.parse(["users:view", "users:view", "*"]), ["users:view", "*"]);
  assert.equal(permissionList.safeParse(["users:view", "launch:rockets"]).success, false);
  assert.equal(newRole.parse({ name: "Field Reviewer" }).name, "field_reviewer");
  assert.equal(newRole.safeParse({ name: "drop table;" }).success, false);
});
