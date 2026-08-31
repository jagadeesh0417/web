import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, usersStore, enrollmentsStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const users = usersStore.getAll();
  const allEnrollments = enrollmentsStore.getAll();

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Role",
    "Email Verified",
    "Company",
    "Created At",
    "Enrollment Program",
    "Enrollment Status",
  ];

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = users.map((user) => {
    const enrollment = allEnrollments.find(
      (e) => e.userId === user.id || e.studentId === user.id,
    );
    return [
      user.id,
      user.name,
      user.email,
      user.phone ?? "",
      user.role,
      user.emailVerified ? "Yes" : "No",
      user.company ?? "",
      user.createdAt,
      enrollment?.programTitle ?? "",
      enrollment?.status ?? "",
    ]
      .map((v) => escape(String(v)))
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  auditLog(
    "user.export",
    "users",
    `Exported ${users.length} users as CSV`,
    auth.user.id,
  );

  return NextResponse.json({ csv, total: users.length });
}
