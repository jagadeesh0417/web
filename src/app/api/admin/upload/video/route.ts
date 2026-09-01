import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { uploadVideo } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const isDemoMode = !process.env.CLOUDINARY_CLOUD_NAME;

  try {
    const formData = await request.formData();

    if (isDemoMode) {
      const driveUrl = formData.get("driveUrl") as string | null;
      if (!driveUrl) {
        return NextResponse.json(
          { ok: false, error: "driveUrl is required in demo mode" },
          { status: 400 },
        );
      }

      const db = await getDb();
      const now = new Date();
      const result = await db.collection(COLLECTIONS.videos).insertOne({
        lessonId: new ObjectId(),
        moduleId: new ObjectId(),
        courseId: new ObjectId(),
        title: (formData.get("title") as string) || "Untitled Video",
        description: (formData.get("description") as string) || "",
        cloudinaryPublicId: "",
        cloudinaryUrl: driveUrl,
        thumbnailUrl: "",
        duration: 0,
        sortOrder: 0,
        status: "DRAFT",
        createdAt: now,
        updatedAt: now,
      });

      const video = {
        id: result.insertedId.toString(),
        cloudinaryPublicId: "",
        cloudinaryUrl: driveUrl,
        duration: 0,
      };

      await db.collection(COLLECTIONS.auditLogs).insertOne({
        adminId: new ObjectId(auth.userId),
        action: "upload.video",
        targetType: "videos",
        targetId: result.insertedId,
        previousValue: null,
        newValue: { cloudinaryUrl: driveUrl },
        createdAt: now,
      });

      return NextResponse.json({ ok: true, video });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No video file provided" },
        { status: 400 },
      );
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Invalid file type. Allowed: mp4, webm, quicktime" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = (formData.get("folder") as string) || "general";

    const uploaded = await uploadVideo(buffer, folder);

    const db = await getDb();
    const now = new Date();
    const result = await db.collection(COLLECTIONS.videos).insertOne({
      lessonId: new ObjectId(),
      moduleId: new ObjectId(),
      courseId: new ObjectId(),
      title: (formData.get("title") as string) || file.name,
      description: (formData.get("description") as string) || "",
      cloudinaryPublicId: uploaded.publicId,
      cloudinaryUrl: uploaded.url,
      thumbnailUrl: "",
      duration: uploaded.duration,
      sortOrder: 0,
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
    });

    const video = {
      id: result.insertedId.toString(),
      cloudinaryPublicId: uploaded.publicId,
      cloudinaryUrl: uploaded.url,
      duration: uploaded.duration,
    };

    await db.collection(COLLECTIONS.auditLogs).insertOne({
      adminId: new ObjectId(auth.userId),
      action: "upload.video",
      targetType: "videos",
      targetId: result.insertedId,
      previousValue: null,
      newValue: { cloudinaryPublicId: uploaded.publicId, cloudinaryUrl: uploaded.url },
      createdAt: now,
    });

    return NextResponse.json({ ok: true, video });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload video" },
      { status: 500 },
    );
  }
}
