import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { uploadPdf } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const isDemoMode = !process.env.CLOUDINARY_CLOUD_NAME;

  try {
    const formData = await request.formData();

    if (isDemoMode) {
      const url = formData.get("url") as string | null;
      if (!url) {
        return NextResponse.json(
          { ok: false, error: "url is required in demo mode" },
          { status: 400 },
        );
      }

      const db = await getDb();
      const now = new Date();
      const result = await db.collection(COLLECTIONS.pdfs).insertOne({
        lessonId: new ObjectId(),
        moduleId: new ObjectId(),
        courseId: new ObjectId(),
        title: (formData.get("title") as string) || "Untitled PDF",
        description: (formData.get("description") as string) || "",
        cloudinaryPublicId: "",
        cloudinaryUrl: url,
        fileSize: 0,
        sortOrder: 0,
        status: "DRAFT",
        createdAt: now,
        updatedAt: now,
      });

      const pdf = {
        id: result.insertedId.toString(),
        cloudinaryPublicId: "",
        cloudinaryUrl: url,
        fileSize: 0,
      };

      await db.collection(COLLECTIONS.auditLogs).insertOne({
        adminId: new ObjectId(auth.userId),
        action: "upload.pdf",
        targetType: "pdfs",
        targetId: result.insertedId,
        previousValue: null,
        newValue: { cloudinaryUrl: url },
        createdAt: now,
      });

      return NextResponse.json({ ok: true, pdf });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No PDF file provided" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { ok: false, error: "Invalid file type. Only PDF is allowed" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = (formData.get("folder") as string) || "general";
    const filename = file.name.replace(/\.pdf$/i, "");

    const uploaded = await uploadPdf(buffer, folder, filename);

    const db = await getDb();
    const now = new Date();
    const result = await db.collection(COLLECTIONS.pdfs).insertOne({
      lessonId: new ObjectId(),
      moduleId: new ObjectId(),
      courseId: new ObjectId(),
      title: (formData.get("title") as string) || file.name,
      description: (formData.get("description") as string) || "",
      cloudinaryPublicId: uploaded.publicId,
      cloudinaryUrl: uploaded.url,
      fileSize: uploaded.size,
      sortOrder: 0,
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
    });

    const pdf = {
      id: result.insertedId.toString(),
      cloudinaryPublicId: uploaded.publicId,
      cloudinaryUrl: uploaded.url,
      fileSize: uploaded.size,
    };

    await db.collection(COLLECTIONS.auditLogs).insertOne({
      adminId: new ObjectId(auth.userId),
      action: "upload.pdf",
      targetType: "pdfs",
      targetId: result.insertedId,
      previousValue: null,
      newValue: { cloudinaryPublicId: uploaded.publicId, cloudinaryUrl: uploaded.url },
      createdAt: now,
    });

    return NextResponse.json({ ok: true, pdf });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload PDF" },
      { status: 500 },
    );
  }
}
