import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  usersStore,
  withdrawalsStore,
  walletTransactionsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createWithdrawalSchema = z
  .object({
    amount: z.number().min(200, "Minimum withdrawal is ₹200"),
    paymentMethod: z.enum(["bank_transfer", "upi"]),
    upiId: z.string().optional(),
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifsc: z.string().optional(),
  })
  .strict();

export async function GET(request: NextRequest) {
  const auth = await requireStudentApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const withdrawals = withdrawalsStore.find((w) => w.userId === auth.user.id);

  return NextResponse.json({ ok: true, withdrawals });
}

export async function POST(request: NextRequest) {
  const auth = await requireStudentApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = createWithdrawalSchema.safeParse(json);
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

  const { amount, paymentMethod, upiId, accountHolderName, accountNumber, ifsc } = parsed.data;

  const user = usersStore.getById(auth.user.id);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 },
    );
  }

  const balance = user.walletBalance ?? 0;
  if (balance < amount) {
    return NextResponse.json(
      { ok: false, error: "Insufficient balance" },
      { status: 400 },
    );
  }

  usersStore.update(user.id, { walletBalance: balance - amount });

  const withdrawal = withdrawalsStore.create({
    id: `wd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: user.id,
    userName: user.name,
    amount,
    paymentMethod,
    upiId: paymentMethod === "upi" ? upiId : undefined,
    accountHolderName: paymentMethod === "bank_transfer" ? accountHolderName : undefined,
    accountNumber: paymentMethod === "bank_transfer" ? accountNumber : undefined,
    ifsc: paymentMethod === "bank_transfer" ? ifsc : undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  walletTransactionsStore.create({
    id: `wtx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: user.id,
    type: "WITHDRAWAL",
    amount,
    referenceId: withdrawal.id,
    description: `Withdrawal request of ₹${amount}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, withdrawal });
}
