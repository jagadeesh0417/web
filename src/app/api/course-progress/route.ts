import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateProgressSchema = z.object({
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  lessonId: z.string().min(1),
  videoId: z.string().optional().default(""),
  completed: z.boolean().optional().default(false),
  watchProgress: z.number().min(0).max(100).optional().default(0),
  lastWatched: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  try {
    const db = await getDb();
    const userId = new ObjectId(auth.userId);

    const filter: Record<string, unknown> = { userId };
    if (courseId) {
      try {
        filter.courseId = new ObjectId(courseId);
      } catch {
        return NextResponse.json(
          { ok: false, error: "Invalid courseId format" },
          { status: 400 },
        );
      }
    }

    const progressCollection = db.collection("courseProgress");
    const progress = await progressCollection
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, progress });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = updateProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  let courseIdObj;
  let moduleIdObj;
  let lessonIdObj;
  try {
    courseIdObj = new ObjectId(data.courseId);
    moduleIdObj = new ObjectId(data.moduleId);
    lessonIdObj = new ObjectId(data.lessonId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid ID format" },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();
    const userId = new ObjectId(auth.userId);
    const now = new Date();

    const progressCollection = db.collection("courseProgress");

    const existing = await progressCollection.findOne({
      userId,
      courseId: courseIdObj,
      moduleId: moduleIdObj,
      lessonId: lessonIdObj,
    });

    const updateDoc = {
      userId,
      courseId: courseIdObj,
      moduleId: moduleIdObj,
      lessonId: lessonIdObj,
      videoId: data.videoId,
      completed: data.completed,
      watchProgress: data.watchProgress,
      lastWatched: data.lastWatched ?? now.toISOString(),
      updatedAt: now,
    };

    if (existing) {
      await progressCollection.updateOne(
        { _id: existing._id },
        { $set: updateDoc },
      );

      return NextResponse.json({
        ok: true,
        progress: { _id: existing._id, ...updateDoc },
      });
    }

    const result = await progressCollection.insertOne({
      ...updateDoc,
      createdAt: now,
    });

    return NextResponse.json(
      { ok: true, progress: { _id: result.insertedId, ...updateDoc, createdAt: now } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to update progress" },
      { status: 500 },
    );
  }
}
