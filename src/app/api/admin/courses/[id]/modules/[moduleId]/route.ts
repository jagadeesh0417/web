import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export async function PUT(
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

    const existing = await db
      .collection(COLLECTIONS.modules)
      .findOne({ _id: moduleObjectId, courseId: courseObjectId });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Module not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updateDoc: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };

    await db
      .collection(COLLECTIONS.modules)
      .updateOne({ _id: moduleObjectId }, { $set: updateDoc });

    const updated = await db
      .collection(COLLECTIONS.modules)
      .findOne({ _id: moduleObjectId });

    return NextResponse.json({ ok: true, module: updated });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to update module" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  const auth = await requireAdmin(_request);
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

    const existing = await db
      .collection(COLLECTIONS.modules)
      .findOne({ _id: moduleObjectId, courseId: courseObjectId });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Module not found" },
        { status: 404 },
      );
    }

    await db
      .collection(COLLECTIONS.modules)
      .updateOne(
        { _id: moduleObjectId },
        { $set: { status: "ARCHIVED", updatedAt: new Date() } },
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to delete module" },
      { status: 500 },
    );
  }
}
