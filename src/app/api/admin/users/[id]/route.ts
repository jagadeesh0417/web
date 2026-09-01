import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(id);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid user ID format" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const user = await db.collection(COLLECTIONS.users).findOne({ _id: userObjectId });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 },
    );
  }

  const safeUser = { ...user };
  delete (safeUser as Record<string, unknown>).passwordHash;

  const enrollments = await db
    .collection(COLLECTIONS.subscriptions)
    .find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .toArray();

  const purchases = await db
    .collection(COLLECTIONS.purchases)
    .find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .toArray();

  const referrals = await db
    .collection(COLLECTIONS.referrals)
    .find({ referrerId: userObjectId })
    .sort({ createdAt: -1 })
    .toArray();

  const wallet = await db
    .collection(COLLECTIONS.walletTransactions)
    .find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    ok: true,
    user: {
      ...safeUser,
      _id: user._id.toString(),
      id: user._id.toString(),
    },
    enrollments: enrollments.map((e) => ({
      ...e,
      _id: e._id.toString(),
      id: e._id.toString(),
    })),
    purchases: purchases.map((p) => ({
      ...p,
      _id: p._id.toString(),
      id: p._id.toString(),
    })),
    referrals: referrals.map((r) => ({
      ...r,
      _id: r._id.toString(),
      id: r._id.toString(),
    })),
    wallet: wallet.map((w) => ({
      ...w,
      _id: w._id.toString(),
      id: w._id.toString(),
    })),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(id);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid user ID format" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const user = await db.collection(COLLECTIONS.users).findOne({ _id: userObjectId });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const allowedFields = ["name", "phone", "role", "accountStatus"];
  const update: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      update[field] = body[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { ok: false, error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const validRoles = ["USER", "ADMIN"];
  if (update.role && !validRoles.includes(update.role as string)) {
    return NextResponse.json(
      { ok: false, error: "Invalid role" },
      { status: 400 },
    );
  }

  const validStatuses = ["ACTIVE", "SUSPENDED", "DISABLED"];
  if (update.accountStatus && !validStatuses.includes(update.accountStatus as string)) {
    return NextResponse.json(
      { ok: false, error: "Invalid account status" },
      { status: 400 },
    );
  }

  update.updatedAt = new Date();

  await db
    .collection(COLLECTIONS.users)
    .updateOne({ _id: userObjectId }, { $set: update });

  await db.collection(COLLECTIONS.auditLogs).insertOne({
    adminId: new ObjectId(auth.userId),
    action: "user.update",
    targetType: "users",
    targetId: userObjectId,
    previousValue: Object.fromEntries(
      Object.keys(update)
        .filter((k) => k !== "updatedAt")
        .map((k) => [k, user[k]]),
    ),
    newValue: Object.fromEntries(
      Object.keys(update)
        .filter((k) => k !== "updatedAt")
        .map((k) => [k, update[k]]),
    ),
    createdAt: new Date(),
  });

  const updated = await db.collection(COLLECTIONS.users).findOne({ _id: userObjectId });
  const safeUser = { ...updated! };
  delete (safeUser as Record<string, unknown>).passwordHash;

  return NextResponse.json({ ok: true, user: safeUser });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;

  let userObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(id);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid user ID format" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const user = await db.collection(COLLECTIONS.users).findOne({ _id: userObjectId });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "User not found" },
      { status: 404 },
    );
  }

  if (user.role === "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Cannot deactivate admin users" },
      { status: 400 },
    );
  }

  await db
    .collection(COLLECTIONS.users)
    .updateOne(
      { _id: userObjectId },
      { $set: { accountStatus: "DISABLED", updatedAt: new Date() } },
    );

  await db.collection(COLLECTIONS.auditLogs).insertOne({
    adminId: new ObjectId(auth.userId),
    action: "user.deactivate",
    targetType: "users",
    targetId: userObjectId,
    previousValue: { accountStatus: user.accountStatus },
    newValue: { accountStatus: "DISABLED" },
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true, message: "User deactivated" });
}
