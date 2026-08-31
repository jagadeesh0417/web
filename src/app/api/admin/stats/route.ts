import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import {
  seedInitialData,
  usersStore,
  enrollmentsStore,
  paymentsStore,
  certificatesStore,
  submissionsStore,
  applicationsStore,
} from "@/lib/data/server-store";
import type { AppUser, Enrollment, Payment, Certificate, Submission } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const users = usersStore.getAll();
  const enrollments = enrollmentsStore.getAll();
  const payments = paymentsStore.getAll();
  const certificates = certificatesStore.getAll();
  const submissions = submissionsStore.getAll();
  const applications = applicationsStore.getAll();

  const totalStudents = users.filter(
    (u: AppUser) => u.role === "intern" || u.role === "user",
  ).length;
  const activeInterns = enrollments.filter(
    (e: Enrollment) => e.status === "active",
  ).length;
  const totalEnrollments = enrollments.length;
  const pendingPayments = payments.filter(
    (p: Payment) => p.status === "pending",
  ).length;
  const successfulPayments = payments.filter(
    (p: Payment) => p.status === "succeeded",
  ).length;
  const pendingSubmissions = submissions.filter(
    (s: Submission) => s.status === "submitted",
  ).length;
  const completedInternships = enrollments.filter(
    (e: Enrollment) => e.status === "completed",
  ).length;
  const certificatesIssued = certificates.length;
  const totalUsers = users.length;
  const totalApplications = applications.length;

  const recentEnrollments = enrollments
    .slice()
    .sort(
      (a: Enrollment, b: Enrollment) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )
    .slice(0, 5)
    .map((e: Enrollment) => {
      const student = users.find((u: AppUser) => u.id === e.studentId);
      return {
        id: e.id,
        enrollmentId: e.enrollmentId,
        studentName: student?.name ?? "Unknown",
        programTitle: e.programTitle,
        status: e.status,
        startedAt: e.startedAt,
      };
    });

  const recentPayments = payments
    .slice()
    .sort(
      (a: Payment, b: Payment) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const recentCertificates = certificates
    .slice()
    .sort(
      (a: Certificate, b: Certificate) =>
        new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
    )
    .slice(0, 5);

  const now = new Date();
  const revenueByMonth: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    const revenue = payments
      .filter(
        (p: Payment) =>
          p.status === "succeeded" &&
          p.createdAt.slice(0, 7) === monthKey,
      )
      .reduce((sum: number, p: Payment) => sum + p.amount, 0);
    revenueByMonth.push({ month: monthLabel, revenue });
  }

  const usersByRole: Record<string, number> = {};
  for (const u of users) {
    usersByRole[u.role] = (usersByRole[u.role] ?? 0) + 1;
  }

  const enrollmentsByStatus: Record<string, number> = {};
  for (const e of enrollments) {
    enrollmentsByStatus[e.status] = (enrollmentsByStatus[e.status] ?? 0) + 1;
  }

  return NextResponse.json({
    totalStudents,
    activeInterns,
    totalEnrollments,
    pendingPayments,
    successfulPayments,
    pendingSubmissions,
    completedInternships,
    certificatesIssued,
    totalUsers,
    totalApplications,
    recentEnrollments,
    recentPayments,
    recentCertificates,
    revenueByMonth,
    usersByRole,
    enrollmentsByStatus,
  });
}
