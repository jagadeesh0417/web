import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const db = await getDb();

  const subscriptions = await db
    .collection(COLLECTIONS.subscriptions)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  const result = subscriptions.map((s) => ({
    id: s._id.toString(),
    userId: s.userId?.toString(),
    purchaseId: s.purchaseId?.toString(),
    packageId: s.packageId,
    packageName: s.packageName,
    startDate: s.startDate,
    expiryDate: s.expiryDate,
    status: s.status,
    createdAt: s.createdAt,
  }));

  return NextResponse.json({ ok: true, subscriptions: result });
}
