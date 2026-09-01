import { NextResponse, type NextRequest } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AggBucket {
  _id: string;
  count: number;
  amount: number;
  rewardAmount?: number;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const db = await getDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalUsers, newUsersThisMonth, activeUsers] = await Promise.all([
    db.collection(COLLECTIONS.users).countDocuments({}),
    db.collection(COLLECTIONS.users).countDocuments({ createdAt: { $gte: startOfMonth } }),
    db.collection(COLLECTIONS.users).countDocuments({ accountStatus: "ACTIVE" }),
  ]);

  const [totalCourses, publishedCourses, draftCourses] = await Promise.all([
    db.collection(COLLECTIONS.courses).countDocuments({}),
    db.collection(COLLECTIONS.courses).countDocuments({ status: "PUBLISHED" }),
    db.collection(COLLECTIONS.courses).countDocuments({ status: "DRAFT" }),
  ]);

  const purchasesAll = await db
    .collection(COLLECTIONS.purchases)
    .aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                amount: { $sum: "$amountPaid" },
              },
            },
          ],
          todayRevenue: [
            { $match: { createdAt: { $gte: startOfDay }, status: "PAID" } },
            { $group: { _id: null, amount: { $sum: "$amountPaid" } } },
          ],
          monthRevenue: [
            { $match: { createdAt: { $gte: startOfMonth }, status: "PAID" } },
            { $group: { _id: null, amount: { $sum: "$amountPaid" } } },
          ],
          totalRevenue: [
            { $match: { status: "PAID" } },
            { $group: { _id: null, amount: { $sum: "$amountPaid" } } },
          ],
        },
      },
    ])
    .toArray();

  const purchaseAgg = purchasesAll[0] as {
    totals: AggBucket[];
    todayRevenue: Array<{ amount: number }>;
    monthRevenue: Array<{ amount: number }>;
    totalRevenue: Array<{ amount: number }>;
  };

  const purchaseStats = {
    total: purchaseAgg.totals.reduce((sum, s) => sum + s.count, 0),
    paid: purchaseAgg.totals.find((s) => s._id === "PAID")?.count ?? 0,
    pending: purchaseAgg.totals.find((s) => s._id === "PENDING")?.count ?? 0,
    failed: purchaseAgg.totals.find((s) => s._id === "FAILED")?.count ?? 0,
  };

  const revenueStats = {
    today: purchaseAgg.todayRevenue[0]?.amount ?? 0,
    thisMonth: purchaseAgg.monthRevenue[0]?.amount ?? 0,
    total: purchaseAgg.totalRevenue[0]?.amount ?? 0,
  };

  const [activeSubscriptions, expiredSubscriptions] = await Promise.all([
    db.collection(COLLECTIONS.subscriptions).countDocuments({ status: "ACTIVE" }),
    db.collection(COLLECTIONS.subscriptions).countDocuments({ status: "EXPIRED" }),
  ]);

  const referralAgg = (await db
    .collection(COLLECTIONS.referrals)
    .aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          rewardAmount: { $sum: "$rewardAmount" },
        },
      },
    ])
    .toArray()) as AggBucket[];

  const referralStats = {
    total: referralAgg.reduce((sum, r) => sum + r.count, 0),
    successful: referralAgg.find((r) => r._id === "rewarded")?.count ?? 0,
    pending: referralAgg.find((r) => r._id === "pending")?.count ?? 0,
    totalRewards: referralAgg.reduce((sum, r) => sum + (r.rewardAmount ?? 0), 0),
  };

  const withdrawalAgg = (await db
    .collection(COLLECTIONS.withdrawals)
    .aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ])
    .toArray()) as AggBucket[];

  const withdrawalStats = {
    pending: withdrawalAgg.find((w) => w._id === "pending")?.count ?? 0,
    approved: withdrawalAgg.find((w) => w._id === "approved")?.count ?? 0,
    paid: withdrawalAgg.find((w) => w._id === "paid")?.count ?? 0,
    rejected: withdrawalAgg.find((w) => w._id === "rejected")?.count ?? 0,
    totalPaid: withdrawalAgg.find((w) => w._id === "paid")?.amount ?? 0,
  };

  const recentPurchases = await db
    .collection(COLLECTIONS.purchases)
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const recentEnrollments = await db
    .collection(COLLECTIONS.subscriptions)
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  return NextResponse.json({
    ok: true,
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
      active: activeUsers,
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      draft: draftCourses,
    },
    revenue: revenueStats,
    purchases: purchaseStats,
    subscriptions: {
      active: activeSubscriptions,
      expired: expiredSubscriptions,
    },
    referrals: referralStats,
    withdrawals: withdrawalStats,
    recentActivity: {
      recentPurchases: recentPurchases.map((p) => ({
        id: String(p._id),
        userId: p.userId ? String(p.userId) : undefined,
        packageName: p.packageName,
        amountPaid: p.amountPaid,
        status: p.status,
        createdAt: p.createdAt,
      })),
      recentEnrollments: recentEnrollments.map((e) => ({
        id: String(e._id),
        userId: e.userId ? String(e.userId) : undefined,
        packageId: e.packageId,
        packageName: e.packageName,
        status: e.status,
        startDate: e.startDate,
        createdAt: e.createdAt,
      })),
    },
  });
}
