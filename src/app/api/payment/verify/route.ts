import { NextRequest, NextResponse } from "next/server";
import { ObjectId, Double } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import type { PricingConfig } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PACKAGE_DURATION_DAYS: Record<string, number> = {
  "4_weeks": 28,
  "6_weeks": 42,
  "8_weeks": 56,
};

const VALID_PACKAGE_IDS = ["4_weeks", "6_weeks", "8_weeks"] as const;

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "AKR" + code;
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

  const { orderId, paymentId, signature, packageId, purchaseId } = (body ?? {}) as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    packageId?: string;
    purchaseId?: string;
  };

  if (!orderId || !paymentId || !packageId || !purchaseId) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields: orderId, paymentId, packageId, purchaseId" },
      { status: 400 },
    );
  }

  if (!VALID_PACKAGE_IDS.includes(packageId as typeof VALID_PACKAGE_IDS[number])) {
    return NextResponse.json(
      { ok: false, error: "Invalid packageId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const isDemoMode = !razorpayKeySecret || razorpayKeySecret === "";

  if (!isDemoMode && signature) {
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { ok: false, error: "Invalid payment signature" },
        { status: 400 },
      );
    }
  }

  let purchase;
  try {
    purchase = await db.collection(COLLECTIONS.purchases).findOne({
      _id: new ObjectId(purchaseId),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid purchase ID" },
      { status: 400 },
    );
  }

  if (!purchase) {
    return NextResponse.json(
      { ok: false, error: "Purchase not found" },
      { status: 404 },
    );
  }

  if (purchase.userId.toString() !== auth.userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 403 },
    );
  }

  if (purchase.status === "PAID") {
    const existingSubscription = await db.collection(COLLECTIONS.subscriptions).findOne({
      purchaseId: purchase._id,
    });
    if (existingSubscription) {
      return NextResponse.json({
        ok: true,
        subscriptionId: existingSubscription._id.toString(),
      });
    }
  }

  await db.collection(COLLECTIONS.purchases).updateOne(
    { _id: purchase._id },
    {
      $set: {
        status: "PAID",
        paymentId,
      },
    },
  );

  const now = new Date();
  const durationDays = PACKAGE_DURATION_DAYS[packageId] || 28;
  const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const subscriptionResult = await db.collection(COLLECTIONS.subscriptions).insertOne({
    userId: purchase.userId,
    purchaseId: purchase._id,
    packageId,
    packageName: purchase.packageName,
    startDate: now,
    expiryDate,
    status: "ACTIVE",
    createdAt: now,
  });

  const user = await db.collection(COLLECTIONS.users).findOne({
    _id: purchase.userId,
  });

  if (user && user.referredBy) {
    const referrerId = user.referredBy as ObjectId;

    if (referrerId.toString() !== auth.userId) {
      const existingReferral = await db.collection(COLLECTIONS.referrals).findOne({
        referredUserId: purchase.userId,
        qualifyingPurchaseId: purchase._id,
      });

      if (!existingReferral) {
        const pricing = await db.collection<PricingConfig>(COLLECTIONS.pricingConfig).findOne({
          _id: "default",
        });
        const rewardAmount = pricing?.referralReward ?? 20;

        await db.collection(COLLECTIONS.referrals).insertOne({
          referrerId,
          referredUserId: purchase.userId,
          referralCode: user.referralCode ?? "",
          rewardAmount: new Double(rewardAmount),
          status: "rewarded",
          qualifyingPurchaseId: purchase._id,
          createdAt: now,
          rewardedAt: now,
        });

        await db.collection(COLLECTIONS.walletTransactions).insertOne({
          userId: referrerId,
          type: "REFERRAL_REWARD",
          amount: new Double(rewardAmount),
          referenceId: purchase._id,
          description: `Referral reward for ${user.name}'s purchase`,
          status: "completed",
          createdAt: now,
        });

        await db.collection(COLLECTIONS.users).updateOne(
          { _id: referrerId },
          {
            $inc: {
              walletBalance: rewardAmount,
              totalReferralEarnings: rewardAmount,
            },
          },
        );
      }
    }
  }

  if (user && !user.referralCode) {
    const referralCode = generateReferralCode();
    await db.collection(COLLECTIONS.users).updateOne(
      { _id: user._id },
      { $set: { referralCode } },
    );
  }

  return NextResponse.json({
    ok: true,
    subscriptionId: subscriptionResult.insertedId.toString(),
  });
}
