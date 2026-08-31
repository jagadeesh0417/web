import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, tasksStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  instructions: z.string().optional(),
  moduleId: z.string().optional(),
  categorySlug: z.string().optional(),
  week: z.number().int().min(0).optional(),
  deadline: z.string().optional(),
  deadlineDays: z.number().int().min(1).optional(),
  maxScore: z.number().int().min(0).optional(),
  submissionTypes: z.array(z.string()).optional(),
  linkTypes: z.array(z.enum(["drive", "github", "figma", "canva", "other"])).optional(),
  requiredResources: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(_request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const task = tasksStore.getById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const existing = tasksStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { ...parsed.data, updatedAt: now };

  if (parsed.data.instructions !== undefined) {
    patch.instructions = [parsed.data.instructions];
  }
  if (parsed.data.status !== undefined) {
    patch.status = "open";
    patch.taskStatus = parsed.data.status;
  }

  const updated = tasksStore.update(id, patch);
  auditLog("update", "task", `Updated task: ${id}`, auth.user.id, id);

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const existing = tasksStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  tasksStore.update(id, { status: "closed" });
  auditLog("delete", "task", `Soft deleted task: ${id}`, auth.user.id, id);

  return NextResponse.json({ success: true });
}
