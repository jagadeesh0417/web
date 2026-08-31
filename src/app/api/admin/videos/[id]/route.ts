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

const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  driveUrl: z.string().url("Must be a valid URL").optional(),
  moduleId: z.string().min(1).optional(),
  lessonOrder: z.number().int().min(0).optional(),
  duration: z.string().max(20).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { id } = await params;
  const video = videosStore.getById(id);
  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json(video);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { id } = await params;
  const existing = videosStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const patch: Partial<Video> = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  if (parsed.data.driveUrl) {
    const driveValidation = validateGoogleDriveUrl(parsed.data.driveUrl);
    if (!driveValidation.valid) {
      return NextResponse.json(
        { error: driveValidation.error },
        { status: 400 },
      );
    }
    patch.driveUrl = parsed.data.driveUrl.trim();
    patch.driveFileId = driveValidation.fileId!;
    patch.embedUrl = generateDriveEmbedUrl(driveValidation.fileId!);
  }

  const updated = videosStore.update(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  auditLog(
    "update",
    "video",
    `Updated video: ${updated.title}`,
    auth.user.id,
    updated.id,
  );

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { id } = await params;
  const existing = videosStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const archived: Partial<Video> = {
    status: "draft" as const,
    updatedAt: new Date().toISOString(),
  };

  const updated = videosStore.update(id, archived);
  if (!updated) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  auditLog(
    "archive",
    "video",
    `Archived video: ${updated.title}`,
    auth.user.id,
    updated.id,
  );

  return NextResponse.json({ success: true, video: updated });
}
