import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, plansStore, auditLog } from "@/lib/data/server-store";
import type { Plan } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const planSchema = z.object({
  programId: z.string().min(1),
  name: z.string().min(1).max(200),
  duration: z.string().min(1).max(50),
  price: z.number().min(0),
  currency: z.string().min(1).max(10).optional().default("INR"),
  description: z.string().min(1).max(2000),
  features: z.array(z.string()).optional().default([]),
  modules: z.array(z.string()).optional().default([]),
  projects: z.number().min(0).optional().default(0),
  assessmentRequired: z.boolean().optional().default(true),
  certificateIncluded: z.boolean().optional().default(true),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function GET() {
  const plans = plansStore.getAll();
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  const plan: Plan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    programId: data.programId,
    name: data.name,
    duration: data.duration,
    price: data.price,
    currency: data.currency,
    description: data.description,
    features: data.features,
    modules: data.modules,
    projects: data.projects,
    assessmentRequired: data.assessmentRequired,
    certificateIncluded: data.certificateIncluded,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  };

  plansStore.create(plan);
  auditLog("create", "plan", `Created plan: ${plan.name}`, auth.user.id, plan.id);

  return NextResponse.json(plan, { status: 201 });
}
