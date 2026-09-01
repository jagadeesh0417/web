import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import type { PricingConfig } from "@/lib/db/models";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();

  const config = await db
    .collection<PricingConfig>(COLLECTIONS.pricingConfig)
    .findOne({ _id: "default" });

  if (!config) {
    return NextResponse.json({
      ok: true,
      config: {
        fourWeekPrice: 149,
        sixWeekPrice: 199,
        eightWeekPrice: 249,
        referralReward: 20,
        minimumWithdrawal: 200,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    config: {
      fourWeekPrice: config.fourWeekPrice,
      sixWeekPrice: config.sixWeekPrice,
      eightWeekPrice: config.eightWeekPrice,
      referralReward: config.referralReward,
      minimumWithdrawal: config.minimumWithdrawal,
      updatedAt: config.updatedAt,
    },
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
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

  const {
    fourWeekPrice,
    sixWeekPrice,
    eightWeekPrice,
    referralReward,
    minimumWithdrawal,
  } = (body ?? {}) as {
    fourWeekPrice?: number;
    sixWeekPrice?: number;
    eightWeekPrice?: number;
    referralReward?: number;
    minimumWithdrawal?: number;
  };

  if (
    fourWeekPrice !== undefined &&
    (typeof fourWeekPrice !== "number" || fourWeekPrice < 0)
  ) {
    return NextResponse.json(
      { ok: false, error: "fourWeekPrice must be a non-negative number" },
      { status: 400 },
    );
  }

  if (
    sixWeekPrice !== undefined &&
    (typeof sixWeekPrice !== "number" || sixWeekPrice < 0)
  ) {
    return NextResponse.json(
      { ok: false, error: "sixWeekPrice must be a non-negative number" },
      { status: 400 },
    );
  }

  if (
    eightWeekPrice !== undefined &&
    (typeof eightWeekPrice !== "number" || eightWeekPrice < 0)
  ) {
    return NextResponse.json(
      { ok: false, error: "eightWeekPrice must be a non-negative number" },
      { status: 400 },
    );
  }

  if (
    referralReward !== undefined &&
    (typeof referralReward !== "number" || referralReward < 0)
  ) {
    return NextResponse.json(
      { ok: false, error: "referralReward must be a non-negative number" },
      { status: 400 },
    );
  }

  if (
    minimumWithdrawal !== undefined &&
    (typeof minimumWithdrawal !== "number" || minimumWithdrawal < 0)
  ) {
    return NextResponse.json(
      { ok: false, error: "minimumWithdrawal must be a non-negative number" },
      { status: 400 },
    );
  }

  const db = await getDb();
  const pricingCol = db.collection<PricingConfig>(COLLECTIONS.pricingConfig);
  const now = new Date();

  const updateFields: Record<string, unknown> = { updatedAt: now };
  if (fourWeekPrice !== undefined) updateFields.fourWeekPrice = fourWeekPrice;
  if (sixWeekPrice !== undefined) updateFields.sixWeekPrice = sixWeekPrice;
  if (eightWeekPrice !== undefined) updateFields.eightWeekPrice = eightWeekPrice;
  if (referralReward !== undefined) updateFields.referralReward = referralReward;
  if (minimumWithdrawal !== undefined) updateFields.minimumWithdrawal = minimumWithdrawal;

  const existing = await pricingCol.findOne({ _id: "default" });

  let previousValue: Record<string, unknown> | null = null;
  if (existing) {
    previousValue = {
      fourWeekPrice: existing.fourWeekPrice,
      sixWeekPrice: existing.sixWeekPrice,
      eightWeekPrice: existing.eightWeekPrice,
      referralReward: existing.referralReward,
      minimumWithdrawal: existing.minimumWithdrawal,
    };
  }

  if (existing) {
    await pricingCol.updateOne(
      { _id: "default" },
      { $set: updateFields },
    );
  } else {
    await pricingCol.insertOne({
      _id: "default",
      fourWeekPrice: fourWeekPrice ?? 149,
      sixWeekPrice: sixWeekPrice ?? 199,
      eightWeekPrice: eightWeekPrice ?? 249,
      referralReward: referralReward ?? 20,
      minimumWithdrawal: minimumWithdrawal ?? 200,
      updatedAt: now,
    });
  }

  await db.collection(COLLECTIONS.auditLogs).insertOne({
    adminId: new ObjectId(auth.userId),
    action: "update",
    targetType: "pricing",
    targetId: new ObjectId(auth.userId),
    previousValue,
    newValue: updateFields,
    createdAt: now,
  });

  const updated = await pricingCol.findOne({ _id: "default" });

  return NextResponse.json({
    ok: true,
    config: {
      fourWeekPrice: updated?.fourWeekPrice,
      sixWeekPrice: updated?.sixWeekPrice,
      eightWeekPrice: updated?.eightWeekPrice,
      referralReward: updated?.referralReward,
      minimumWithdrawal: updated?.minimumWithdrawal,
      updatedAt: updated?.updatedAt,
    },
  });
}
