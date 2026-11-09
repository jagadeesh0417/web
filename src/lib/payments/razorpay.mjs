import { createHmac, timingSafeEqual } from "node:crypto";

// Amounts are in paise; callers must select a plan by identifier, not price.
export const PLANS = Object.freeze({
  basic: Object.freeze({ name: "Basic", amount: 14900, currency: "INR" }),
  standard: Object.freeze({ name: "Standard", amount: 19900, currency: "INR" }),
  premium: Object.freeze({ name: "Premium", amount: 24900, currency: "INR" }),
});

function equalHmac(secret, message, signature) {
  if (typeof secret !== "string" || !secret || typeof signature !== "string" || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(message).digest();
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(expected, supplied);
}

export function verifyCheckoutSignature(secret, orderId, paymentId, signature) {
  if (typeof orderId !== "string" || !orderId || typeof paymentId !== "string" || !paymentId) return false;
  return equalHmac(secret, `${orderId}|${paymentId}`, signature);
}

// The webhook message must be the raw bytes, not parsed and re-serialized JSON.
export function verifyWebhookSignature(secret, rawBody, signature) {
  if (!Buffer.isBuffer(rawBody)) return false;
  return equalHmac(secret, rawBody, signature);
}

export function createRazorpayClient({ keyId, keySecret, fetchImpl = fetch }) {
  // Live traffic remains disabled until the complete integration has been verified.
  if (!keyId?.startsWith("rzp_test_") || !keySecret) throw new Error("Razorpay test credentials are required");
  const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
  async function request(path, options = {}) {
    const response = await fetchImpl(`https://api.razorpay.com/v1${path}`, {
      ...options,
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Razorpay request failed");
    return response.json();
  }
  return {
    async createOrder(planId, receipt) {
      const plan = Object.hasOwn(PLANS, planId) ? PLANS[planId] : null;
      if (!plan || typeof receipt !== "string" || !receipt || receipt.length > 40) throw new Error("Invalid order");
      const order = await request("/orders", { method: "POST", body: JSON.stringify({ amount: plan.amount, currency: plan.currency, receipt }) });
      if (!order.id || order.amount !== plan.amount || order.currency !== plan.currency) throw new Error("Invalid provider order");
      return order;
    },
    async getCapturedPayment(paymentId, expectedOrder) {
      if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId)) throw new Error("Invalid payment ID");
      const payment = await request(`/payments/${encodeURIComponent(paymentId)}`);
      if (payment.id !== paymentId || payment.order_id !== expectedOrder.id || payment.status !== "captured" || payment.amount !== expectedOrder.amount || payment.currency !== expectedOrder.currency) throw new Error("Payment does not match order");
      return payment;
    },
  };
}
