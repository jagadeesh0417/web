import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, emailTemplatesStore, auditLog } from "@/lib/data/server-store";
import type { EmailTemplate } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  variables: z.array(z.string()).optional().default([]),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function GET() {
  const templates = emailTemplatesStore.getAll();
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  const template: EmailTemplate = {
    id: `etpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    subject: data.subject,
    body: data.body,
    variables: data.variables,
    status: data.status,
    updatedAt: now,
  };

  emailTemplatesStore.create(template);
  auditLog("create", "email-template", `Created template: ${template.name}`, auth.user.id, template.id);

  return NextResponse.json(template, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();
  const parsed = templateSchema.extend({ id: z.string().min(1) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = emailTemplatesStore.getById(data.id);
  if (!existing) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const updated = emailTemplatesStore.update(data.id, {
    name: data.name,
    subject: data.subject,
    body: data.body,
    variables: data.variables,
    status: data.status,
    updatedAt: new Date().toISOString(),
  });

  auditLog("update", "email-template", `Updated template: ${updated?.name}`, auth.user.id, data.id);

  return NextResponse.json(updated);
}
