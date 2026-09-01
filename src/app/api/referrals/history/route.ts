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

  const userReferrals = await db
    .collection(COLLECTIONS.referrals)
    .find({ referrerId: new ObjectId(auth.userId) })
    .sort({ createdAt: -1 })
    .toArray();

  const history = await Promise.all(
    userReferrals.map(async (referral) => {
      const referredUser = await db
        .collection(COLLECTIONS.users)
        .findOne({ _id: referral.referredUserId });

      const email = referredUser?.email ?? "";
      const maskedName =
        email.length >= 4 ? email.slice(0, 4) + "****" : "User ****";

      return {
        id: referral._id.toString(),
        date: referral.createdAt,
        referredUser: maskedName,
        status: referral.status,
        reward: referral.rewardAmount,
      };
    }),
  );

  return NextResponse.json({ ok: true, history });
}
