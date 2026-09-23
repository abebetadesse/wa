import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  validateEthiopianPhone,
  createAccessToken,
  verifyAccessToken,
} from "../lib/auth.ts";
import {
  DEFAULT_ROLE_PERMISSIONS,
  roleHasPermission,
} from "../lib/db/schema/rbac.ts";

test("Password Hashing & Verification Engine", () => {
  const password = "Ethiowellbeing@2026!";
  const hash = hashPassword(password);

  assert.match(hash, /^scrypt:[a-f0-9]+:[a-f0-9]+$/);
  assert.equal(verifyPassword(password, hash), true);
  assert.equal(verifyPassword("WrongPassword@123", hash), false);
  assert.notEqual(hash, hashPassword(password), "Hashes must use distinct random salts");
});

test("Password Strength Validator", () => {
  // Compliant password
  const valid = validatePasswordStrength("Ethiowellbeing@2026!");
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);

  // Missing special char
  const noSpecial = validatePasswordStrength("Ethiowellbeing2026");
  assert.equal(noSpecial.isValid, false);
  assert.ok(noSpecial.errors.some((e) => e.includes("special character")));

  // Too short
  const tooShort = validatePasswordStrength("Et1!");
  assert.equal(tooShort.isValid, false);
  assert.ok(tooShort.errors.some((e) => e.includes("8 characters")));

  // Missing uppercase
  const noUpper = validatePasswordStrength("ethiowellbeing@2026!");
  assert.equal(noUpper.isValid, false);
  assert.ok(noUpper.errors.some((e) => e.includes("uppercase")));

  // Missing number
  const noNumber = validatePasswordStrength("Ethiowellbeing@Password!");
  assert.equal(noNumber.isValid, false);
  assert.ok(noNumber.errors.some((e) => e.includes("digit")));
});

test("Ethiopian Phone Number Localization", () => {
  // +251 9... format
  const phone1 = validateEthiopianPhone("+251 91 123 4567");
  assert.equal(phone1.isValid, true);
  assert.equal(phone1.formatted, "+251911234567");

  // 09... format
  const phone2 = validateEthiopianPhone("0911234567");
  assert.equal(phone2.isValid, true);
  assert.equal(phone2.formatted, "+251911234567");

  // 07... Safaricom format
  const phone3 = validateEthiopianPhone("0712345678");
  assert.equal(phone3.isValid, true);
  assert.equal(phone3.formatted, "+251712345678");

  // Invalid international or US phone
  const invalid = validateEthiopianPhone("+14155552671");
  assert.equal(invalid.isValid, false);
});

test("RBAC Roles & Permissions Matrix Evaluation", () => {
  const superAdminPerms = DEFAULT_ROLE_PERMISSIONS.super_admin;
  assert.ok(superAdminPerms.includes("*"));
  assert.equal(roleHasPermission(superAdminPerms, "users:delete"), true);
  assert.equal(roleHasPermission(superAdminPerms, "roles:create"), true);
  assert.equal(roleHasPermission(superAdminPerms, "ai:chat"), true);

  const adminPerms = DEFAULT_ROLE_PERMISSIONS.admin;
  assert.equal(roleHasPermission(adminPerms, "users:view"), true);
  assert.equal(roleHasPermission(adminPerms, "users:create"), true);
  assert.equal(roleHasPermission(adminPerms, "content:publish"), true);
  assert.equal(roleHasPermission(adminPerms, "roles:delete"), false); // Super admin only

  const userPerms = DEFAULT_ROLE_PERMISSIONS.user;
  assert.equal(roleHasPermission(userPerms, "cases:create"), true);
  assert.equal(roleHasPermission(userPerms, "profile:view"), true);
  assert.equal(roleHasPermission(userPerms, "users:view"), false);
  assert.equal(roleHasPermission(userPerms, "ai:chat"), false); // Premium only

  const premiumPerms = DEFAULT_ROLE_PERMISSIONS.premium;
  assert.equal(roleHasPermission(premiumPerms, "ai:chat"), true);
  assert.equal(roleHasPermission(premiumPerms, "reports:full"), true);
  assert.equal(roleHasPermission(premiumPerms, "data:export"), true);
  assert.equal(roleHasPermission(premiumPerms, "practitioner:consult"), true);

  const editorPerms = DEFAULT_ROLE_PERMISSIONS.editor;
  assert.equal(roleHasPermission(editorPerms, "content:edit"), true);
  assert.equal(roleHasPermission(editorPerms, "content:submit"), true);
  assert.equal(roleHasPermission(editorPerms, "content:approve"), false); // Reviewer only

  const reviewerPerms = DEFAULT_ROLE_PERMISSIONS.reviewer;
  assert.equal(roleHasPermission(reviewerPerms, "content:review"), true);
  assert.equal(roleHasPermission(reviewerPerms, "content:approve"), true);

  const practitionerPerms = DEFAULT_ROLE_PERMISSIONS.practitioner;
  assert.equal(roleHasPermission(practitionerPerms, "practitioner:profile:manage"), true);
  assert.equal(roleHasPermission(practitionerPerms, "practitioner:consult"), true);

  const analystPerms = DEFAULT_ROLE_PERMISSIONS.analyst;
  assert.equal(roleHasPermission(analystPerms, "analytics:view"), true);
  assert.equal(roleHasPermission(analystPerms, "audit:view"), true);
  assert.equal(roleHasPermission(analystPerms, "cases:create"), true);
  assert.equal(roleHasPermission(analystPerms, "content:edit"), false);
});

test("Access Token Issuance and Verification", () => {
  const userId = "usr-test-1234";
  const role = "admin";
  const permissions = ["users:view", "cases:view"];

  const token = createAccessToken(userId, role, permissions);
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

  const verified = verifyAccessToken(token);
  assert.ok(verified !== null);
  assert.equal(verified?.sub, userId);
  assert.equal(verified?.role, role);
  assert.deepEqual(verified?.permissions, permissions);
  assert.ok(verified && verified.exp > Math.floor(Date.now() / 1000));

  // Invalid signature rejection
  const tampered = token.slice(0, -5) + "abcde";
  assert.equal(verifyAccessToken(tampered), null);
});
