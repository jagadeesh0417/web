import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const lessonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sortOrder: z.number().int().min(0).optional().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id, moduleId } = await params;
    const db = await getDb();

    let courseObjectId;
    let moduleObjectId;
    try {
      courseObjectId = new ObjectId(id);
      moduleObjectId = new ObjectId(moduleId);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid ID format" },
        { status: 400 },
      );
    }

    const moduleDoc = await db
      .collection(COLLECTIONS.modules)
      .findOne({ _id: moduleObjectId, courseId: courseObjectId });
    if (!moduleDoc) {
      return NextResponse.json(
        { ok: false, error: "Module not found" },
        { status: 404 },
      );
    }

    const lessons = await db
      .collection(COLLECTIONS.lessons)
      .find({ moduleId: moduleObjectId })
      .sort({ sortOrder: 1 })
      .toArray();

    return NextResponse.json({ ok: true, lessons });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch lessons" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id, moduleId } = await params;
    const db = await getDb();

    let courseObjectId;
    let moduleObjectId;
    try {
      courseObjectId = new ObjectId(id);
      moduleObjectId = new ObjectId(moduleId);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid ID format" },
        { status: 400 },
      );
    }

    const moduleDoc = await db
      .collection(COLLECTIONS.modules)
      .findOne({ _id: moduleObjectId, courseId: courseObjectId });
    if (!moduleDoc) {
      return NextResponse.json(
        { ok: false, error: "Module not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const now = new Date();

    const lessonDoc = {
      moduleId: moduleObjectId,
      courseId: courseObjectId,
      title: data.title,
      description: data.description,
      sortOrder: data.sortOrder,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db
      .collection(COLLECTIONS.lessons)
      .insertOne(lessonDoc);

    return NextResponse.json(
      { ok: true, lesson: { _id: result.insertedId, ...lessonDoc } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to create lesson" },
      { status: 500 },
    );
  }
}
