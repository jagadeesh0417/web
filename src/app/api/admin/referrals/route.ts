import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";
import {
  seedInitialData,
  referralsStore,
  usersStore,
  withdrawalsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  await seedInitialData();

  const referrals = referralsStore.getAll();

  const referralsWithDetails = referrals.map((referral) => {
    const referrer = usersStore.getById(referral.referrerId);
    const referredUser = usersStore.getById(referral.referredUserId);
    return {
      ...referral,
      referrerName: referrer?.name ?? "Unknown",
      referrerEmail: referrer?.email ?? "",
      referredUserName: referredUser?.name ?? "Unknown",
      referredUserEmail: referredUser?.email ?? "",
    };
  });

  const successful = referrals.filter((r) => r.status === "rewarded");
  const pending = referrals.filter((r) => r.status === "pending");
  const totalRewards = successful.reduce((sum, r) => sum + r.rewardAmount, 0);

  const allWithdrawals = withdrawalsStore.getAll();
  const totalWithdrawn = allWithdrawals
    .filter((w) => w.status === "paid")
    .reduce((sum, w) => sum + w.amount, 0);

  return NextResponse.json({
    ok: true,
    referrals: referralsWithDetails,
    stats: {
      total: referrals.length,
      successful: successful.length,
      pending: pending.length,
      totalRewards,
      totalWithdrawn,
    },
  });
}
