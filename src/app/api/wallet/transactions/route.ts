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

  const transactions = await db
    .collection(COLLECTIONS.walletTransactions)
    .find({ userId: new ObjectId(auth.userId) })
    .sort({ createdAt: -1 })
    .toArray();

  const history = transactions.map((t) => ({
    id: t._id.toString(),
    type: t.type,
    amount: t.amount,
    description: t.description,
    status: t.status,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ ok: true, transactions: history });
}
