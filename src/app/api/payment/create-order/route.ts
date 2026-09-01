import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import type { PricingConfig } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PACKAGE_IDS = ["4_weeks", "6_weeks", "8_weeks"] as const;

const PACKAGE_NAMES: Record<string, string> = {
  "4_weeks": "4 Weeks Internship",
  "6_weeks": "6 Weeks Internship",
  "8_weeks": "8 Weeks Internship",
};

const PACKAGE_DURATION_DAYS: Record<string, number> = {
  "4_weeks": 28,
  "6_weeks": 42,
  "8_weeks": 56,
};

function generateFakeOrderId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `order_demo_${ts}_${rand}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { packageId } = (body ?? {}) as { packageId?: string };

  if (!packageId || !VALID_PACKAGE_IDS.includes(packageId as typeof VALID_PACKAGE_IDS[number])) {
    return NextResponse.json(
      { ok: false, error: "Invalid packageId. Must be one of: 4_weeks, 6_weeks, 8_weeks" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const pricing = await db.collection<PricingConfig>(COLLECTIONS.pricingConfig).findOne({ _id: "default" });
  if (!pricing) {
    return NextResponse.json(
      { ok: false, error: "Pricing configuration not found" },
      { status: 500 },
    );
  }

  const priceMap: Record<string, number> = {
    "4_weeks": pricing.fourWeekPrice,
    "6_weeks": pricing.sixWeekPrice,
    "8_weeks": pricing.eightWeekPrice,
  };

  const amount = priceMap[packageId];
  if (!amount || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid price configuration for package" },
      { status: 500 },
    );
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID ?? "";
  const isDemoMode = !razorpayKeyId || razorpayKeyId.startsWith("rzp_test_demo");

  const orderId = isDemoMode
    ? generateFakeOrderId()
    : `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const purchaseResult = await db.collection(COLLECTIONS.purchases).insertOne({
    userId: new ObjectId(auth.userId),
    packageId,
    packageName: PACKAGE_NAMES[packageId],
    amountPaid: amount,
    currency: "INR",
    paymentGateway: "razorpay",
    paymentId: "",
    orderId,
    status: "PENDING",
    purchaseDate: new Date(),
    createdAt: new Date(),
  });

  return NextResponse.json({
    ok: true,
    orderId,
    amount,
    currency: "INR",
    keyId: isDemoMode ? "rzp_test_demo" : razorpayKeyId,
    purchaseId: purchaseResult.insertedId.toString(),
    packageId,
    packageName: PACKAGE_NAMES[packageId],
    durationDays: PACKAGE_DURATION_DAYS[packageId],
  });
}
