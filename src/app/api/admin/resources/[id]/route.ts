import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, resourcesStore, auditLog } from "@/lib/data/server-store";
import type { Resource } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["pdf", "document", "link", "file"]).optional(),
  url: z.string().min(1).max(500).optional(),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(_request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const resource = resourcesStore.getById(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json(resource);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const existing = resourcesStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateResourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.title !== undefined) {
    patch.name = parsed.data.title;
  }
  if (parsed.data.type !== undefined) {
    const typeMap: Record<string, string> = {
      pdf: "pdf",
      document: "doc",
      link: "link",
      file: "file",
    };
    patch.type = typeMap[parsed.data.type] ?? parsed.data.type;
  }
  if (parsed.data.status !== undefined) {
    patch.resourceStatus = parsed.data.status;
  }

  const updated = resourcesStore.update(id, patch as Partial<Resource>);
  auditLog("update", "resource", `Updated resource: ${id}`, auth.user.id, id);

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const existing = resourcesStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  resourcesStore.update(id, { resourceStatus: "archived" } as unknown as Partial<Resource>);
  auditLog("delete", "resource", `Soft deleted resource: ${id}`, auth.user.id, id);

  return NextResponse.json({ success: true });
}
