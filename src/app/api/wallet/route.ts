import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  usersStore,
  withdrawalsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireStudentApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const user = usersStore.getById(auth.user.id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  const pendingWithdrawals = withdrawalsStore.find(
    (w) => w.userId === user.id && w.status === "pending",
  ).length;

  return NextResponse.json({
    ok: true,
    balance: user.walletBalance ?? 0,
    totalEarned: user.totalReferralEarnings ?? 0,
    totalWithdrawn: user.totalWithdrawn ?? 0,
    pendingWithdrawals,
  });
}
