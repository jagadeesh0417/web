import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import {
  seedInitialData,
  usersStore,
  enrollmentsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const role = searchParams.get("role")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
  const sort = searchParams.get("sort")?.trim() || "createdAt";
  const order = searchParams.get("order")?.trim().toLowerCase() === "asc" ? "asc" : "desc";

  let users = usersStore.getAll();
  const allEnrollments = enrollmentsStore.getAll();

  if (search) {
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.phone?.toLowerCase().includes(search),
    );
  }

  if (role) {
    users = users.filter((u) => u.role === role);
  }

  if (status) {
    if (status === "active") {
      users = users.filter((u) => u.role !== "guest");
    } else if (status === "inactive") {
      users = users.filter((u) => u.role === "guest");
    }
  }

  users.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sort] ?? "";
    const bVal = (b as unknown as Record<string, unknown>)[sort] ?? "";
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  const total = users.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paged = users.slice(offset, offset + limit);

  const usersWithEnrollments = paged.map((user) => {
    const userEnrollments = allEnrollments.filter(
      (e) => e.userId === user.id || e.studentId === user.id,
    );
    const activeEnrollment = userEnrollments.find((e) => e.status === "active") ?? userEnrollments[0];
    return {
      ...user,
      enrollment: activeEnrollment
        ? {
            id: activeEnrollment.id,
            programTitle: activeEnrollment.programTitle,
            categorySlug: activeEnrollment.categorySlug,
            status: activeEnrollment.status,
            durationWeeks: activeEnrollment.durationWeeks,
            startedAt: activeEnrollment.startedAt,
          }
        : null,
      totalEnrollments: userEnrollments.length,
    };
  });

  return NextResponse.json({
    users: usersWithEnrollments,
    total,
    page,
    totalPages,
  });
}
