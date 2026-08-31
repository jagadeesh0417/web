import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, modulesStore, lessonsStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  duration: z.number().min(1),
  videoUrl: z.string().optional(),
  notes: z.string().optional().default(""),
  learningObjectives: z.array(z.string()).optional().default([]),
  type: z.enum(["video", "reading", "live-recording"]).optional().default("video"),
});

const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  categorySlug: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
  lessons: z.array(lessonSchema).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(_request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const mod = modulesStore.getById(id);
  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const lessons = lessonsStore.find((l) => mod.lessons?.some((ml) => ml.id === l.id));

  return NextResponse.json({ ...mod, lessons });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const existing = modulesStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateModuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { ...parsed.data, updatedAt: now };

  if (parsed.data.lessons) {
    patch.lessons = parsed.data.lessons.map((l, i) => ({
      id: l.id ?? `les_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      title: l.title,
      duration: l.duration,
      videoUrl: l.videoUrl,
      notes: l.notes,
      learningObjectives: l.learningObjectives,
      type: l.type,
    }));
  }

  const updated = modulesStore.update(id, patch as Record<string, unknown>);
  auditLog("update", "module", `Updated module: ${id}`, auth.user.id, id);

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const existing = modulesStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  modulesStore.update(id, { status: "archived" } as Record<string, unknown>);
  auditLog("delete", "module", `Soft deleted module: ${id}`, auth.user.id, id);

  return NextResponse.json({ success: true });
}
