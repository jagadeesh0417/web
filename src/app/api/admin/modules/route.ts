import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, modulesStore, auditLog } from "@/lib/data/server-store";
import type { CollectionTypeMap } from "@/lib/data/server-store";

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

const moduleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  categorySlug: z.string().min(1).max(100),
  order: z.number().int().min(0),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  lessons: z.array(lessonSchema).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug")?.trim() ?? "";

  let modules = modulesStore.getAll();

  if (categorySlug) {
    modules = modules.filter((m) => m.categorySlug === categorySlug);
  }

  modules.sort((a, b) => a.order - b.order);

  return NextResponse.json(modules);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const body = await request.json();
  const parsed = moduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  const mod = {
    id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    categorySlug: data.categorySlug,
    title: data.title,
    order: data.order,
    week: data.order,
    description: data.description,
    lessons: data.lessons.map((l, i) => ({
      id: l.id ?? `les_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      title: l.title,
      duration: l.duration,
      videoUrl: l.videoUrl,
      notes: l.notes,
      learningObjectives: l.learningObjectives,
      type: l.type,
    })),
    quiz: [],
    requiresPrevious: false,
    resources: [],
    status: data.status,
    createdAt: now,
    updatedAt: now,
  };

  modulesStore.create(mod as CollectionTypeMap["modules"]);
  auditLog("create", "module", `Created module: ${mod.title}`, auth.user.id, mod.id);

  return NextResponse.json(mod, { status: 201 });
}
