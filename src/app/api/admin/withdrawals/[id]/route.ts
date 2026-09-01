import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  let withdrawalObjectId: ObjectId;
  try {
    withdrawalObjectId = new ObjectId(id);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid withdrawal ID format" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const withdrawal = await db
    .collection(COLLECTIONS.withdrawals)
    .findOne({ _id: withdrawalObjectId });
  if (!withdrawal) {
    return NextResponse.json(
      { ok: false, error: "Withdrawal not found" },
      { status: 404 },
    );
  }

  let body: { status?: string; rejectionReason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const validStatuses = ["approved", "processing", "paid", "rejected"];
  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status. Must be: approved, processing, paid, or rejected" },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {
    status: body.status,
    processedAt: new Date(),
  };

  if (body.rejectionReason) {
    update.rejectionReason = body.rejectionReason;
  }

  await db
    .collection(COLLECTIONS.withdrawals)
    .updateOne({ _id: withdrawalObjectId }, { $set: update });

  if (body.status === "rejected" && withdrawal.status !== "rejected") {
    const user = await db
      .collection(COLLECTIONS.users)
      .findOne({ _id: withdrawal.userId });

    if (user) {
      const currentBalance = user.walletBalance ?? 0;
      await db
        .collection(COLLECTIONS.users)
        .updateOne(
          { _id: withdrawal.userId },
          { $set: { walletBalance: currentBalance + withdrawal.amount } },
        );

      await db.collection(COLLECTIONS.walletTransactions).insertOne({
        userId: withdrawal.userId,
        type: "WITHDRAWAL_REVERSAL",
        amount: withdrawal.amount,
        referenceId: withdrawal._id,
        description: `Withdrawal of ₹${withdrawal.amount} rejected — amount returned to wallet`,
        status: "completed",
        createdAt: new Date(),
      });
    }
  }

  await db.collection(COLLECTIONS.auditLogs).insertOne({
    adminId: new ObjectId(auth.userId),
    action: "withdrawal.update_status",
    targetType: "withdrawals",
    targetId: withdrawalObjectId,
    previousValue: { status: withdrawal.status },
    newValue: { status: body.status },
    createdAt: new Date(),
  });

  const updated = await db
    .collection(COLLECTIONS.withdrawals)
    .findOne({ _id: withdrawalObjectId });

  return NextResponse.json({
    ok: true,
    withdrawal: {
      ...updated,
      _id: updated!._id.toString(),
      id: updated!._id.toString(),
    },
  });
}
