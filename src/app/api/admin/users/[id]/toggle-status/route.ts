import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const newStatus = body.status as string | undefined;

  let targetStatus: string;
  if (newStatus && ["ACTIVE", "SUSPENDED", "DISABLED"].includes(newStatus)) {
    targetStatus = newStatus;
  } else {
    targetStatus = user.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  }

  if (targetStatus === "ACTIVE" && user.accountStatus === "DISABLED") {
    targetStatus = "ACTIVE";
  }

  const previousStatus = user.accountStatus;

  await db
    .collection(COLLECTIONS.users)
    .updateOne(
      { _id: userObjectId },
      { $set: { accountStatus: targetStatus, updatedAt: new Date() } },
    );

  await db.collection(COLLECTIONS.auditLogs).insertOne({
    adminId: new ObjectId(auth.userId),
    action: "user.toggle_status",
    targetType: "users",
    targetId: userObjectId,
    previousValue: { accountStatus: previousStatus },
    newValue: { accountStatus: targetStatus },
    createdAt: new Date(),
  });

  return NextResponse.json({
    ok: true,
    status: targetStatus,
    message: `User ${targetStatus === "ACTIVE" ? "activated" : targetStatus === "SUSPENDED" ? "suspended" : "disabled"}`,
  });
}
