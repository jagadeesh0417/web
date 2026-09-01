import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No image file provided" },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Invalid file type. Allowed: jpg, png, webp, gif" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = (formData.get("folder") as string) || "general";

    const uploaded = await uploadImage(buffer, folder);

    return NextResponse.json({
      ok: true,
      image: {
        publicId: uploaded.publicId,
        url: uploaded.url,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
