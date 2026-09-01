import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "AKR" + code;
}

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

  let referralCode = user.referralCode;
  if (!referralCode) {
    referralCode = generateReferralCode();
    await db.collection(COLLECTIONS.users).updateOne(
      { _id: user._id },
      { $set: { referralCode } },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://akradhii.vercel.app";
  const referralLink = `${siteUrl}/register?ref=${referralCode}`;

  const userReferrals = await db
    .collection(COLLECTIONS.referrals)
    .find({ referrerId: user._id })
    .toArray();

  const totalReferrals = userReferrals.length;
  const successfulReferrals = userReferrals.filter((r) => r.status === "rewarded").length;
  const pendingReferrals = userReferrals.filter((r) => r.status === "pending").length;
  const totalEarned = userReferrals
    .filter((r) => r.status === "rewarded")
    .reduce((sum, r) => sum + (r.rewardAmount ?? 0), 0);

  const purchases = await db
    .collection(COLLECTIONS.purchases)
    .find({
      userId: user._id,
      status: "PAID",
    })
    .toArray();

  const referralEligible = purchases.length > 0;

  return NextResponse.json({
    ok: true,
    referralCode,
    referralLink,
    stats: {
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      totalEarned,
      availableBalance: user.walletBalance ?? 0,
    },
    referralEligible,
  });
}
