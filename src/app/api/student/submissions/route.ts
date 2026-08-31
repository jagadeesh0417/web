import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  tasksStore,
  submissionsStore,
  create,
} from "@/lib/data/server-store";
import { generateId } from "@/lib/utils";
import type { SubmissionLinkType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const userSubmissions = submissionsStore
    .find((s) => s.studentId === auth.user.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const submissionsWithTask = userSubmissions.map((sub) => {
    const task = tasksStore.getById(sub.assignmentId);
    return {
      id: sub.id,
      assignmentId: sub.assignmentId,
      links: sub.links,
      linkType: sub.linkType,
      note: sub.note,
      status: sub.status,
      grade: sub.grade,
      feedback: sub.feedback,
      submittedAt: sub.submittedAt,
      reviewedAt: sub.reviewedAt,
      task: task
        ? {
            id: task.id,
            title: task.title,
            description: task.description,
            categorySlug: task.categorySlug,
            maxScore: task.maxScore,
          }
        : null,
    };
  });

  return NextResponse.json({ submissions: submissionsWithTask });
}

export async function POST(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  let body: {
    assignmentId?: string;
    linkType?: string;
    link?: string;
    comment?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!body.assignmentId || !body.link) {
    return NextResponse.json(
      { error: "assignmentId and link are required" },
      { status: 400 },
    );
  }

  // Validate enrollment
  const enrollment = enrollmentsStore.findOne(
    (e) => e.userId === auth.user.id,
  );
  if (!enrollment) {
    return NextResponse.json(
      { error: "No enrollment found" },
      { status: 404 },
    );
  }

  // Validate assignment belongs to student's category
  const task = tasksStore.getById(body.assignmentId);
  if (!task || task.categorySlug !== enrollment.categorySlug) {
    return NextResponse.json(
      { error: "Assignment not found in your enrolled category" },
      { status: 404 },
    );
  }

  // Check for existing submission — update or create
  const existing = submissionsStore.findOne(
    (s) =>
      s.assignmentId === body.assignmentId &&
      s.studentId === auth.user.id,
  );

  const submission = {
    id: existing?.id ?? generateId("sub"),
    assignmentId: body.assignmentId,
    studentId: auth.user.id,
    links: [body.link],
    linkType: (body.linkType as SubmissionLinkType) ?? "other",
    files: [],
    note: body.comment ?? undefined,
    status: (existing?.status === "approved"
      ? existing.status
      : "submitted") as "submitted" | "reviewed" | "revision" | "approved",
    submittedAt: new Date().toISOString(),
  };

  if (existing) {
    submissionsStore.update(existing.id, submission);
  } else {
    create("submissions", submission);
  }

  return NextResponse.json({
    message: existing
      ? "Submission updated successfully"
      : "Submission created successfully",
    submission,
  });
}
