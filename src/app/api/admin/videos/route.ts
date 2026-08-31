import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import {
  seedInitialData,
  videosStore,
  auditLog,
} from "@/lib/data/server-store";
import {
  validateGoogleDriveUrl,
  generateDriveEmbedUrl,
} from "@/lib/utils/google-drive";
import type { Video } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  driveUrl: z.string().url("Must be a valid URL"),
  moduleId: z.string().min(1, "Module ID is required"),
  lessonOrder: z.number().int().min(0),
  duration: z.string().max(20).optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20),
  );

  let videos = videosStore.getAll();

  if (moduleId) {
    videos = videos.filter((v) => v.moduleId === moduleId);
  }

  if (status) {
    videos = videos.filter((v) => v.status === status);
  }

  videos.sort((a, b) => a.lessonOrder - b.lessonOrder);

  const total = videos.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paged = videos.slice(offset, offset + limit);

  return NextResponse.json({
    videos: paged,
    total,
    page,
    totalPages,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();
  const parsed = createVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { driveUrl } = parsed.data;
  const driveValidation = validateGoogleDriveUrl(driveUrl);
  if (!driveValidation.valid) {
    return NextResponse.json(
      { error: driveValidation.error },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  const video: Video = {
    id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    driveUrl: driveUrl.trim(),
    driveFileId: driveValidation.fileId!,
    embedUrl: generateDriveEmbedUrl(driveValidation.fileId!),
    moduleId: parsed.data.moduleId,
    lessonOrder: parsed.data.lessonOrder,
    duration: parsed.data.duration,
    status: parsed.data.status,
    createdAt: now,
    updatedAt: now,
  };

  videosStore.create(video);
  auditLog(
    "create",
    "video",
    `Created video: ${video.title}`,
    auth.user.id,
    video.id,
  );

  return NextResponse.json(video, { status: 201 });
}
