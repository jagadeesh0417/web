import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const db = await getDb();
  const user = await db.collection(COLLECTIONS.users).findOne({
    _id: new ObjectId(auth.userId),
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 },
    );
  }

  const pendingWithdrawals = await db
    .collection(COLLECTIONS.withdrawals)
    .countDocuments({
      userId: user._id,
      status: "pending",
    });

  return NextResponse.json({
    ok: true,
    balance: user.walletBalance ?? 0,
    totalEarned: user.totalReferralEarnings ?? 0,
    totalWithdrawn: user.totalWithdrawn ?? 0,
    pendingWithdrawals,
  });
}
