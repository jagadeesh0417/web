import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id, moduleId, lessonId } = await params;
    const db = await getDb();

    let courseObjectId;
    let moduleObjectId;
    let lessonObjectId;
    try {
      courseObjectId = new ObjectId(id);
      moduleObjectId = new ObjectId(moduleId);
      lessonObjectId = new ObjectId(lessonId);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid ID format" },
        { status: 400 },
      );
    }

    const existing = await db
      .collection(COLLECTIONS.lessons)
      .findOne({
        _id: lessonObjectId,
        moduleId: moduleObjectId,
        courseId: courseObjectId,
      });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Lesson not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updateDoc: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };

    await db
      .collection(COLLECTIONS.lessons)
      .updateOne({ _id: lessonObjectId }, { $set: updateDoc });

    const updated = await db
      .collection(COLLECTIONS.lessons)
      .findOne({ _id: lessonObjectId });

    return NextResponse.json({ ok: true, lesson: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to update lesson" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> },
) {
  const auth = await requireAdmin(_request);
  if ("error" in auth) return auth.error;

  try {
    const { id, moduleId, lessonId } = await params;
    const db = await getDb();

    let courseObjectId;
    let moduleObjectId;
    let lessonObjectId;
    try {
      courseObjectId = new ObjectId(id);
      moduleObjectId = new ObjectId(moduleId);
      lessonObjectId = new ObjectId(lessonId);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid ID format" },
        { status: 400 },
      );
    }

    const existing = await db
      .collection(COLLECTIONS.lessons)
      .findOne({
        _id: lessonObjectId,
        moduleId: moduleObjectId,
        courseId: courseObjectId,
      });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Lesson not found" },
        { status: 404 },
      );
    }

    await db
      .collection(COLLECTIONS.lessons)
      .updateOne(
        { _id: lessonObjectId },
        { $set: { status: "ARCHIVED", updatedAt: new Date() } },
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to delete lesson" },
      { status: 500 },
    );
  }
}
