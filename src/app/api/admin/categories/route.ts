import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, categoriesStore, auditLog } from "@/lib/data/server-store";
import type { InternshipCategory } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const categorySchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  icon: z.string().min(1).max(50),
  gradient: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  learningOutcomes: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  prerequisites: z.array(z.string()).optional().default([]),
  faqs: z.array(faqSchema).optional().default([]),
  mentorId: z.string().min(1),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function GET() {
  const categories = categoriesStore.getAll();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const existing = categoriesStore.findOne((c) => c.slug === data.slug);
  if (existing) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const category: InternshipCategory = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    slug: data.slug,
    name: data.name,
    icon: data.icon,
    gradient: data.gradient,
    description: data.description,
    learningOutcomes: data.learningOutcomes,
    skills: data.skills,
    prerequisites: data.prerequisites,
    faqs: data.faqs,
    mentorId: data.mentorId,
    status: data.status,
    createdAt: now,
  };

  categoriesStore.create(category);
  auditLog("create", "category", `Created category: ${category.name}`, auth.user.id, category.id);

  return NextResponse.json(category, { status: 201 });
}
