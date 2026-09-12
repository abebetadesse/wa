import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/auth.ts";

test("password credentials use salted scrypt hashes", () => {
  const password = "correct horse battery staple";
  const encoded = hashPassword(password);
  assert.match(encoded, /^scrypt:[^:]+:[^:]+$/);
  assert.notEqual(encoded, hashPassword(password));
  assert.equal(verifyPassword(password, encoded), true);
  assert.equal(verifyPassword("wrong password", encoded), false);
});
