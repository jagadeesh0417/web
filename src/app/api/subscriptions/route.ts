import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const db = await getDb();
    const userId = new ObjectId(auth.userId);
    const now = new Date();

    const subscriptions = await db
      .collection(COLLECTIONS.subscriptions)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const enriched = subscriptions.map((sub) => {
      const isExpired = sub.expiryDate < now;
      const effectiveStatus = isExpired ? "EXPIRED" : sub.status;

      return {
        ...sub,
        status: effectiveStatus,
        isActive: effectiveStatus === "ACTIVE",
      };
    });

    return NextResponse.json({ ok: true, subscriptions: enriched });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch subscriptions" },
      { status: 500 },
    );
  }
}
