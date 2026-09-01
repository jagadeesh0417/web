import { NextRequest, NextResponse } from "next/server";
import { ObjectId, Double } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const db = await getDb();

  const withdrawals = await db
    .collection(COLLECTIONS.withdrawals)
    .find({ userId: new ObjectId(auth.userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ ok: true, withdrawals });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
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

  const { amount, paymentMethod, upiId, accountHolderName, accountNumber, ifsc } =
    (body ?? {}) as {
      amount?: number;
      paymentMethod?: string;
      upiId?: string;
      accountHolderName?: string;
      accountNumber?: string;
      ifsc?: string;
    };

  if (!amount || typeof amount !== "number" || amount < 200) {
    return NextResponse.json(
      { ok: false, error: "Minimum withdrawal amount is ₹200" },
      { status: 400 },
    );
  }

  if (!paymentMethod || !["bank_transfer", "upi"].includes(paymentMethod)) {
    return NextResponse.json(
      { ok: false, error: "paymentMethod must be 'bank_transfer' or 'upi'" },
      { status: 400 },
    );
  }

  if (paymentMethod === "upi" && !upiId) {
    return NextResponse.json(
      { ok: false, error: "upiId is required for UPI withdrawals" },
      { status: 400 },
    );
  }

  if (paymentMethod === "bank_transfer" && (!accountHolderName || !accountNumber || !ifsc)) {
    return NextResponse.json(
      { ok: false, error: "accountHolderName, accountNumber, and ifsc are required for bank transfers" },
      { status: 400 },
    );
  }

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

  const balance = user.walletBalance ?? 0;
  if (balance < amount) {
    return NextResponse.json(
      { ok: false, error: "Insufficient balance" },
      { status: 400 },
    );
  }

  const now = new Date();

  await db.collection(COLLECTIONS.users).updateOne(
    { _id: user._id },
    {
      $inc: {
        walletBalance: -amount,
        totalWithdrawn: amount,
      },
    },
  );

  const withdrawalResult = await db.collection(COLLECTIONS.withdrawals).insertOne({
    userId: user._id,
    userName: user.name,
    amount: new Double(amount),
    paymentMethod,
    upiId: paymentMethod === "upi" ? upiId : null,
    accountHolderName: paymentMethod === "bank_transfer" ? accountHolderName : null,
    accountNumber: paymentMethod === "bank_transfer" ? accountNumber : null,
    ifsc: paymentMethod === "bank_transfer" ? ifsc : null,
    status: "pending",
    adminNote: null,
    rejectionReason: null,
    createdAt: now,
    processedAt: null,
  });

  await db.collection(COLLECTIONS.walletTransactions).insertOne({
    userId: user._id,
    type: "WITHDRAWAL",
    amount: new Double(amount),
    referenceId: withdrawalResult.insertedId,
    description: `Withdrawal request of ₹${amount}`,
    status: "pending",
    createdAt: now,
  });

  return NextResponse.json({
    ok: true,
    withdrawal: {
      id: withdrawalResult.insertedId.toString(),
      amount,
      paymentMethod,
      status: "pending",
      createdAt: now,
    },
  });
}
