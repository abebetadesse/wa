import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, checkAccess, errorResponse } from "../lib/api/route.ts";

const user = (role, permissions = []) => ({ id: "u1", email: "u@example.com", role, permissions });

test("checkAccess: public allows anonymous and passes the user through", () => {
  assert.equal(checkAccess("public", null), null);
  const u = user("user");
  assert.equal(checkAccess("public", u), u);
});

test("checkAccess: user access rejects anonymous with 401", () => {
  assert.throws(() => checkAccess("user", null), (e) => e instanceof ApiError && e.status === 401);
  assert.ok(checkAccess("user", user("user")));
});

test("checkAccess: roles are an exact allow-list", () => {
  const access = { roles: ["admin", "super_admin"] };
  assert.ok(checkAccess(access, user("admin")));
  assert.throws(() => checkAccess(access, user("practitioner")), (e) => e.status === 403);
  assert.throws(() => checkAccess(access, null), (e) => e.status === 401);
});

test("checkAccess: permissions honour the '*' wildcard", () => {
  const access = { permission: "knowledge:publish" };
  assert.ok(checkAccess(access, user("reviewer", ["knowledge:publish"])));
  assert.ok(checkAccess(access, user("super_admin", ["*"])));
  assert.throws(() => checkAccess(access, user("user", ["profile:read"])), (e) => e.status === 403);
});

test("errorResponse maps ApiError, ZodError and unknown errors", async () => {
  const notFound = errorResponse(ApiError.notFound("Case"));
  assert.equal(notFound.status, 404);
  assert.deepEqual(await notFound.json(), { success: false, error: "Case not found." });

  const zod = z.object({ email: z.string().email() }).safeParse({ email: "nope" });
  const invalid = errorResponse(zod.error);
  assert.equal(invalid.status, 400);
  const body = await invalid.json();
  assert.equal(body.fields[0].path, "email");

  const original = console.error;
  console.error = () => {};
  try {
    const crash = errorResponse(new Error("db down"));
    assert.equal(crash.status, 500);
    assert.equal((await crash.json()).error, "Internal server error.", "internal messages must not leak");
  } finally {
    console.error = original;
  }
});

test("NextRequest is constructible in tests (sanity for route-level tests)", () => {
  const req = new NextRequest("http://localhost/api/x?a=1");
  assert.equal(req.nextUrl.searchParams.get("a"), "1");
});
