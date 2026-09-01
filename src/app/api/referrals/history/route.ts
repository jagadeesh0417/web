import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  referralsStore,
  usersStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireStudentApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const userReferrals = referralsStore.find((r) => r.referrerId === auth.user.id);

  const history = userReferrals.map((referral) => {
    const referredUser = usersStore.getById(referral.referredUserId);
    const email = referredUser?.email ?? "";
    const maskedName = email.length >= 4
      ? email.slice(0, 4) + "****"
      : "User ****";

    return {
      date: referral.createdAt,
      referredUser: maskedName,
      status: referral.status,
      reward: referral.rewardAmount,
    };
  });

  return NextResponse.json({ ok: true, history });
}
