import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, tasksStore, auditLog } from "@/lib/data/server-store";
import type { Assignment } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  instructions: z.string().optional().default(""),
  moduleId: z.string().optional().default(""),
  categorySlug: z.string().optional().default(""),
  week: z.number().int().min(0).optional().default(0),
  deadline: z.string().optional().default(""),
  deadlineDays: z.number().int().min(1).optional().default(7),
  maxScore: z.number().int().min(0).optional().default(100),
  submissionTypes: z.array(z.string()).optional().default(["drive_link"]),
  linkTypes: z.array(z.enum(["drive", "github", "figma", "canva", "other"])).optional().default(["drive"]),
  requiredResources: z.array(z.string()).optional().default([]),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId")?.trim() ?? "";
  const categorySlug = searchParams.get("categorySlug")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";

  let tasks = tasksStore.getAll();

  if (moduleId) {
    tasks = tasks.filter((t) => (t as Assignment & { moduleId?: string }).moduleId === moduleId);
  }
  if (categorySlug) {
    tasks = tasks.filter((t) => t.categorySlug === categorySlug);
  }
  if (status) {
    tasks = tasks.filter((t) => (t as Assignment).status === status || t.status === status);
  }

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  const task = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: data.title,
    categorySlug: data.categorySlug,
    description: data.description,
    instructions: [data.instructions],
    deadlineDays: data.deadlineDays,
    maxScore: data.maxScore,
    submissionTypes: data.submissionTypes,
    linkTypes: data.linkTypes,
    status: "open" as const,
    moduleId: data.moduleId,
    week: data.week,
    deadline: data.deadline,
    requiredResources: data.requiredResources,
    taskStatus: data.status,
    createdAt: now,
    updatedAt: now,
  };

  tasksStore.create(task as Assignment);
  auditLog("create", "task", `Created task: ${task.title}`, auth.user.id, task.id);

  return NextResponse.json(task, { status: 201 });
}
