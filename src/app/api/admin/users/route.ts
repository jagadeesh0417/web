import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const role = searchParams.get("role")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
  const sortField = searchParams.get("sort")?.trim() || "createdAt";
  const sortOrder = searchParams.get("order")?.trim().toLowerCase() === "asc" ? 1 : -1;

  const db = await getDb();

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.accountStatus = status;
  }

  const total = await db.collection(COLLECTIONS.users).countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const sortKey = sortField === "name" || sortField === "email" || sortField === "createdAt" || sortField === "role"
    ? sortField
    : "createdAt";

  const users = await db
    .collection(COLLECTIONS.users)
    .find(filter)
    .sort({ [sortKey]: sortOrder })
    .skip(skip)
    .limit(limit)
    .toArray();

  const userIds = users.map((u) => u._id);

  const enrollmentCounts = (await db
    .collection(COLLECTIONS.subscriptions)
    .aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ])
    .toArray()) as Array<{ _id: ObjectId; count: number }>;

  const purchaseCounts = (await db
    .collection(COLLECTIONS.purchases)
    .aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ])
    .toArray()) as Array<{ _id: ObjectId; count: number }>;

  const enrollmentMap = new Map(
    enrollmentCounts.map((e) => [e._id.toString(), e.count]),
  );
  const purchaseMap = new Map(
    purchaseCounts.map((p) => [p._id.toString(), p.count]),
  );

  const result = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    accountStatus: u.accountStatus,
    walletBalance: u.walletBalance ?? 0,
    createdAt: u.createdAt,
    enrollmentCount: enrollmentMap.get(u._id.toString()) ?? 0,
    purchaseCount: purchaseMap.get(u._id.toString()) ?? 0,
  }));

  return NextResponse.json({
    ok: true,
    users: result,
    total,
    page,
    totalPages,
  });
}
