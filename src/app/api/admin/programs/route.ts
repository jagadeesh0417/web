import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, programsStore, auditLog } from "@/lib/data/server-store";
import type { InternshipProgram } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const programSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  duration: z.string().min(1).max(50),
  price: z.number().min(0),
  featured: z.boolean().optional().default(false),
  features: z.array(z.string()).optional().default([]),
  modules: z.array(z.string()).optional().default([]),
  projects: z.number().min(0).optional().default(0),
  assessmentPassingScore: z.number().min(0).max(100).optional().default(70),
  certificateIncluded: z.boolean().optional().default(true),
  mentorshipIncluded: z.boolean().optional().default(true),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function GET() {
  const programs = programsStore.getAll();
  return NextResponse.json(programs);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();
  const parsed = programSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = programsStore.findOne((p) => p.slug === data.slug);
  if (existing) {
    return NextResponse.json(
      { error: "A program with this slug already exists" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const program: InternshipProgram = {
    id: `prog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    slug: data.slug,
    title: data.title,
    description: data.description,
    duration: data.duration,
    price: data.price,
    featured: data.featured,
    features: data.features,
    modules: data.modules,
    projects: data.projects,
    assessmentPassingScore: data.assessmentPassingScore,
    certificateIncluded: data.certificateIncluded,
    mentorshipIncluded: data.mentorshipIncluded,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  };

  programsStore.create(program);
  auditLog("create", "program", `Created program: ${program.title}`, auth.user.id, program.id);

  return NextResponse.json(program, { status: 201 });
}
