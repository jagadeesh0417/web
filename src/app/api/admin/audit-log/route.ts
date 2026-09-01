import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, auditLogStore } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const actionFilter = searchParams.get("action") ?? undefined;

  let logs = auditLogStore.getAll();

  if (actionFilter) {
    logs = logs.filter((log) => log.action === actionFilter);
  }

  logs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const total = logs.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedLogs = logs.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    logs: paginatedLogs,
    total,
    page,
    totalPages,
  });
}
