import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  let body: { userId?: string; courseId?: string; accessType?: string; expiresAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.userId || !body.courseId) {
    return NextResponse.json(
      { ok: false, error: "userId and courseId are required" },
      { status: 400 },
    );
  }

  let userObjectId: ObjectId;
  let courseObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(body.userId);
    courseObjectId = new ObjectId(body.courseId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid userId or courseId format" },
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

  const course = await db.collection(COLLECTIONS.courses).findOne({ _id: courseObjectId });
  if (!course) {
    return NextResponse.json(
      { ok: false, error: "Course not found" },
      { status: 404 },
    );
  }

  const existing = await db
    .collection(COLLECTIONS.courseAccess)
    .findOne({ userId: userObjectId, courseId: courseObjectId });

  if (existing) {
    return NextResponse.json(
      { ok: false, error: "User already has access to this course" },
      { status: 409 },
    );
  }

  const validAccessTypes = ["PURCHASED", "COMPLIMENTARY"];
  const accessType = body.accessType && validAccessTypes.includes(body.accessType)
    ? body.accessType
    : "COMPLIMENTARY";

  let expiresAt: Date | null = null;
  if (body.expiresAt) {
    const parsed = new Date(body.expiresAt);
    if (!isNaN(parsed.getTime())) {
      expiresAt = parsed;
    }
  }

  const now = new Date();
  const result = await db.collection(COLLECTIONS.courseAccess).insertOne({
    userId: userObjectId,
    courseId: courseObjectId,
    accessType,
    grantedBy: new ObjectId(auth.userId),
    expiresAt,
    createdAt: now,
  });

  await db.collection(COLLECTIONS.auditLogs).insertOne({
    adminId: new ObjectId(auth.userId),
    action: "course_access.grant",
    targetType: "courseAccess",
    targetId: result.insertedId,
    previousValue: null,
    newValue: {
      userId: userObjectId.toString(),
      courseId: courseObjectId.toString(),
      accessType,
      expiresAt,
    },
    createdAt: now,
  });

  return NextResponse.json({
    ok: true,
    access: {
      id: result.insertedId.toString(),
      userId: userObjectId.toString(),
      courseId: courseObjectId.toString(),
      accessType,
      grantedBy: auth.userId,
      expiresAt,
      createdAt: now,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  let body: { userId?: string; courseId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.userId || !body.courseId) {
    return NextResponse.json(
      { ok: false, error: "userId and courseId are required" },
      { status: 400 },
    );
  }

  let userObjectId: ObjectId;
  let courseObjectId: ObjectId;
  try {
    userObjectId = new ObjectId(body.userId);
    courseObjectId = new ObjectId(body.courseId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid userId or courseId format" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const existing = await db
    .collection(COLLECTIONS.courseAccess)
    .findOne({ userId: userObjectId, courseId: courseObjectId });

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "No course access found for this user and course" },
      { status: 404 },
    );
  }

  await db
    .collection(COLLECTIONS.courseAccess)
    .deleteOne({ userId: userObjectId, courseId: courseObjectId });

  await db.collection(COLLECTIONS.auditLogs).insertOne({
    adminId: new ObjectId(auth.userId),
    action: "course_access.revoke",
    targetType: "courseAccess",
    targetId: existing._id,
    previousValue: {
      userId: userObjectId.toString(),
      courseId: courseObjectId.toString(),
      accessType: existing.accessType,
    },
    newValue: null,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true, message: "Course access revoked" });
}
