import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/admin-session";
import {
  seedInitialData,
  usersStore,
  withdrawalsStore,
  walletTransactionsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateWithdrawalSchema = z
  .object({
    status: z.enum(["approved", "processing", "paid", "rejected"]),
    rejectionReason: z.string().optional(),
  })
  .strict();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  await seedInitialData();

  const { id } = await params;
  const withdrawal = withdrawalsStore.getById(id);
  if (!withdrawal) {
    return NextResponse.json(
      { ok: false, error: "Withdrawal not found" },
      { status: 404 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = updateWithdrawalSchema.safeParse(json);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: errors },
      { status: 400 },
    );
  }

  const { status, rejectionReason } = parsed.data;

  const patch: Record<string, unknown> = {
    status,
    processedAt: new Date().toISOString(),
  };
  if (rejectionReason) patch.rejectionReason = rejectionReason;

  const updated = withdrawalsStore.update(id, patch as Record<string, unknown>);

  if (status === "rejected" && withdrawal.status !== "rejected") {
    const user = usersStore.getById(withdrawal.userId);
    if (user) {
      const currentBalance = user.walletBalance ?? 0;
      usersStore.update(user.id, { walletBalance: currentBalance + withdrawal.amount });

      walletTransactionsStore.create({
        id: `wtx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: user.id,
        type: "WITHDRAWAL_REVERSAL",
        amount: withdrawal.amount,
        referenceId: withdrawal.id,
        description: `Withdrawal of ₹${withdrawal.amount} rejected — amount returned to wallet`,
        status: "completed",
        createdAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ ok: true, withdrawal: updated });
}
