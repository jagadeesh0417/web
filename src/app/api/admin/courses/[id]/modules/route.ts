import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const moduleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sortOrder: z.number().int().min(0).optional().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
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

    let courseId;
    try {
      courseId = new ObjectId(id);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    const course = await db
      .collection(COLLECTIONS.courses)
      .findOne({ _id: courseId });
    if (!course) {
      return NextResponse.json(
        { ok: false, error: "Course not found" },
        { status: 404 },
      );
    }

    const modules = await db
      .collection(COLLECTIONS.modules)
      .find({ courseId })
      .sort({ sortOrder: 1 })
      .toArray();

    return NextResponse.json({ ok: true, modules });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch modules" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const db = await getDb();

    let courseId;
    try {
      courseId = new ObjectId(id);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    const course = await db
      .collection(COLLECTIONS.courses)
      .findOne({ _id: courseId });
    if (!course) {
      return NextResponse.json(
        { ok: false, error: "Course not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = moduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const now = new Date();

    const moduleDoc = {
      courseId,
      title: data.title,
      description: data.description,
      sortOrder: data.sortOrder,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db
      .collection(COLLECTIONS.modules)
      .insertOne(moduleDoc);

    return NextResponse.json(
      { ok: true, module: { _id: result.insertedId, ...moduleDoc } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to create module" },
      { status: 500 },
    );
  }
}
