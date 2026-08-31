import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, programsStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateProgramSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  duration: z.string().min(1).max(50).optional(),
  price: z.number().min(0).optional(),
  featured: z.boolean().optional(),
  features: z.array(z.string()).optional(),
  modules: z.array(z.string()).optional(),
  projects: z.number().min(0).optional(),
  assessmentPassingScore: z.number().min(0).max(100).optional(),
  certificateIncluded: z.boolean().optional(),
  mentorshipIncluded: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(_request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { id } = await params;
  const program = programsStore.getById(id);
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { id } = await params;
  const existing = programsStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateProgramSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.slug && data.slug !== existing.slug) {
    const slugTaken = programsStore.findOne((p) => p.slug === data.slug && p.id !== id);
    if (slugTaken) {
      return NextResponse.json(
        { error: "A program with this slug already exists" },
        { status: 409 },
      );
    }
  }

  const patch = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const updated = programsStore.update(id, patch);
  auditLog("update", "program", `Updated program: ${updated?.title}`, auth.user.id, id);

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(_request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { id } = await params;
  const existing = programsStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const updated = programsStore.update(id, {
    status: "inactive",
    updatedAt: new Date().toISOString(),
  });

  auditLog("delete", "program", `Soft-deleted program: ${existing.title}`, auth.user.id, id);

  return NextResponse.json(updated);
}
