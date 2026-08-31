import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  resourcesStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const enrollment = enrollmentsStore.findOne(
    (e) => e.userId === auth.user.id,
  );
  if (!enrollment) {
    return NextResponse.json(
      { error: "No enrollment found" },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const moduleId = url.searchParams.get("moduleId");

  let resources = resourcesStore.find(
    (r) => r.categorySlug === enrollment.categorySlug,
  );

  if (moduleId) {
    resources = resources.filter((r) => r.moduleId === moduleId);
  }

  return NextResponse.json({
    resources: resources.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      url: r.url,
      moduleId: r.moduleId ?? null,
      createdAt: r.createdAt,
    })),
  });
}
