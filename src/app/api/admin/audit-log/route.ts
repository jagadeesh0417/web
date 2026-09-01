import { NextResponse, type NextRequest } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
  const actionFilter = searchParams.get("action")?.trim() ?? "";
  const targetTypeFilter = searchParams.get("targetType")?.trim() ?? "";

  const db = await getDb();

  const filter: Record<string, unknown> = {};
  if (actionFilter) {
    filter.action = actionFilter;
  }
  if (targetTypeFilter) {
    filter.targetType = targetTypeFilter;
  }

  const total = await db.collection(COLLECTIONS.auditLogs).countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const logs = await db
    .collection(COLLECTIONS.auditLogs)
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const result = logs.map((log) => ({
    id: log._id.toString(),
    adminId: log.adminId?.toString(),
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId?.toString(),
    previousValue: log.previousValue,
    newValue: log.newValue,
    createdAt: log.createdAt,
  }));

  return NextResponse.json({
    ok: true,
    logs: result,
    total,
    page,
    totalPages,
  });
}
