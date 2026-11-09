import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { PLANS, createRazorpayClient, verifyCheckoutSignature, verifyWebhookSignature } from "../src/lib/payments/razorpay.mjs";

const sign = (s, b) => createHmac("sha256", s).update(b).digest("hex");

test("checkout signature validates and rejects missing or altered signatures", () => {
  const sig = sign("secret", "order_1|pay_1");
  assert.equal(verifyCheckoutSignature("secret", "order_1", "pay_1", sig), true);
  for (const value of [undefined, "", "00", "x".repeat(64), sign("wrong", "order_1|pay_1")]) assert.equal(verifyCheckoutSignature("secret", "order_1", "pay_1", value), false);
  assert.equal(verifyCheckoutSignature("secret", "order_2", "pay_1", sig), false);
});

test("webhooks verify exact raw bytes", () => {
  const raw = Buffer.from('{"event":"payment.captured"}');
  const signature = sign("webhook-secret", raw);
  assert.equal(verifyWebhookSignature("webhook-secret", raw, signature), true);
  assert.equal(verifyWebhookSignature("webhook-secret", Buffer.from(raw.toString() + " "), signature), false);
  assert.equal(verifyWebhookSignature("webhook-secret", raw.toString(), signature), false);
});

test("provider order uses server pricing and rejects unknown plans", async () => {
  let sent;
  const client = createRazorpayClient({ keyId: "rzp_test_key", keySecret: "secret", fetchImpl: async (_url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: "order_1", ...sent }) };
  } });
  for (const [id, amount] of [["basic", 14900], ["standard", 19900], ["premium", 24900]]) {
    await client.createOrder(id, "receipt_1");
    assert.equal(sent.amount, amount);
    assert.equal(sent.currency, "INR");
  }
  await assert.rejects(client.createOrder("__proto__", "receipt_1"));
  assert.equal(PLANS.premium.amount, 24900);
});

test("only a captured provider payment matching the order can be accepted", async () => {
  let payment = { id: "pay_1", order_id: "order_1", status: "captured", amount: 14900, currency: "INR" };
  const client = createRazorpayClient({ keyId: "rzp_test_key", keySecret: "secret", fetchImpl: async () => ({ ok: true, json: async () => payment }) });
  const order = { id: "order_1", amount: 14900, currency: "INR" };
  assert.equal((await client.getCapturedPayment("pay_1", order)).status, "captured");
  for (const change of [{ status: "authorized" }, { order_id: "order_2" }, { amount: 1 }, { currency: "USD" }, { id: "pay_2" }]) {
    payment = { id: "pay_1", order_id: "order_1", status: "captured", amount: 14900, currency: "INR", ...change };
    await assert.rejects(client.getCapturedPayment("pay_1", order));
  }
});

test("live and absent credentials cannot create a provider client", () => {
  assert.throws(() => createRazorpayClient({ keyId: "rzp_live_key", keySecret: "secret" }));
  assert.throws(() => createRazorpayClient({ keyId: "", keySecret: "" }));
});
