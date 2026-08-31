import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import {
  seedInitialData,
  submissionsStore,
  usersStore,
  tasksStore,
  auditLog,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  status: z.enum(["approved", "revision", "rejected"]),
  feedback: z.string().min(1),
  grade: z.string().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const submission = submissionsStore.getById(id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { status, feedback, grade } = parsed.data;
  const now = new Date().toISOString();
  const submissionStatus = status === "approved" ? "approved" : status === "revision" ? "revision" : "reviewed";

  submissionsStore.update(id, {
    status: submissionStatus,
    feedback,
    grade: grade ? Number(grade) : undefined,
    reviewedAt: now,
  });

  auditLog(
    "review_submission",
    "submission",
    `Reviewed submission ${id}: ${status}${grade ? `, grade: ${grade}` : ""}`,
    auth.user.id,
    id,
  );

  const student = usersStore.getById(submission.studentId);
  const task = tasksStore.getById(submission.assignmentId);

  if (student) {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const kind: "approval" | "deadline" | "general" = status === "approved" ? "approval" : status === "revision" ? "deadline" : "general";
    const notif = {
      id: notificationId,
      userId: student.id,
      title: `Submission ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: `Your submission for "${task?.title ?? "Unknown Task"}" has been ${status}.${feedback ? ` Feedback: ${feedback}` : ""}`,
      kind,
      read: false,
      createdAt: now,
    };
    const { notificationsStore } = await import("@/lib/data/server-store");
    notificationsStore.create(notif);
  }

  return NextResponse.json({ success: true, status: submissionStatus });
}
