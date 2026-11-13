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

    const purchases = await db
      .collection(COLLECTIONS.purchases)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, purchases });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch purchases" },
      { status: 500 },
    );
  }
}

// Purchases and subscriptions must only be created by verified payment processing.
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Checkout is temporarily unavailable." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
