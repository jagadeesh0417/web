import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, plansStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updatePlanSchema = z.object({
  programId: z.string().min(1).optional(),
  name: z.string().min(1).max(200).optional(),
  duration: z.string().min(1).max(50).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().min(1).max(10).optional(),
  description: z.string().min(1).max(2000).optional(),
  features: z.array(z.string()).optional(),
  modules: z.array(z.string()).optional(),
  projects: z.number().min(0).optional(),
  assessmentRequired: z.boolean().optional(),
  certificateIncluded: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await seedInitialData();
  const { id } = await params;
  const plan = plansStore.getById(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }
  return NextResponse.json(plan);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();
  const { id } = await params;
  const existing = plansStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const patch = { ...parsed.data, updatedAt: new Date().toISOString() };
  const updated = plansStore.update(id, patch);
  auditLog("update", "plan", `Updated plan: ${updated?.name}`, auth.user.id, id);

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
  const existing = plansStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  plansStore.update(id, { status: "inactive", updatedAt: new Date().toISOString() });
  auditLog("delete", "plan", `Soft-deleted plan: ${existing.name}`, auth.user.id, id);

  return NextResponse.json({ id, status: "inactive" });
}
