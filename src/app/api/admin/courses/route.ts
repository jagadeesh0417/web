import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const courseSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  thumbnail: z.string().optional().default(""),
  banner: z.string().optional().default(""),
  category: z.string().min(1).max(100),
  duration: z.string().min(1).max(50),
  level: z.string().min(1).max(50),
  price: z.number().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().default("DRAFT"),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const courses = await db
      .collection(COLLECTIONS.courses)
      .find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, courses });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const db = await getDb();

  const existing = await db
    .collection(COLLECTIONS.courses)
    .findOne({ slug: data.slug });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "A course with this slug already exists" },
      { status: 409 },
    );
  }

  const now = new Date();
  const course = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    thumbnail: data.thumbnail,
    banner: data.banner,
    category: data.category,
    duration: data.duration,
    level: data.level,
    price: data.price,
    status: data.status,
    sortOrder: data.sortOrder,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection(COLLECTIONS.courses).insertOne(course);

  return NextResponse.json(
    { ok: true, course: { _id: result.insertedId, ...course } },
    { status: 201 },
  );
}
