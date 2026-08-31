import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  tasksStore,
  submissionsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const enrollment = enrollmentsStore.findOne(
    (e) => e.userId === auth.user.id,
  );
  if (!enrollment) {
    return NextResponse.json(
      { error: "No enrollment found" },
      { status: 404 },
    );
  }

  const tasks = tasksStore
    .getAll()
    .filter((t) => t.categorySlug === enrollment.categorySlug);

  const userSubmissions = submissionsStore.find(
    (s) => s.studentId === auth.user.id,
  );

  const tasksWithSubmissions = tasks.map((task) => {
    const submission = userSubmissions.find(
      (s) => s.assignmentId === task.id,
    );
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      deadlineDays: task.deadlineDays,
      maxScore: task.maxScore,
      submissionTypes: task.submissionTypes,
      linkTypes: task.linkTypes,
      status: task.status ?? "open",
      submission: submission
        ? {
            id: submission.id,
            links: submission.links,
            linkType: submission.linkType,
            note: submission.note,
            status: submission.status,
            grade: submission.grade,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt,
            reviewedAt: submission.reviewedAt,
          }
        : null,
    };
  });

  return NextResponse.json({ tasks: tasksWithSubmissions });
}
