import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, categoriesStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateCategorySchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(200).optional(),
  icon: z.string().min(1).max(50).optional(),
  gradient: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).optional(),
  mentorId: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await seedInitialData();
  const { id } = await params;
  const category = categoriesStore.getById(id);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();
  const { id } = await params;
  const existing = categoriesStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (data.slug && data.slug !== existing.slug) {
    const slugTaken = categoriesStore.findOne((c) => c.slug === data.slug && c.id !== id);
    if (slugTaken) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 },
      );
    }
  }

  const updated = categoriesStore.update(id, data);
  auditLog("update", "category", `Updated category: ${updated?.name}`, auth.user.id, id);

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
  const existing = categoriesStore.getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  categoriesStore.update(id, { status: "inactive" });
  auditLog("delete", "category", `Soft-deleted category: ${existing.name}`, auth.user.id, id);

  return NextResponse.json({ id, status: "inactive" });
}
