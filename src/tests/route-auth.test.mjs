/**
 * Who a request is from must come from a signed sign-in token, never from headers or cookies the
 * client can set, and every API route the middleware lets through without sign-in must either
 * check the caller itself or be a reviewed, intentionally public route.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { createAccessToken } from "../lib/auth.ts";
import { getPipelineSession } from "../lib/pipeline/auth.ts";

const SRC = path.resolve(import.meta.dirname, "..");

function request(url, init = {}) {
  return new NextRequest(`http://localhost${url}`, init);
}

// ─── Pipeline identity ───────────────────────────────────────────────────────

test("pipeline auth ignores client-supplied identity headers", async () => {
  const forged = request("/api/cases", {
    headers: { "x-actor-id": "admin-board", "x-actor-role": "ADMIN", "x-user-id": "u1", "x-user-role": "ADMIN" },
  });
  assert.equal(await getPipelineSession(forged), null);
});

test("pipeline auth ignores the old development role cookies", async () => {
  const forged = request("/api/cases", { headers: { cookie: "pipeline_user_id=admin-board; pipeline_user_role=ADMIN" } });
  assert.equal(await getPipelineSession(forged), null);
});

test("pipeline auth rejects a tampered token", async () => {
  const token = createAccessToken("user-1", "user");
  const [payload, signature] = token.split(".");
  const escalated = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url").toString()), role: "admin" })).toString("base64url");
  const req = request("/api/cases", { headers: { Authorization: `Bearer ${escalated}.${signature}` } });
  assert.equal(await getPipelineSession(req), null);
});

test("pipeline auth accepts a signed token from the bearer header or the sign-in cookie", async () => {
  const viaBearer = request("/api/cases", { headers: { Authorization: `Bearer ${createAccessToken("pro-1", "practitioner")}` } });
  assert.deepEqual(await getPipelineSession(viaBearer), { userId: "pro-1", role: "PROFESSIONAL" });

  const viaCookie = request("/api/cases", { headers: { cookie: `theme=dark; ethio_access=${createAccessToken("admin-1", "super_admin")}` } });
  assert.deepEqual(await getPipelineSession(viaCookie), { userId: "admin-1", role: "ADMIN" });
});

test("pipeline auth treats a malformed cookie as signed out instead of failing", async () => {
  const req = request("/api/cases", { headers: { cookie: "ethio_access=%E0%A4%A" } });
  assert.equal(await getPipelineSession(req), null);
});

test("forged admin headers cannot publish, override the safety gate or read professional reports", async () => {
  const forged = { "Content-Type": "application/json", "x-actor-id": "admin-board", "x-actor-role": "ADMIN" };
  const checklist = { qualityChecklist: { safetyReviewed: true, consentReviewed: true, languageReviewed: true, evidenceReviewed: true } };
  const params = { params: Promise.resolve({ caseId: "any-case" }) };

  const { POST: publish } = await import("../app/api/cases/[caseId]/publish/route.ts");
  const published = await publish(request("/api/cases/any-case/publish", { method: "POST", headers: forged, body: JSON.stringify(checklist) }), params);
  assert.equal(published.status, 401);

  const { POST: override } = await import("../app/api/cases/[caseId]/override-gate/route.ts");
  const overridden = await override(request("/api/cases/any-case/override-gate", { method: "POST", headers: forged, body: JSON.stringify({ justification: "x".repeat(80) }) }), params);
  assert.equal(overridden.status, 401);

  const { GET: proReport } = await import("../app/api/cases/[caseId]/report/pro/route.ts");
  const report = await proReport(request("/api/cases/any-case/report/pro", { headers: forged }), params);
  assert.equal(report.status, 401);
});

test("no page or library code sends or reads forged identity headers", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "tests") walk(full);
      } else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) {
        if (/x-actor-(id|role)|x-user-role|pipeline_user_role/.test(fs.readFileSync(full, "utf8"))) offenders.push(path.relative(SRC, full));
      }
    }
  };
  walk(SRC);
  assert.deepEqual(offenders, []);
});

// ─── Personal data needs the owner ───────────────────────────────────────────

test("diagnostic history never lists other people's sessions to a guest", async () => {
  const { GET } = await import("../app/api/diagnostic/history/route.ts");
  const res = await GET(request("/api/diagnostic/history?limit=50&userId=someone-else"), { params: Promise.resolve({}) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true, data: [] });
});

test("intake submission requires sign-in and cannot target another account by email", async () => {
  const { POST } = await import("../app/api/intake/route.ts");
  const res = await POST(request("/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "victim@example.com", medications: ["Warfarin"] }),
  }));
  assert.equal(res.status, 401);
});

test("guest case sessions are loaded only when they belong to no account", () => {
  const source = fs.readFileSync(path.join(SRC, "lib/case-workflow/repository.ts"), "utf8");
  const loader = source.slice(source.indexOf("export async function loadGuestCaseSession"));
  assert.match(loader.slice(0, loader.indexOf("\n}\n")), /isNull\(caseSessions\.userId\)/);
});

test("wellbeing report page checks that the viewer owns the report", () => {
  const source = fs.readFileSync(path.join(SRC, "app/report/[id]/page.tsx"), "utf8");
  assert.match(source, /getAuthenticatedUser\(\)/);
  assert.match(source, /report\.userId !== viewer\.id/);
});

// ─── Middleware-public routes ────────────────────────────────────────────────

/**
 * Routes under a middleware-public prefix that run without checking the caller, each reviewed:
 * they return reference data or compute from the request body alone, and store nothing personal.
 * Adding a route here is a security decision; prefer defineRoute({ access }) instead.
 */
const REVIEWED_PUBLIC_ROUTES = {
  "/api/atlas": "reference data",
  "/api/auth/me/password": "re-exports changePasswordRoute, which requires sign-in",
  "/api/auth/password/change": "re-exports changePasswordRoute, which requires sign-in",
  "/api/case/spiritual/calculate-gematria": "stateless calculation",
  "/api/case/spiritual/follow-ups": "question bank",
  "/api/diagnostic/assist": "stateless writing hints for the request text",
  "/api/diagnostic/suggestions": "stateless suggestions",
  "/api/experts/[expertId]/availability": "public availability",
  "/api/health": "uptime probe",
  "/api/locations": "reference data",
  "/api/locations/[locationId]": "reference data",
  "/api/locations/ethiopia": "reference data",
  "/api/locations/ethiopia/[locationId]": "reference data",
  "/api/locations/ethiopia/[locationId]/dense": "reference data",
  "/api/locations/export": "reference data",
  "/api/nutrition/overview": "reference data",
  "/api/payments/chapa/callback": "each payment is re-verified with Chapa",
  "/api/payments/chapa/webhook": "signed by Chapa and re-verified",
  "/api/platform/trust": "public trust statement",
  "/api/profile/astrology": "stateless calculation",
  "/api/profile/generate": "stateless calculation",
  "/api/profile/naming": "stateless calculation",
  "/api/profile/numerology": "stateless calculation",
  "/api/profile/suggest-name": "stateless calculation",
  "/api/safety-check": "stateless safety check of the request body",
  "/api/telegram/webhook": "verified with the Telegram webhook secret",
  "/api/whatsapp/webhook": "verified with Meta's request signature",
};

const CHECKS_CALLER = /defineRoute\(|getAuthenticatedUser|requireAuthenticatedUser|requireAnyRole|requirePermission|enforcePipelineAuth|getPipelineSession/;

function middlewarePublicPrefixes() {
  const source = fs.readFileSync(path.join(SRC, "middleware.ts"), "utf8");
  const start = source.indexOf("const PUBLIC_API_PATHS");
  const block = source.slice(start, source.indexOf("];", start));
  return [...block.matchAll(/^\s*"([^"]+)",/gm)].map((match) => match[1]);
}

function apiRoutes(dir = path.join(SRC, "app/api")) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return apiRoutes(full);
    return entry.name === "route.ts" ? [full] : [];
  });
}

test("every middleware-public API route checks the caller or is a reviewed public route", () => {
  const prefixes = middlewarePublicPrefixes();
  assert.ok(prefixes.includes("/api/health") && prefixes.length > 10, "could not read PUBLIC_API_PATHS from middleware.ts");

  const unchecked = [];
  for (const file of apiRoutes()) {
    const url = `/${path.relative(path.join(SRC, "app"), path.dirname(file)).split(path.sep).join("/")}`;
    if (!prefixes.some((prefix) => url === prefix || url.startsWith(prefix) || `${url}/`.startsWith(prefix))) continue;
    if (CHECKS_CALLER.test(fs.readFileSync(file, "utf8"))) continue;
    if (!(url in REVIEWED_PUBLIC_ROUTES)) unchecked.push(url);
  }
  assert.deepEqual(unchecked, [], "these routes are reachable without sign-in and never check the caller");
});

test("the reviewed public list has no stale entries", () => {
  const existing = new Set(apiRoutes().map((file) => `/${path.relative(path.join(SRC, "app"), path.dirname(file)).split(path.sep).join("/")}`));
  assert.deepEqual(Object.keys(REVIEWED_PUBLIC_ROUTES).filter((url) => !existing.has(url)), []);
});

test("pipeline review pages are not public", () => {
  const source = fs.readFileSync(path.join(SRC, "middleware.ts"), "utf8");
  const start = source.indexOf("const PUBLIC_PAGE_PATHS");
  const pages = source.slice(start, source.indexOf("];", start));
  for (const page of ["/admin/cases", "/professional/cases", "/pipeline"]) {
    assert.ok(!pages.includes(`"${page}"`), `${page} must require sign-in`);
  }
});
