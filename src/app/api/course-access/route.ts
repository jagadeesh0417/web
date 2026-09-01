import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { ok: false, error: "courseId query parameter is required" },
      { status: 400 },
    );
  }

  let courseObjectId;
  try {
    courseObjectId = new ObjectId(courseId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid courseId format" },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();
    const userId = new ObjectId(auth.userId);
    const now = new Date();

    const access = await db
      .collection(COLLECTIONS.courseAccess)
      .findOne({ userId, courseId: courseObjectId });

    if (access) {
      if (access.expiresAt && access.expiresAt < now) {
        return NextResponse.json({
          ok: true,
          hasAccess: false,
          expiresAt: access.expiresAt.toISOString(),
          reason: "Access expired",
        });
      }

      return NextResponse.json({
        ok: true,
        hasAccess: true,
        expiresAt: access.expiresAt?.toISOString() ?? null,
        accessType: access.accessType,
      });
    }

    const subscription = await db
      .collection(COLLECTIONS.subscriptions)
      .findOne({
        userId,
        status: "ACTIVE",
        expiryDate: { $gt: now },
      });

    if (subscription) {
      return NextResponse.json({
        ok: true,
        hasAccess: true,
        expiresAt: subscription.expiryDate.toISOString(),
        accessType: "SUBSCRIPTION",
      });
    }

    return NextResponse.json({
      ok: true,
      hasAccess: false,
      expiresAt: null,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to check course access" },
      { status: 500 },
    );
  }
}
