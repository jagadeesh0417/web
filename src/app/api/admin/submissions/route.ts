import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import {
  seedInitialData,
  submissionsStore,
  usersStore,
  tasksStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim() ?? "";
  const studentId = searchParams.get("studentId")?.trim() ?? "";
  const taskId = searchParams.get("taskId")?.trim() ?? "";

  let submissions = submissionsStore.getAll();

  if (status) {
    submissions = submissions.filter((s) => s.status === status);
  }
  if (studentId) {
    submissions = submissions.filter((s) => s.studentId === studentId);
  }
  if (taskId) {
    submissions = submissions.filter((s) => s.assignmentId === taskId);
  }

  submissions.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  const enriched = submissions.map((sub) => {
    const student = usersStore.getById(sub.studentId);
    const task = tasksStore.getById(sub.assignmentId);
    return {
      ...sub,
      studentName: student?.name ?? "Unknown",
      studentEmail: student?.email ?? "",
      taskTitle: task?.title ?? "Unknown",
    };
  });

  return NextResponse.json(enriched);
}
