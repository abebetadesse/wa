import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertCanAssignRole,
  assertCanManage,
  assertRoleChangeAllowed,
  assertStatusChangeAllowed,
  csvCell,
  generateTemporaryPassword,
  statusFlags,
} from "../server/admin/userPolicy.ts";
import { validatePasswordStrength } from "../lib/auth.ts";

const admin = { id: "a1", role: "admin" };
const superAdmin = { id: "s1", role: "super_admin" };

test("admins cannot manage administrative accounts; super admins can", () => {
  assert.throws(() => assertCanManage(admin, { id: "s2", role: "super_admin" }), (e) => e.status === 403);
  assert.throws(() => assertCanManage(admin, { id: "a2", role: "admin" }), (e) => e.status === 403);
  assert.doesNotThrow(() => assertCanManage(admin, { id: "u1", role: "user" }));
  assert.doesNotThrow(() => assertCanManage(admin, admin), "admins may manage themselves");
  assert.doesNotThrow(() => assertCanManage(superAdmin, { id: "a2", role: "admin" }));
});

test("only super admins grant administrative roles", () => {
  assert.throws(() => assertCanAssignRole(admin, "admin"), (e) => e.status === 403);
  assert.doesNotThrow(() => assertCanAssignRole(admin, "practitioner"));
  assert.doesNotThrow(() => assertCanAssignRole(superAdmin, "super_admin"));
});

test("self-lockout guards", () => {
  assert.throws(() => assertStatusChangeAllowed(admin, "a1", "suspended"), (e) => e.status === 400);
  assert.doesNotThrow(() => assertStatusChangeAllowed(admin, "a1", "active"));
  assert.throws(() => assertRoleChangeAllowed(superAdmin, "s1", "user"), (e) => e.status === 400);
});

test("status flags", () => {
  assert.deepEqual(statusFlags("active"), { isActive: true, isSuspended: false });
  assert.deepEqual(statusFlags("inactive"), { isActive: false, isSuspended: false });
  assert.deepEqual(statusFlags("suspended"), { isActive: true, isSuspended: true });
});

test("temporary passwords are strong and unique", () => {
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const password = generateTemporaryPassword();
    assert.equal(password.length, 16);
    assert.equal(validatePasswordStrength(password).isValid, true, password);
    seen.add(password);
  }
  assert.equal(seen.size, 200);
});

test("csvCell quotes and neutralises formula injection", () => {
  assert.equal(csvCell(null), "");
  assert.equal(csvCell('Abebe "AB" Tadesse'), '"Abebe ""AB"" Tadesse"');
  assert.equal(csvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)");
  assert.equal(csvCell(true), "true");
  assert.equal(csvCell(new Date("2026-01-02T00:00:00Z")), "2026-01-02T00:00:00.000Z");
});
