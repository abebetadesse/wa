/**
 * Payments, admin payment controls, client-reported booking payments and registration settings,
 * against the real MySQL database. Chapa is replaced by a local fake API server.
 * Skipped automatically when the database is unreachable. Everything it creates is removed.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import http from "node:http";
import { eq, inArray } from "drizzle-orm";

const { db, dbClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
const settings = await import("../server/settings/index.ts");
const payments = await import("../server/payments/index.ts");
const caseSvc = await import("../server/cases/service.ts");
const { DOMAIN_CONFIGS } = await import("../server/cases/domains/index.ts");
const businessesSvc = await import("../server/marketplace/businesses.ts");
const catalogue = await import("../server/marketplace/catalogue.ts");
const bookingsSvc = await import("../server/marketplace/bookings.ts");
const operations = await import("../server/marketplace/operations.ts");
const notifications = await import("../server/marketplace/notifications.ts");
const accounts = await import("../server/auth/accounts.ts");
const { addDays, todayIn } = await import("../server/marketplace/time.ts");

let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}
const skip = () => !available && "database unavailable";

const run = crypto.randomBytes(4).toString("hex");
const person = (role = "user") => ({ id: crypto.randomUUID(), email: `pay-${run}-${crypto.randomBytes(3).toString("hex")}@example.test`, name: `Pay ${role} ${run}`, role, permissions: [] });
const client = person();
const owner = person();
const admin = { ...person("admin"), role: "admin" };
const expert = { ...person("expert"), role: "expert" };
const createdBusinesses = [];
let savedSettings = [];

// ── Fake Chapa API ───────────────────────────────────────────────────────────
const chapa = { initialized: new Map(), paid: new Map() };
const server = http.createServer(async (req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (req.headers.authorization !== "Bearer CHASECK_TEST-fake") return send(401, { status: "failed", message: "Invalid API Key" });
  if (req.method === "POST" && req.url === "/v1/transaction/initialize") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw);
    chapa.initialized.set(body.tx_ref, body);
    return send(200, { status: "success", message: "Hosted Link", data: { checkout_url: `https://checkout.chapa.test/${body.tx_ref}` } });
  }
  const verify = req.url?.match(/^\/v1\/transaction\/verify\/(.+)$/);
  if (req.method === "GET" && verify) {
    const ref = decodeURIComponent(verify[1]);
    if (!chapa.paid.has(ref)) return send(400, { status: "failed", message: "Payment not paid yet", data: null });
    return send(200, { status: "success", data: { status: "success", amount: chapa.paid.get(ref), currency: "ETB", tx_ref: ref, reference: `CHP-${ref.slice(-6)}` } });
  }
  send(404, { status: "failed", message: "not found" });
});

const paymentSettings = (patch = {}) => ({
  freeMode: false,
  methods: {
    chapa: { enabled: true },
    telebirr: { enabled: true, channel: "manual", accountName: "Platform Ltd", phone: "0911000000" },
    bank_transfer: { enabled: true, accounts: [{ bank: "Commercial Bank of Ethiopia", accountName: "Platform Ltd", accountNumber: "1000123456789" }] },
  },
  prices: { career: { reportEtb: 120, consultationEtb: 300 } },
  bookingPayments: { clientSubmissions: true },
  instructions: "",
  ...patch,
});

before(async () => {
  if (!available) return;
  savedSettings = await db.select().from(schema.platformSettings);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  process.env.CHAPA_API_URL = `http://127.0.0.1:${server.address().port}/v1`;
  process.env.CHAPA_SECRET_KEY = "CHASECK_TEST-fake";
  for (const user of [client, owner, admin, expert]) {
    await db.insert(schema.users).values({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      practitionerCredentials: user.role === "expert" ? { verifiedAt: "2026-01-01", domains: ["career"] } : null,
    });
  }
  await settings.updateSettings("payments", paymentSettings(), admin.id);
  await settings.updateSettings("registration", { open: true, telegram: "optional" }, admin.id);
  await settings.updateSettings("caseRouting", { domains: { career: "expert" } }, admin.id);
});

after(async () => {
  if (!available) return;
  delete process.env.CHAPA_API_URL;
  delete process.env.CHAPA_SECRET_KEY;
  server.close();
  const ids = [client.id, owner.id, admin.id, expert.id];
  await db.delete(schema.platformSettings);
  if (savedSettings.length) await db.insert(schema.platformSettings).values(savedSettings.map((row) => ({ ...row, updatedBy: null })));
  settings.clearSettingsCache();
  await db.delete(schema.platformPayments).where(inArray(schema.platformPayments.userId, ids));
  if (createdBusinesses.length) {
    await db.delete(schema.payments).where(inArray(schema.payments.businessId, createdBusinesses));
    await db.delete(schema.bookings).where(inArray(schema.bookings.businessId, createdBusinesses));
    await db.delete(schema.businesses).where(inArray(schema.businesses.id, createdBusinesses));
  }
  await db.delete(schema.workflowCases).where(inArray(schema.workflowCases.userId, ids));
  await db.delete(schema.notifications).where(inArray(schema.notifications.userId, ids));
  await db.delete(schema.realtimeEvents).where(inArray(schema.realtimeEvents.channel, [...ids.map((id) => `user:${id}`), ...createdBusinesses.map((id) => `business:${id}`)]));
  await db.delete(schema.users).where(inArray(schema.users.id, ids));
  await dbClient.end({ timeout: 2 });
});

const svc = () => caseSvc.caseService;
const careerSafe = { basic_needs: "yes_comfortable", self_harm: "no", financial_pressure: "no" };

async function approvedCase() {
  let view = await svc().start(client, "career", { safetyAnswers: careerSafe, answers: {} });
  for (let round = 0; round < 3 && view.stage === "intake"; round++) {
    view = await svc().answer(client, view.id, Object.fromEntries(view.questions.filter((q) => q.required).map((q) => [q.id, q.options?.[0]?.value ?? "Answer"])));
  }
  view = await svc().submit(client, view.id);
  await svc().claim(expert, view.id);
  await svc().approve(expert, view.id, { checklist: Object.fromEntries(DOMAIN_CONFIGS.career.reviewChecklist.map((item) => [item.id, true])) });
  return svc().get(client, view.id);
}

test("settings are validated, and payment options only list what is really usable", { skip: skip() }, async () => {
  await assert.rejects(settings.updateSettings("payments", paymentSettings({ methods: { ...paymentSettings().methods, bank_transfer: { enabled: true, accounts: [{ bank: "CBE", accountName: "X Y", accountNumber: "abc" }] } } }), admin.id));
  const { options, freeMode } = await payments.paymentOptions();
  assert.equal(freeMode, false);
  assert.deepEqual(options.map((o) => `${o.id}:${o.kind}`).sort(), ["bank_transfer:manual", "chapa:online", "telebirr:manual"]);
  const view = await approvedCase();
  assert.equal(view.pricing.reportEtb, 120, "the administrator's price applies");
});

test("bank transfer: the client submits a reference, an administrator rejects or confirms it", { skip: skip() }, async () => {
  const view = await approvedCase();
  const waiting = await svc().submitManualPayment(client, view.id, { method: "bank_transfer", reference: `ft ${run} 01` });
  assert.equal(waiting.stage, "visible_to_user");
  assert.equal(waiting.paymentAttempt.status, "awaiting_review");
  assert.equal(waiting.paymentAttempt.reference, `FT${run.toUpperCase()}01`, "references are normalised");
  await assert.rejects(svc().submitManualPayment(client, view.id, { method: "bank_transfer", reference: "FT999999" }), (e) => e.status === 409, "one pending proof at a time");
  assert.ok((await notifications.listNotifications(admin.id)).items.some((n) => n.type === "payment.review"), "administrators are asked to review");

  const [row] = await db.select().from(schema.platformPayments).where(eq(schema.platformPayments.subjectId, view.id));
  await assert.rejects(payments.reviewManualPayment(admin, row.id, { decision: "rejected" }), (e) => e.status === 400, "a rejection needs a reason");
  await payments.reviewManualPayment(admin, row.id, { decision: "rejected", note: "No transfer with this reference on our statement." });
  const rejected = await svc().get(client, view.id);
  assert.equal(rejected.stage, "visible_to_user");
  assert.equal(rejected.paymentAttempt.status, "rejected");
  assert.match(rejected.paymentAttempt.reviewNote, /statement/);
  assert.ok((await notifications.listNotifications(client.id)).items.some((n) => n.type === "payment.rejected"));

  await svc().submitManualPayment(client, view.id, { method: "telebirr", reference: `TB${run}02` });
  const [second] = await db.select().from(schema.platformPayments).where(eq(schema.platformPayments.providerReference, `TB${run.toUpperCase()}02`));
  await payments.reviewManualPayment(admin, second.id, { decision: "paid" });
  const paid = await svc().get(client, view.id);
  assert.equal(paid.stage, "full_report_released");
  assert.equal(paid.report.unlocked, true);
  assert.equal(paid.payment.method, "telebirr");
  await assert.rejects(payments.reviewManualPayment(admin, second.id, { decision: "paid" }), (e) => e.status === 409, "reviewed once");
  assert.ok((await notifications.listNotifications(client.id)).items.some((n) => n.type === "case.released"));

  const ledger = await payments.listPlatformPayments({ status: "all", limit: 200 });
  assert.ok(ledger.totals.paidEtb >= 120);
});

test("Chapa: only Chapa's verify API can mark a checkout paid; retries and underpayments are safe", { skip: skip() }, async () => {
  const view = await approvedCase();
  const checkout = await svc().purchase(client, view.id, "chapa", "http://localhost:5500");
  assert.equal(checkout.released, false);
  assert.match(checkout.checkoutUrl, /^https:\/\/checkout\.chapa\.test\//);
  const sent = chapa.initialized.get(checkout.purchaseId);
  assert.equal(sent.amount, "120.00");
  assert.equal(sent.currency, "ETB");
  assert.match(sent.return_url, new RegExp(`/case/workflows/${view.id}\\?payment=`));
  assert.ok(sent.customization.title.length <= 16);

  await assert.rejects(svc().confirmPurchase(client, view.id, checkout.purchaseId), (e) => e.status === 402, "not paid yet");
  await assert.rejects(svc().confirmPurchase(owner, view.id, checkout.purchaseId), (e) => e.status === 404, "not someone else's case");

  chapa.paid.set(checkout.purchaseId, 120);
  const viaWebhook = await payments.verifyOnlinePayment(checkout.purchaseId);
  assert.equal(viaWebhook.status, "paid");
  const released = await svc().get(client, view.id);
  assert.equal(released.stage, "full_report_released");
  const returned = await svc().confirmPurchase(client, view.id, checkout.purchaseId);
  assert.equal(returned.stage, "full_report_released", "the return page after the webhook is harmless");

  const cheap = await approvedCase();
  const attempt = await svc().purchase(client, cheap.id, "chapa", "http://localhost:5500");
  chapa.paid.set(attempt.purchaseId, 1);
  const flagged = await payments.verifyOnlinePayment(attempt.purchaseId);
  assert.equal(flagged.status, "needs_attention", "less than the price is never accepted");
  assert.equal((await svc().get(client, cheap.id)).stage, "visible_to_user");
});

test("free mode: approval releases reports and nothing is charged", { skip: skip() }, async () => {
  await settings.updateSettings("payments", paymentSettings({ freeMode: true }), admin.id);
  try {
    const view = await approvedCase();
    assert.equal(view.stage, "full_report_released");
    assert.equal(view.payment.method, "free");
    assert.equal(view.pricing.reportEtb, 0);
    assert.equal((await payments.paymentOptions()).freeMode, true);
  } finally {
    await settings.updateSettings("payments", paymentSettings(), admin.id);
  }
});

test("a checkout paid after the report was unlocked for free is flagged for a refund, not lost", { skip: skip() }, async () => {
  const view = await approvedCase();
  const checkout = await svc().purchase(client, view.id, "chapa", "http://localhost:5500");
  await settings.updateSettings("payments", paymentSettings({ freeMode: true }), admin.id);
  try {
    const unlocked = await svc().purchase(client, view.id, "chapa");
    assert.equal(unlocked.released, true);
  } finally {
    await settings.updateSettings("payments", paymentSettings(), admin.id);
  }
  chapa.paid.set(checkout.purchaseId, 120);
  const late = await payments.verifyOnlinePayment(checkout.purchaseId);
  assert.equal(late.status, "paid", "the money is recorded as received");
  const [row] = await db.select().from(schema.platformPayments).where(eq(schema.platformPayments.txRef, checkout.purchaseId));
  assert.equal(row.status, "needs_attention", "and flagged for a refund");
  assert.match(row.reviewNote, /Refund/);
  await payments.verifyOnlinePayment(checkout.purchaseId);
});

test("booking payments: clients report telebirr / bank payments and the business confirms them", { skip: skip() }, async () => {
  const [category] = await catalogue.listCategories();
  const business = await businessesSvc.createBusiness(owner, { categoryId: category.id, name: `Pay Herbal ${run}`, languages: ["am"], deliveryModes: ["in_person"] });
  createdBusinesses.push(business.id);
  const kind = (await catalogue.listServiceKinds()).find((k) => !k.requiresSafetyScreen && !k.caseDomain);
  const service = await catalogue.saveService(owner, business.id, null, { kindId: kind.id, name: "Coffee ceremony", durationMinutes: 60, priceEtb: 500, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 0 });
  await businessesSvc.submitForVerification(owner, business.id, { credentials: [{ label: "Kebele registration" }] });
  assert.ok((await notifications.listNotifications(admin.id)).items.some((n) => n.type === "business.verification"), "administrators hear about new applications");
  await businessesSvc.decideVerification(admin, business.id, "verified");
  await catalogue.replaceHours(owner, business.id, { memberId: null, rules: Array.from({ length: 7 }, (_, weekday) => ({ weekday, startMinute: 8 * 60, endMinute: 12 * 60 })) });
  const date = addDays(todayIn("Africa/Addis_Ababa"), 2);
  const { slots } = await catalogue.availableSlots(business.id, { serviceId: service.id, date });
  const booking = await bookingsSvc.requestBooking(client, business.id, { serviceId: service.id, startsAt: new Date(slots[0]), deliveryMode: "in_person" });

  let info = await operations.bookingPaymentsForClient(client, booking.id);
  assert.equal(info.canSubmit, false, "nothing to pay into until the business adds its accounts");
  assert.throws(() => businessesSvc.paymentAccountsInput.parse({ telebirr: { name: "Owner", phone: "12" } }), /telebirr number/);
  await businessesSvc.updatePaymentAccounts(owner, business.id, businessesSvc.paymentAccountsInput.parse({ telebirr: { name: "Pay Herbal", phone: "0911223344" }, banks: [{ bank: "Awash Bank", accountName: "Pay Herbal", accountNumber: "01320000000100" }] }));
  info = await operations.bookingPaymentsForClient(client, booking.id);
  assert.equal(info.canSubmit, true);
  assert.equal(info.balanceEtb, 500);
  await assert.rejects(operations.bookingPaymentsForClient(owner, booking.id), (e) => e.status === 404, "only the client");

  await assert.rejects(operations.submitClientPayment(client, booking.id, { method: "telebirr", amountEtb: 900, reference: "TB1234" }), (e) => e.status === 400, "not more than is owed");
  const first = await operations.submitClientPayment(client, booking.id, { method: "telebirr", amountEtb: 300, reference: `tb-${run}-a` });
  assert.equal(first.status, "pending");
  await assert.rejects(operations.submitClientPayment(client, booking.id, { method: "telebirr", amountEtb: 100, reference: `TB-${run}-A` }), (e) => e.status === 409, "the same transaction twice");
  info = await operations.bookingPaymentsForClient(client, booking.id);
  assert.equal(info.pendingEtb, 300);
  assert.equal(info.balanceEtb, 200);
  assert.ok((await notifications.listNotifications(owner.id)).items.some((n) => n.type === "payment.submitted"), "the business is asked to confirm");

  let ledger = await operations.listPayments(owner, business.id, {});
  assert.equal(ledger.pending.length, 1);
  assert.equal(ledger.totalEtb, 0, "pending payments are not income");
  await operations.reviewClientPayment(owner, business.id, first.id, { decision: "confirm" });
  await assert.rejects(operations.reviewClientPayment(owner, business.id, first.id, { decision: "confirm" }), (e) => e.status === 409);
  const [row] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, booking.id));
  assert.equal(row.paymentStatus, "partial");
  assert.ok((await notifications.listNotifications(client.id)).items.some((n) => n.type === "payment.confirmed"));

  const second = await operations.submitClientPayment(client, booking.id, { method: "bank_transfer", amountEtb: 200, reference: `FT${run}B` });
  await assert.rejects(operations.reviewClientPayment(owner, business.id, second.id, { decision: "reject" }), (e) => e.status === 400, "rejections need a reason");
  await operations.reviewClientPayment(owner, business.id, second.id, { decision: "reject", reason: "Not on our statement yet." });
  info = await operations.bookingPaymentsForClient(client, booking.id);
  assert.equal(info.paidEtb, 300);
  assert.equal(info.balanceEtb, 200);
  assert.equal(info.submissions.find((s) => s.id === second.id).status, "rejected");
  ledger = await operations.listPayments(owner, business.id, {});
  assert.equal(ledger.totalEtb, 300);

  await settings.updateSettings("payments", paymentSettings({ bookingPayments: { clientSubmissions: false } }), admin.id);
  try {
    assert.equal((await operations.bookingPaymentsForClient(client, booking.id)).canSubmit, false, "administrators can switch this off");
  } finally {
    await settings.updateSettings("payments", paymentSettings(), admin.id);
  }
});

test("registration can be paused, and Telegram can be required before listing a business", { skip: skip() }, async () => {
  await settings.updateSettings("registration", { open: false, telegram: "required_for_business" }, admin.id);
  try {
    await assert.rejects(
      accounts.register({ email: `new-${run}@example.test`, password: "Str0ng!Passw0rd", preferredLanguage: "en" }, { request: new Request("http://localhost"), ip: "127.0.0.1", userAgent: "test" }),
      (e) => e.status === 403,
    );
    const [category] = await catalogue.listCategories();
    const business = await businessesSvc.createBusiness(owner, { categoryId: category.id, name: `Tg Check ${run}`, languages: [], deliveryModes: ["in_person"] });
    createdBusinesses.push(business.id);
    const kind = (await catalogue.listServiceKinds()).find((k) => !k.requiresSafetyScreen);
    await catalogue.saveService(owner, business.id, null, { kindId: kind.id, name: "Class", durationMinutes: 30, priceEtb: 100, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 0 });
    await assert.rejects(businessesSvc.submitForVerification(owner, business.id, { credentials: [{ label: "Endorsement" }] }), (e) => e.status === 400 && /Telegram/.test(e.message));
    await db.update(schema.users).set({ telegramId: `9${run.replace(/\D/g, "").padEnd(8, "1")}`, telegramVerifiedAt: new Date() }).where(eq(schema.users.id, owner.id));
    const submitted = await businessesSvc.submitForVerification(owner, business.id, { credentials: [{ label: "Endorsement" }] });
    assert.equal(submitted.status, "pending_verification");
  } finally {
    await settings.updateSettings("registration", { open: true, telegram: "optional" }, admin.id);
  }
});
