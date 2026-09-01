import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const db = await getDb();

  const payments = await db
    .collection(COLLECTIONS.purchases)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const result = payments.map((p) => ({
    id: p._id.toString(),
    userId: p.userId?.toString(),
    packageId: p.packageId,
    packageName: p.packageName,
    amountPaid: p.amountPaid,
    currency: p.currency,
    paymentGateway: p.paymentGateway,
    paymentId: p.paymentId,
    orderId: p.orderId,
    status: p.status,
    purchaseDate: p.purchaseDate,
    createdAt: p.createdAt,
  }));

  return NextResponse.json({ ok: true, payments: result });
}
