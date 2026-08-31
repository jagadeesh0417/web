import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, resourcesStore, auditLog } from "@/lib/data/server-store";
import type { Resource } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resourceSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["pdf", "document", "link", "file"]),
  url: z.string().min(1).max(500),
  moduleId: z.string().optional().default(""),
  lessonId: z.string().optional(),
  description: z.string().optional().default(""),
  status: z.enum(["active", "archived"]).optional().default("active"),
  createdAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId")?.trim() ?? "";
  const type = searchParams.get("type")?.trim() ?? "";

  let resources = resourcesStore.getAll();

  if (moduleId) {
    resources = resources.filter((r) => r.moduleId === moduleId);
  }
  if (type) {
    resources = resources.filter((r) => r.type === type);
  }

  return NextResponse.json(resources);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const body = await request.json();
  const parsed = resourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();
  const typeMap: Record<string, string> = {
    pdf: "pdf",
    document: "doc",
    link: "link",
    file: "file",
  };

  const resource = {
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: data.title,
    type: typeMap[data.type] ?? data.type,
    url: data.url,
    moduleId: data.moduleId,
    lessonId: data.lessonId,
    description: data.description,
    resourceStatus: data.status,
    createdAt: data.createdAt ?? now,
  };

  resourcesStore.create(resource as Resource);
  auditLog("create", "resource", `Created resource: ${resource.name}`, auth.user.id, resource.id);

  return NextResponse.json(resource, { status: 201 });
}
