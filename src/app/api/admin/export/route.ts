import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import {
  seedInitialData,
  usersStore,
  paymentsStore,
  enrollmentsStore,
  referralsStore,
  withdrawalsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateUsersCSV(): string {
  const users = usersStore.getAll();
  const headers = ["ID", "Name", "Email", "Phone", "Role", "Referral Code", "Wallet Balance", "Created At"];
  const rows = users.map((u) =>
    [
      escapeCSV(u.id),
      escapeCSV(u.name),
      escapeCSV(u.email),
      escapeCSV(u.phone),
      escapeCSV(u.role),
      escapeCSV(u.referralCode),
      escapeCSV(u.walletBalance),
      escapeCSV(u.createdAt),
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function generatePaymentsCSV(): string {
  const payments = paymentsStore.getAll();
  const headers = ["ID", "Order ID", "Email", "Amount", "Status", "Plan", "Method", "Created At"];
  const rows = payments.map((p) =>
    [
      escapeCSV(p.id),
      escapeCSV(p.orderId),
      escapeCSV(p.email),
      escapeCSV(p.amount),
      escapeCSV(p.status),
      escapeCSV(p.plan),
      escapeCSV(p.method),
      escapeCSV(p.createdAt),
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function generateEnrollmentsCSV(): string {
  const enrollments = enrollmentsStore.getAll();
  const headers = [
    "Enrollment ID",
    "Student ID",
    "Email",
    "Program Title",
    "Duration (Weeks)",
    "Price",
    "Status",
    "Created At",
  ];
  const rows = enrollments.map((e) => {
    const user = usersStore.getById(e.userId);
    return [
      escapeCSV(e.enrollmentId),
      escapeCSV(e.studentId),
      escapeCSV(user?.email ?? e.userId),
      escapeCSV(e.programTitle),
      escapeCSV(e.durationWeeks),
      escapeCSV(e.price),
      escapeCSV(e.status),
      escapeCSV(e.startedAt),
    ].join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

function generateReferralsCSV(): string {
  const referrals = referralsStore.getAll();
  const headers = [
    "ID",
    "Referrer ID",
    "Referred User ID",
    "Referral Code",
    "Reward Amount",
    "Status",
    "Created At",
  ];
  const rows = referrals.map((r) =>
    [
      escapeCSV(r.id),
      escapeCSV(r.referrerId),
      escapeCSV(r.referredUserId),
      escapeCSV(r.referralCode),
      escapeCSV(r.rewardAmount),
      escapeCSV(r.status),
      escapeCSV(r.createdAt),
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function generateWithdrawalsCSV(): string {
  const withdrawals = withdrawalsStore.getAll();
  const headers = [
    "ID",
    "User ID",
    "User Name",
    "Amount",
    "Payment Method",
    "Status",
    "Created At",
  ];
  const rows = withdrawals.map((w) =>
    [
      escapeCSV(w.id),
      escapeCSV(w.userId),
      escapeCSV(w.userName),
      escapeCSV(w.amount),
      escapeCSV(w.paymentMethod),
      escapeCSV(w.status),
      escapeCSV(w.createdAt),
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

const EXPORTERS: Record<string, () => string> = {
  users: generateUsersCSV,
  payments: generatePaymentsCSV,
  enrollments: generateEnrollmentsCSV,
  referrals: generateReferralsCSV,
  withdrawals: generateWithdrawalsCSV,
};

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type || !EXPORTERS[type]) {
    return NextResponse.json(
      { error: "Invalid export type. Use: users, payments, enrollments, referrals, or withdrawals" },
      { status: 400 },
    );
  }

  const csv = EXPORTERS[type]();
  const timestamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-export-${timestamp}.csv"`,
    },
  });
}
