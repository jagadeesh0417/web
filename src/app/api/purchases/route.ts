import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const purchaseSchema = z.object({
  packageId: z.string().min(1),
  packageName: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().min(1).max(10).optional().default("INR"),
  paymentGateway: z.string().min(1),
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "CANCELLED"]).optional().default("PENDING"),
  durationDays: z.number().int().min(1).optional().default(30),
});

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

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const db = await getDb();
  const userId = new ObjectId(auth.userId);
  const now = new Date();

  const purchaseDoc = {
    userId,
    packageId: data.packageId,
    packageName: data.packageName,
    amountPaid: data.amount,
    currency: data.currency,
    paymentGateway: data.paymentGateway,
    paymentId: data.paymentId,
    orderId: data.orderId,
    status: data.status,
    purchaseDate: now,
    createdAt: now,
  };

  const purchaseResult = await db
    .collection(COLLECTIONS.purchases)
    .insertOne(purchaseDoc);

  const purchaseId = purchaseResult.insertedId;

  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + data.durationDays);

  const subscriptionDoc = {
    userId,
    purchaseId,
    packageId: data.packageId,
    packageName: data.packageName,
    startDate: now,
    expiryDate,
    status: "ACTIVE" as const,
    createdAt: now,
  };

  await db
    .collection(COLLECTIONS.subscriptions)
    .insertOne(subscriptionDoc);

  return NextResponse.json(
    {
      ok: true,
      purchase: { _id: purchaseId, ...purchaseDoc },
      subscription: { _id: new ObjectId(), ...subscriptionDoc },
    },
    { status: 201 },
  );
}
