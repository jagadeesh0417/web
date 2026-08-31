import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  modulesStore,
  lessonProgressStore,
  tasksStore,
  submissionsStore,
  videosStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;

  const enrollment = enrollmentsStore.findOne(
    (e) => e.userId === auth.user.id,
  );
  if (!enrollment) {
    return NextResponse.json(
      { error: "No enrollment found" },
      { status: 404 },
    );
  }

  const foundModule = modulesStore.getById(id);
  if (!foundModule || foundModule.categorySlug !== enrollment.categorySlug) {
    return NextResponse.json(
      { error: "Module not found" },
      { status: 404 },
    );
  }

  const allModules = modulesStore
    .getAll()
    .filter((m) => m.categorySlug === enrollment.categorySlug)
    .sort((a, b) => a.order - b.order);

  const moduleIdx = allModules.findIndex((m) => m.id === id);

  const userProgress = lessonProgressStore.getByUser(auth.user.id);
  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  let unlocked = true;
  let lockReason: string | undefined;

  if (moduleIdx > 0) {
    const prevModule = allModules[moduleIdx - 1];
    const prevLessonsDone = prevModule.lessons.every((l) =>
      completedLessonIds.has(l.id),
    );
    if (!prevLessonsDone) {
      unlocked = false;
      lockReason = "Complete every lesson in the previous week first.";
    } else if (prevModule.assignmentId) {
      const userSubmissions = submissionsStore.find(
        (s) => s.studentId === auth.user.id,
      );
      const prevSubmission = userSubmissions.find(
        (s) => s.assignmentId === prevModule.assignmentId,
      );
      if (prevSubmission?.status !== "approved") {
        unlocked = false;
        lockReason = "Get the previous week's assignment approved to unlock this module.";
      }
    }
  }

  const lessons = foundModule.lessons.map((lesson) => ({
    ...lesson,
    completed: completedLessonIds.has(lesson.id),
    completedAt:
      userProgress.find((p) => p.lessonId === lesson.id)?.completedAt ?? null,
  }));

  let assignment: Record<string, unknown> | null = null;
  if (foundModule.assignmentId) {
    const task = tasksStore.getById(foundModule.assignmentId);
    const submission = submissionsStore.findOne(
      (s) =>
        s.assignmentId === foundModule.assignmentId &&
        s.studentId === auth.user.id,
    );
    if (task) {
      assignment = {
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
    }
  }

  const videos = videosStore
    .getAll()
    .filter((v) => v.moduleId === id && v.status === "published")
    .sort((a, b) => a.lessonOrder - b.lessonOrder);

  return NextResponse.json({
    module: {
      id: foundModule.id,
      title: foundModule.title,
      order: foundModule.order,
      week: foundModule.week,
      description: foundModule.description,
      categorySlug: foundModule.categorySlug,
      lessons,
      assignment,
      resources: foundModule.resources,
      videos,
      unlocked,
      lockReason,
    },
  });
}
