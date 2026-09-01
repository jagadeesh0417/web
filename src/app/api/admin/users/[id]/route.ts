import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import {
  seedInitialData,
  usersStore,
  enrollmentsStore,
  paymentsStore,
  certificatesStore,
  submissionsStore,
  assessmentAttemptsStore,
  lessonProgressStore,
  referralsStore,
  walletTransactionsStore,
  withdrawalsStore,
  auditLog,
} from "@/lib/data/server-store";
import type { Role } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES: Role[] = ["guest", "user", "client", "applicant", "intern", "mentor", "employee", "admin", "super_admin"];

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  company: z.string().trim().max(200).optional(),
  role: z.enum(ROLES as [string, ...string[]]).optional(),
  emailVerified: z.boolean().optional(),
  avatarUrl: z.string().url().optional().nullable(),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const user = usersStore.getById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const enrollments = enrollmentsStore.find(
    (e) => e.userId === id || e.studentId === id,
  );
  const payments = paymentsStore.find((p) => p.userId === id || p.studentId === id);
  const certificates = certificatesStore.find((c) => c.studentId === id);
  const submissions = submissionsStore.find((s) => s.studentId === id);
  const assessmentAttempts = assessmentAttemptsStore.find((a) => a.userId === id);
  const lessonProgress = lessonProgressStore.getByUser(id);
  const referrals = referralsStore.find((r) => r.referrerId === id);
  const referredByReferral = referralsStore.findOne((r) => r.referredUserId === id);
  const walletTransactions = walletTransactionsStore.find((w) => w.userId === id);
  const withdrawals = withdrawalsStore.find((w) => w.userId === id);

  const referredByName = referredByReferral
    ? usersStore.getById(referredByReferral.referrerId)?.name ?? null
    : null;

  return NextResponse.json({
    user,
    enrollments,
    payments,
    certificates,
    submissions,
    assessmentAttempts,
    lessonProgress,
    referrals,
    referredByName,
    walletTransactions,
    withdrawals,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const user = usersStore.getById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(json);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const data = parsed.data;
  const patch: Record<string, unknown> = {};

  if (data.name !== undefined) patch.name = data.name;
  if (data.phone !== undefined) patch.phone = data.phone;
  if (data.company !== undefined) patch.company = data.company;
  if (data.role !== undefined) patch.role = data.role;
  if (data.emailVerified !== undefined) patch.emailVerified = data.emailVerified;
  if (data.avatarUrl !== undefined) patch.avatarUrl = data.avatarUrl;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = usersStore.update(id, patch as Partial<typeof user>);
  if (!updated) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  auditLog(
    "user.update",
    "users",
    `Updated fields: ${Object.keys(patch).join(", ")}`,
    auth.user.id,
    id,
  );

  return NextResponse.json({ user: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const user = usersStore.getById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = usersStore.update(id, { role: "guest" } as Partial<typeof user>);
  if (!updated) {
    return NextResponse.json({ error: "Failed to deactivate user" }, { status: 500 });
  }

  auditLog(
    "user.delete",
    "users",
    `Soft-deleted user: ${user.name} (${user.email})`,
    auth.user.id,
    id,
  );

  return NextResponse.json({ success: true, message: "User deactivated" });
}
