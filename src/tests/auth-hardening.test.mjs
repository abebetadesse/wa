import { test } from "node:test";
import assert from "node:assert/strict";
import { consumeRateLimit, resetRateLimits, clientIp } from "../lib/api/rateLimit.ts";
import { createOtpCode, createSecretToken, deliverCode, digest, exposeCodesToClient } from "../server/auth/codes.ts";
import { assertMinimumAge } from "../server/auth/accounts.ts";
import { registerBody, resetBody, verifyBody, changePasswordBody } from "../server/auth/schemas.ts";

async function withEnv(vars, fn) {
  const saved = Object.fromEntries(Object.keys(vars).map((key) => [key, process.env[key]]));
  Object.assign(process.env, vars);
  for (const [key, value] of Object.entries(vars)) if (value === undefined) delete process.env[key];
  const originalInfo = console.info;
  const originalWarn = console.warn;
  console.info = console.warn = () => {};
  try {
    return await fn();
  } finally {
    console.info = originalInfo;
    console.warn = originalWarn;
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("rate limiter blocks after the limit and resets after the window", () => {
  resetRateLimits();
  const now = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(consumeRateLimit("k", 3, 60_000, now).allowed, true);
  const blocked = consumeRateLimit("k", 3, 60_000, now + 1);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 60);
  assert.equal(consumeRateLimit("other", 3, 60_000, now).allowed, true, "keys are independent");
  assert.equal(consumeRateLimit("k", 3, 60_000, now + 60_001).allowed, true);
});

test("clientIp prefers the first forwarded address", () => {
  assert.equal(clientIp(new Headers({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" })), "10.0.0.1");
  assert.equal(clientIp(new Headers()), "unknown");
});

test("codes are random, well-formed and stored only as digests", () => {
  const code = createOtpCode();
  assert.match(code, /^\d{6}$/);
  assert.match(createSecretToken(), /^[a-f0-9]{64}$/);
  assert.notEqual(createSecretToken(), createSecretToken());
  assert.equal(digest("abc"), digest("abc"));
  assert.notEqual(digest("abc"), "abc");
});

test("codes are never exposed to clients in production", async () => {
  await withEnv({ NODE_ENV: "production", AUTH_DEV_CODES: "true" }, async () => {
    assert.equal(exposeCodesToClient(), false);
    assert.deepEqual(await deliverCode({ to: "a@b.c", purpose: "password_reset", token: "t" }), {});
  });
  await withEnv({ NODE_ENV: "development", AUTH_DEV_CODES: undefined }, async () => {
    assert.equal(exposeCodesToClient(), false, "requires explicit opt-in even in development");
  });
  await withEnv({ NODE_ENV: "development", AUTH_DEV_CODES: "true" }, async () => {
    assert.deepEqual(await deliverCode({ to: "a@b.c", purpose: "email_verification", token: "t", code: "123456" }), {
      demoVerificationToken: "t",
      demoOtpCode: "123456",
    });
  });
});

test("minimum age is enforced", () => {
  const now = new Date("2026-09-23T00:00:00Z");
  assert.throws(() => assertMinimumAge("2020-01-01", now), (e) => e.status === 400);
  assert.throws(() => assertMinimumAge("not-a-date", now), (e) => e.status === 400);
  assert.doesNotThrow(() => assertMinimumAge("2000-01-01", now));
  assert.doesNotThrow(() => assertMinimumAge(undefined, now));
});

test("request schemas keep the legacy field names working", () => {
  const registration = registerBody.parse({
    email: " Abebe@Example.com ",
    password: "Str0ng!Pass",
    fullName: "Abebe",
    preferredLanguage: "xx",
    acceptTerms: true,
    acceptPrivacy: true,
  });
  assert.equal(registration.email, "abebe@example.com");
  assert.equal(registration.name, "Abebe");
  assert.equal(registration.preferredLanguage, "en");
  assert.equal(registration.consentSpiritual, false, "cultural profile calculations require explicit opt-in");
  assert.equal("acceptTerms" in registration, false);

  const profileRegistration = registerBody.parse({
    email: "profile@example.com",
    password: "Str0ng!Pass",
    fullName: "Tigist",
    dateOfBirth: "1990-03-15",
    birthTime: "06:30",
    birthLocation: "Gondar",
    motherName: "Mariam",
    consentSpiritual: true,
    acceptTerms: true,
    acceptPrivacy: true,
  });
  assert.equal(profileRegistration.dateOfBirth, "1990-03-15");
  assert.equal(profileRegistration.birthTime, "06:30");
  assert.equal(profileRegistration.birthLocation, "Gondar");
  assert.equal(profileRegistration.consentSpiritual, true);

  assert.equal(registerBody.safeParse({ email: "a@b.co", password: "x", acceptTerms: false, acceptPrivacy: true }).success, false);
  assert.equal(registerBody.safeParse({ email: "a@b.co", password: "x", confirmPassword: "y", acceptTerms: true, acceptPrivacy: true }).success, false);

  assert.equal(verifyBody.parse({ otpCode: "123456" }).code, "123456");
  assert.equal(resetBody.parse({ token: "t", newPassword: "p" }).password, "p");
  assert.equal(resetBody.parse({ token: "t", newPassword: "p" }).token, "t");
  assert.equal(changePasswordBody.safeParse({ currentPassword: "a", newPassword: "b", confirmPassword: "c" }).success, false);
});
