import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  usersStore,
  referralsStore,
  paymentsStore,
} from "@/lib/data/server-store";
import { siteConfig } from "@/config/site";

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
  const auth = await requireStudentApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const user = usersStore.getById(auth.user.id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  let referralCode = user.referralCode;
  if (!referralCode) {
    referralCode = generateReferralCode();
    usersStore.update(user.id, { referralCode });
  }

  const referralLink = `${siteConfig.url}/register?ref=${referralCode}`;

  const userReferrals = referralsStore.find((r) => r.referrerId === user.id);
  const totalReferrals = userReferrals.length;
  const successfulReferrals = userReferrals.filter((r) => r.status === "rewarded").length;
  const pendingReferrals = userReferrals.filter((r) => r.status === "pending").length;
  const totalEarned = userReferrals
    .filter((r) => r.status === "rewarded")
    .reduce((sum, r) => sum + r.rewardAmount, 0);
  const availableBalance = user.walletBalance ?? 0;

  const successfulPayments = paymentsStore.find(
    (p) => (p.userId === user.id || p.studentId === user.id) && p.status === "succeeded",
  );
  const referralEligible = successfulPayments.length > 0;

  return NextResponse.json({
    ok: true,
    referralCode,
    referralLink,
    stats: {
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      totalEarned,
      availableBalance,
    },
    referralEligible,
  });
}
