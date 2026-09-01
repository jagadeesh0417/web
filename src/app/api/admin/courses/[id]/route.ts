import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  thumbnail: z.string().optional(),
  banner: z.string().optional(),
  category: z.string().min(1).max(100).optional(),
  duration: z.string().min(1).max(50).optional(),
  level: z.string().min(1).max(50).optional(),
  price: z.number().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const db = await getDb();

    let course;
    try {
      course = await db
        .collection(COLLECTIONS.courses)
        .findOne({ _id: new ObjectId(id) });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    if (!course) {
      return NextResponse.json(
        { ok: false, error: "Course not found" },
        { status: 404 },
      );
    }

    const courseId = course._id;

    const modules = await db
      .collection(COLLECTIONS.modules)
      .find({ courseId })
      .sort({ sortOrder: 1 })
      .toArray();

    const moduleIds = modules.map((m) => m._id);

    const lessons = await db
      .collection(COLLECTIONS.lessons)
      .find({ moduleId: { $in: moduleIds } })
      .sort({ sortOrder: 1 })
      .toArray();

    const lessonsByModule = new Map<string, typeof lessons>();
    for (const lesson of lessons) {
      const key = lesson.moduleId.toString();
      if (!lessonsByModule.has(key)) lessonsByModule.set(key, []);
      lessonsByModule.get(key)!.push(lesson);
    }

    const modulesWithLessons = modules.map((mod) => ({
      ...mod,
      lessons: lessonsByModule.get(mod._id.toString()) || [],
    }));

    return NextResponse.json({
      ok: true,
      course: { ...course, modules: modulesWithLessons },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const db = await getDb();

    let existing;
    try {
      existing = await db
        .collection(COLLECTIONS.courses)
        .findOne({ _id: new ObjectId(id) });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Course not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await db
        .collection(COLLECTIONS.courses)
        .findOne({ slug: data.slug, _id: { $ne: existing._id } });
      if (slugTaken) {
        return NextResponse.json(
          { ok: false, error: "A course with this slug already exists" },
          { status: 409 },
        );
      }
    }

    const updateDoc: Record<string, unknown> = { ...data, updatedAt: new Date() };

    await db
      .collection(COLLECTIONS.courses)
      .updateOne({ _id: existing._id }, { $set: updateDoc });

    const updated = await db
      .collection(COLLECTIONS.courses)
      .findOne({ _id: existing._id });

    return NextResponse.json({ ok: true, course: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to update course" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const db = await getDb();

    let existing;
    try {
      existing = await db
        .collection(COLLECTIONS.courses)
        .findOne({ _id: new ObjectId(id) });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Course not found" },
        { status: 404 },
      );
    }

    await db
      .collection(COLLECTIONS.courses)
      .updateOne(
        { _id: existing._id },
        { $set: { status: "ARCHIVED", updatedAt: new Date() } },
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to archive course" },
      { status: 500 },
    );
  }
}
